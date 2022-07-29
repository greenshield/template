const { SmartphoneOutlined } = require("@mui/icons-material");
const express = require("express");
const { read } = require("fs");
const router = express.Router();
const Moment = require("moment-timezone");
util = require("util");
var mongodb = require("mongodb");
var objectID = mongodb.ObjectID;
const nodemailer = require("nodemailer");

module.exports = function (app) {
  router.post("/signoutall", async (req, res) => {
    var criteria = { token: req.body.token };

    let user = await app.db.collection("users").findOne(criteria);

    if (!user) {
      criteria = { uuid: req.body.token, status: "active" };
      var token = await app.db.collection("tokens").findOne(criteria);

      if (token) {
        criteria = { _id: token.user };
        user = await app.db.collection("users").findOne(criteria);
      }
    }

    var updates = { $set: { status: "revoked" } };

    await app.db.collection("tokens").updateMany({ user: user._id }, updates);
    await app.tools.update(user._id, { token: app.tools.uuidv4() }, "users");

    res.send({ status: "signed out" });
  });

  router.post("/signin", async (req, res) => {
    var criteria = { email: { $regex: req.body.email, $options: "i" } };

    async function checkCurrentPassword(u, p) {
      if (!u.password) {
        return true;
      } else {
        let compared = await app.tools.bcrypt.compare(p, u.password);
        return compared;
      }
    }

    async function getUser() {
      if (
        !app.tools.emailIsValid(req.body.email) &&
        req.body.email !== process.env.REACT_APP_SHORTNAME &&
        req.body.email !== "admin"
      ) {
        var phone_number = app.tools.phone_number_only(req.body.email);

        if (phone_number && phone_number.indexOf("+1") === 0) {
          phone_number = phone_number.substring(2);
        }

        if (phone_number && phone_number.indexOf("1") === 0) {
          phone_number = phone_number.substring(1);
        }

        credential_type = "phone_number";

        criteria = {
          $or: [
            { phone_number: phone_number },
            { phone_number: "+1" + phone_number },
            { phone_number: "+" + phone_number },
          ],
        };
      }

      let user = await app.db.collection("users").findOne(criteria);

      if (user) {
        return app.tools.hash(req.body.password).then((hashed) => {
          return checkCurrentPassword(user, req.body.password).then((match) => {
            if (match) {
              return user;
            } else {
              return false;
            }
          });
        });
      } else {
        return false;
      }
    }

    getUser().then(async (data) => {
      if (data) {
        var uuid = app.tools.uuidv4();

        data.new_token = uuid;

        var user_update = { token: uuid };

        await app.tools.update(data._id, user_update, "users");

        var docs = [
          {
            uuid: uuid,
            user: data._id,
            status: "active",
          },
        ];

        await app.tools.insert(docs, "tokens");

        delete data.password;

        res.send({
          ...data,
          status: data ? data.status : null,
          token: data.new_token,
        });
      } else {
        res.send({ ...data, status: data ? data.status : null });
      }
    });
  });

  router.post("/signup", async (req, res) => {
    var requestedUrl = req.protocol + "://" + req.get("Host");

    if (req.body.email) {
      req.body.email = req.body.email.trim().toLowerCase();
    }

    var credential_type = "email";

    var phone_number = req.body.email.trim();

    var us = false;
    var other = false;
    var us_number = null;

    if (phone_number && phone_number.indexOf("+1") === 0) {
      phone_number = phone_number.substring(2);
      us_number =
        phone_number.substring(2).toString().length === 10
          ? phone_number.substring(2).toString()
          : null;
      phone_number = "1" + phone_number;
      us = true;
    } else if (phone_number && phone_number.indexOf("1") === 0) {
      phone_number = phone_number;
      us_number = phone_number.substring(1);
      us_number =
        phone_number.substring(1).toString().length === 10
          ? phone_number.substring(1).toString()
          : null;
      us = true;
    } else if (phone_number && phone_number.indexOf("+") === 0) {
      phone_number = phone_number.substring(1);
      other = true;
    }

    var cred_string = us
      ? "+" + app.tools.phone_number_only(phone_number)
      : other
      ? "+" + app.tools.phone_number_only(phone_number)
      : "+1" + app.tools.phone_number_only(phone_number);

    async function getUser() {
      var ret = {};

      var criteria = { email: req.body.email };

      if (!app.tools.emailIsValid(req.body.email.trim())) {
        if (cred_string.length !== 12) {
          return "Invalid phone number or email address";
        }

        credential_type = "phone_number";
        criteria = {
          $or: [{ phone_number: cred_string }],
        };
      }

      let user = await app.db.collection("users").findOne(criteria);

      return user;
    }

    getUser()
      .then((exists) => {
        if (exists) {
          if (exists === true) {
            return Promise.reject("Account address already exists");
          } else {
            return Promise.resolve(exists);
          }
        } else {
          return app.tools.hash(req.body.password);
        }
      })
      .then(async (hashed) => {
        var uuid = app.tools.uuidv4();
        var verify_email_uuid = app.tools.uuidv4();

        var verified_email_token = app.tools.code().toString();

        var updated_at = Moment().valueOf();

        var new_user = {
          password: hashed,
          token: uuid,
          verified_email: false,
          verified_email_token_link: verify_email_uuid,
          verified_email_token: verified_email_token,
          mode: "dark",
          status: "active",
          uuid: app.tools.uuidv4(),
          updated_at: updated_at,
        };

        if (credential_type === "phone_number") {
          var verified_phone_token = app.tools.code().toString();
          var verified_phone_token_link = app.tools.uuidv4();

          new_user.verified_phone_token_link = verified_phone_token_link;
          new_user.verified_phone_token = verified_phone_token;
          new_user.verified_phone = false;
        }

        var credential_format =
          credential_type === "email" ? req.body.email : cred_string;

        new_user[credential_type] = credential_format;

        let encrypted = await app.tools.hash(req.body.password);
        new_user.password = encrypted;

        var docs = [new_user];

        return app.tools.insert(docs, "users").then((result) => {
          if (credential_type === "email") {
            var message = {
              from:
                process.env.REACT_APP_NAME +
                " <" +
                process.env.REACT_APP_SMTP_EMAIL_ADDRESS +
                ">",
              to: req.body.email,
              subject: "Verify your email",
              text:
                `Here is your ` +
                process.env.REACT_APP_NAME +
                ` verification link: ` +
                requestedUrl +
                "/verify/" +
                verify_email_uuid,
              html:
                `Here is your ` +
                process.env.REACT_APP_NAME +
                ` verification Link: ` +
                requestedUrl +
                "/verify/" +
                verify_email_uuid,
            };

            //app.tools.transporter.sendMail(message)
          } else if (credential_type === "phone_number") {
            var bodyData = {
              From: process.env.REACT_APP_PHONE_STRING,
              To: new_user[credential_type],
              Body:
                "Your " +
                process.env.REACT_APP_NAME +
                " verification code is: " +
                new_user.verified_phone_token,
            };

            //var send = app.carriers['twilio'].send(accountSid,authToken,bodyData)
          }

          return new_user;
        });
      })
      .then(async (user) => {
        var docs = [
          {
            uuid: user.token,
            user: user._id,
            status: "active",
          },
        ];

        await app.tools.insert(docs, "tokens");

        delete user.password;

        res.send(user);
      })
      .catch((err) => {
        console.log(err);
        res.send({ error: err });
      });
  });

  router.post("/search", async (req, res) => {
    var query = req.body.query;

    var search_term = query.search_term ? query.search_term : "";
    var page = query.page ? query.page : 0;

    var ret = {};

    var match = {};

    var ors = [];

    var fields = ["name", "_id"];

    ors = [
      {
        name: {
          $regex: new RegExp(".*" + search_term + ".*"),
          $options: "i",
        },
      },
    ];

    var ands = [];
    if (!req.body.deleted) {
      ands.push({ deleted: { $nin: [true] } });
    }

    ands.push({ $or: ors });

    match["$and"] = ands;

    var base_filter = [
      {
        $match: match,
      },
    ];

    base_filter.push({ $sort: { insert_stamp: -1 } });

    var total_filter = base_filter.concat([{ $count: "total" }]);

    var count_up = page * 10;
    var lim = 10 + count_up;

    var pagination = req.body.query.pagination;

    var data_filter = base_filter.concat([
      {
        $limit: pagination && pagination.limit ? pagination.limit : lim,
      },
      {
        $skip: pagination && pagination.skip ? pagination.skip : count_up,
      },
    ]);

    var filter = [
      {
        $facet: {
          data: data_filter,
          total: total_filter,
        },
      },
    ];

    return app.db
      .collection("users")
      .aggregate(filter)
      .toArray()
      .then((user_list) => {
        var ret = {};
        ret.data = user_list[0].data;
        ret.total = user_list[0].total.length ? user_list[0].total[0].total : 0;

        res.send(ret);
      })
      .catch((err) => {});
  });

  router.post("/load", async (req, res) => {
    var criteria = { token: req.body.token };

    if (req.body.resetToken && !req.body.token) {
      criteria = { resetToken: req.body.resetToken };
    }

    async function getUser() {
      let user = await app.db.collection("users").findOne(criteria);

      if (!user && !req.body.resetToken) {
        criteria = { uuid: req.body.token, status: "active" };
        var token = await app.db.collection("tokens").findOne(criteria);

        if (token) {
          criteria = { _id: token.user };
          user = await app.db.collection("users").findOne(criteria);
        }

        if (user) {
          return user;
        }
      }

      if (user && req.body.resetToken) {
        if (user.resetToken !== req.body.resetToken) {
          return "invalid reset link";
        } else {
          return user;
        }
      }

      if (user) {
        return user;
      }

      if (req.body.resetToken) {
        return { status: "error", message: "invalid reset link" };
      } else {
        return { status: "signedout", message: "You have been signed out" };
      }
    }

    getUser().then(async (data) => {
      if (data === "invalid reset link") {
        res.send({ status: "error", message: data });
        return false;
      }

      if (data) {
        delete data.password;

        res.send({
          ...data,
          status: data ? data.status : null,
          token: req.body.token ? req.body.token : data.token,
          auto: !req.body.resetToken,
        });
      } else {
        res.send({ ...data, status: data ? data.status : null });
      }
    });
  });

  router.post("/change", (req, res) => {
    async function getUser() {
      var ret = {};

      if (req.body.resetToken) {
        var criteria = { resetToken: req.body.resetToken };
      } else {
        criteria = { token: req.body.token };
      }

      let user = await app.db.collection("users").findOne(criteria);

      if (!user) {
        var criteria = { uuid: req.body.token, status: "active" };
        var token = await app.db.collection("tokens").findOne(criteria);

        if (token) {
          criteria = { _id: token.user };
          user = await app.db.collection("users").findOne(criteria);
        }
      }

      return user;
    }

    async function checkCurrentPassword(newPassword, oldPassword) {
      if (req.body.resetToken) {
        return true;
      }
      let compared = await app.tools.bcrypt.compare(newPassword, oldPassword);
      return compared;
    }

    getUser()
      .then((data) => {
        return app.tools.hash(req.body.password).then((hashed) => {
          data.new_password = hashed;

          return data;
        });
      })
      .then((data) => {
        return checkCurrentPassword(req.body.old_password, data.password).then(
          (check) => {
            if (check || req.body.parent_override) {
              return data;
            } else {
              return Promise.reject("Old password does not match");
            }
          }
        );
      })
      .then((data) => {
        return app.tools.update(
          data._id,
          { password: data.new_password },
          "users"
        );
      })
      .then((result) => {
        res.send({
          severity: "success",
          message: "Password successfully changed",
        });
      })
      .catch((err) => {
        res.send({ severity: "error", message: err });
      });
  });

  router.post("/forgot", (req, res) => {
    var requestedUrl = req.protocol + "://" + req.get("Host");

    var reset_type = "email";

    async function getUser() {
      var ret = {};

      if (!app.tools.emailIsValid(req.body.email)) {
        reset_type = "phone_number";

        var phone_number = app.tools.phone_number_only(req.body.email);

        if (phone_number && phone_number.indexOf("+1") === 0) {
          phone_number = phone_number.substring(2);
        }

        if (phone_number && phone_number.indexOf("1") === 0) {
          phone_number = phone_number.substring(1);
        }
      }

      if (req.body.token) {
        var match = { token: req.body.token };
      } else if (phone_number) {
        match = {
          $or: [
            { phone_number: phone_number },
            { phone_number: "+1" + phone_number },
            { phone_number: "+" + phone_number },
          ],
        };
      } else {
        match = { email: req.body.email };
      }

      let user = await app.db.collection("users").findOne(match);

      return user;
    }

    getUser()
      .then((data) => {
        var uuid = app.tools.uuidv4();

        data.resetToken = uuid;

        return data;
      })
      .then((u) => {
        return app.tools
          .update(
            u._id,
            { resetToken: u.resetToken, compareResetToken: u.resetToken },
            "users"
          )
          .then((updated) => {
            return u;
          });
      })
      .then((u) => {
        requestedUrl = "https://" + process.env.REACT_APP_DOMAIN;

        var text_link =
          `Your ` +
          process.env.REACT_APP_NAME +
          ` verification code is: ` +
          u.verified_phone_token +
          ` or visit ` +
          requestedUrl +
          `/reset/` +
          u.resetToken;

        var message = {
          from:
            process.env.REACT_APP_NAME +
            " <" +
            process.env.REACT_APP_SMTP_EMAIL_ADDRESS +
            ">",
          to: req.body.email,
          subject: "Reset your password",
          text:
            `Here is your ` +
            process.env.REACT_APP_NAME +
            ` password reset Link: ` +
            requestedUrl +
            `/reset/` +
            u.resetToken,
          html:
            `Here is your ` +
            process.env.REACT_APP_NAME +
            ` password reset Link:<br /><br />` +
            requestedUrl +
            `/reset/` +
            u.resetToken,
        };

        if (reset_type === "email" && app.tools.emailIsValid(req.body.email)) {
          //app.tools.transporter.sendMail(message)
        } else if (reset_type === "phone_number") {
          var bodyData = {
            From: process.env.REACT_APP_PHONE_STRING,
            To: u.phone_number,
            Body: text_link,
          };
          //var send = app.carriers["twilio"].send(bodyData, true);
        }

        res.send({
          status: true,
        });
      })
      .catch((err) => {
        res.send({ error: "Account does not exist" });
      });
  });

  router.post("/reset", (req, res) => {
    async function getUser() {
      var ret = {};

      let user = await app.db
        .collection("users")
        .findOne({ compareResetToken: req.body.resetToken });

      return user;
    }

    getUser()
      .then((data) => {
        return app.tools.hash(req.body.password).then((hashed) => {
          data.password = hashed;
          return data;
        });
      })
      .then((user) => {
        var uuid_0 = app.tools.uuidv4();
        var uuid_1 = app.tools.uuidv4();

        return app.tools
          .update(
            user._id,
            {
              password: user.password,
              resetToken: uuid_0,
              compareResetToken: uuid_1,
            },
            "users"
          )
          .then((result) => {
            return user;
          });
      })
      .then((user) => {
        delete user.password;
        delete user.resetToken;
        delete user.compareResetToken;

        res.send(user);
      })
      .catch((err) => {
        res.send({ error: "Account does not exist" });
      });
  });

  router.post("/verify", (req, res) => {
    async function getUser() {
      var ret = {};

      let user = await app.db
        .collection("users")
        .findOne({ verified_email_token_link: req.body.verifyToken });

      return user;
    }

    getUser()
      .then((data) => {
        if (!data) {
          return Promise.reject("Invalid verification link");
        } else {
          delete data.password;

          return data;
        }
      })
      .then((data) => {
        if (req.body.removeToken) {
          var uuid = app.tools.uuidv4();

          return app.tools
            .update(
              data._id,
              { verified_email_token_link: uuid, verified_email: true },
              "users"
            )
            .then((result) => {
              return data;
            });
        } else {
          return app.tools
            .update(data._id, { verified_email: true }, "users")
            .then((result) => {
              return data;
            });
        }
      })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send({ error: err });
      });
  });

  router.post("/verifyphone", (req, res) => {
    async function getUser() {
      var ret = {};

      let user = await app.db
        .collection("users")
        .findOne({ verified_phone_token_link: req.body.verifyToken });

      return user;
    }

    getUser()
      .then((data) => {
        if (!data) {
          return Promise.reject("Invalid verification link");
        } else {
          delete data.password;

          return data;
        }
      })
      .then((data) => {
        var updates = {
          verified_phone: true,
        };

        if (req.body.removeToken) {
          var uuid = app.tools.uuidv4();
          updates.verified_phone_token_link = uuid;
        }

        return app.tools.update(data._id, updates, "users").then((result) => {
          return data;
        });
      })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send({ error: err });
      });
  });

  router.post("/verifycode", (req, res) => {
    async function getUser() {
      var ret = {};

      let user = await app.db.collection("users").findOne({
        token: req.body.token,
        verified_phone_token: req.body.code,
      });

      if (!user) {
        var criteria = { uuid: req.body.token, status: "active" };
        var token = await app.db.collection("tokens").findOne(criteria);

        if (token) {
          criteria = { _id: token.user, verified_phone_token: req.body.code };
          user = await app.db.collection("users").findOne(criteria);
        }
      }

      return user;
    }

    getUser()
      .then((data) => {
        if (!data) {
          return Promise.reject("Invalid verification link");
        } else {
          delete data.password;

          return data;
        }
      })
      .then((data) => {
        if (req.body.removeToken) {
          var uuid = app.tools.uuidv4();
          var code = app.tools.code();

          return app.tools
            .update(
              data._id,
              {
                verified_phone_token_link: uuid,
                verified_phone_token: code.toString(),
                verified_phone: true,
              },
              "users"
            )
            .then((result) => {
              data.verified_phone_token = code;
              data.verified_phone = true;
              data.verified_phone_token_link = uuid;
              return data;
            });
        } else {
          return data;
        }
      })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send({ severity: "error", message: "Invalid Code" });
      });
  });

  router.post("/verifyemailcode", (req, res) => {
    async function getUser() {
      var ret = {};

      let user = await app.db.collection("users").findOne({
        token: req.body.token,
        verified_email_token: req.body.code,
      });

      if (!user) {
        var criteria = { uuid: req.body.token, status: "active" };
        var token = await app.db.collection("tokens").findOne(criteria);

        if (token) {
          criteria = { _id: token.user };
          criteria = { _id: token.user, verified_phone_token: req.body.code };
        }
      }

      return user;
    }

    getUser()
      .then((data) => {
        if (!data) {
          return Promise.reject("Invalid verification link");
        } else {
          delete data.password;

          return data;
        }
      })
      .then((data) => {
        if (req.body.removeToken) {
          var uuid = app.tools.uuidv4();
          var code = app.tools.code().toString();

          return app.tools
            .update(
              data._id,
              {
                verified_email_token_link: uuid,
                verified_email_token: code,
                verified_email: true,
              },
              "users"
            )
            .then((result) => {
              data.verified_email_token = code;
              data.verified_email = true;
              data.verified_email_token_link = uuid;
              return data;
            });
        } else {
          return data;
        }
      })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send({ severity: "error", message: "Invalid Code" });
      });
  });

  router.post("/reverify", (req, res) => {
    async function getUser() {
      var ret = {};

      let user = await app.db
        .collection("users")
        .findOne({ token: req.body.token });

      if (!user) {
        var criteria = { uuid: req.body.token, status: "active" };
        var token = await app.db.collection("tokens").findOne(criteria);

        if (token) {
          criteria = { _id: token.user };
          user = await app.db.collection("users").findOne(criteria);
        }
      }

      return user;
    }

    if (req.body.field === "email") {
      var verified_email_token_link = app.tools.uuidv4();

      var verified_email_token = app.tools.code().toString();

      var updates = {
        verified_email_token_link: verified_email_token_link,
        verified_email_token: verified_email_token.toString(),
        verified_email: false,
      };
    } else if (req.body.field === "phone_number") {
      var verified_phone_token = app.tools.code().toString();
      var verified_phone_token_link = app.tools.uuidv4();

      updates = {
        verified_phone_token: verified_phone_token,
        verified_phone_token_link: verified_phone_token_link,
        verified_phone: false,
      };
    }

    getUser().then((data) => {
      app.tools
        .update(data._id, updates, "users")
        .then((result) => {
          var requestedUrl = req.protocol + "://" + req.get("Host");

          requestedUrl = "https://" + process.env.REACT_APP_DOMAIN;

          if (req.body.field === "email") {
            var message = {
              from:
                process.env.REACT_APP_NAME +
                " <" +
                process.env.REACT_APP_EMAIL +
                ">",
              to: data.email,
              subject: "Verify your email",
              text:
                `Here is your ` +
                process.env.REACT_APP_NAME +
                ` email verification code: 
                            ` +
                verified_email_token +
                `
                             
                            ` +
                `Enter the code in your dashboard or visit the following link: 
                            ` +
                requestedUrl +
                "/verify/" +
                verified_email_token_link,
              html:
                `Here is your ` +
                process.env.REACT_APP_NAME +
                ` email verification code:<br />` +
                verified_email_token +
                `<br /><br />` +
                `Enter the code in your dashboard or visit the following link:<br />` +
                requestedUrl +
                "/verify/" +
                verified_email_token_link,
            };
            //app.tools.transporter.sendMail(message)
          }

          if (req.body.field === "phone_number") {
            var bodyData = {
              From: process.env.REACT_APP_PHONE_STRING,
              To: data.phone_number,
              Body:
                "Your " +
                process.env.REACT_APP_NAME +
                " verification code is: " +
                updates.verified_phone_token +
                " or visit https://" +
                process.env.REACT_APP_DOMAIN +
                "/verifyphone/" +
                updates.verified_phone_token_link,
            };

            //var send = app.carriers["twilio"].send(bodyData, true);
          }

          res.send({ severity: "success", message: "Verification Sent" });
        })
        .catch((err) => {
          res.send({ severity: "error", message: err });
        });
    });
  });

  router.post("/update", (req, res) => {
    async function getUser() {
      var ret = {};

      let user = await app.db
        .collection("users")
        .findOne({ token: req.body.token });

      if (!user) {
        var criteria = { uuid: req.body.token, status: "active" };
        var token = await app.db.collection("tokens").findOne(criteria);

        if (token) {
          criteria = { _id: token.user };
          user = await app.db.collection("users").findOne(criteria);
        }
      }

      return user;
    }

    async function checkDuplicate(u) {
      var ret = {};

      var ors = [];

      if (!req.body.email && !req.body.phone_number) {
        return { empty: true };
      }

      if (req.body.email) {
        ors.push({ email: req.body.email });
      }

      if (req.body.phone_number) {
        ors.push({ phone_number: req.body.phone_number });
      }

      let check = await app.db.collection("users").findOne({
        _id: { $ne: u._id },
        $or: ors,
      });

      return check;
    }

    var tc = null;

    getUser()
      .then((data) => {
        return checkDuplicate(data).then((exists) => {
          if (exists) {
            var error = "Duplicate info";

            if (exists.empty) {
              error = "Your information cannot be left blank";
            }

            if (
              req.body.phone_number &&
              req.body.phone_number === exists.phone_number
            ) {
              error = "That phone number number already exists";
            }

            if (req.body.email && req.body.email === exists.email) {
              error = "That email address already exists";
            }

            return Promise.reject(error);
          } else {
            return data;
          }
        });
      })
      .then((data) => {
        var verified_phone_number =
          req.body.phone_number !== data.phone_number
            ? false
            : data.verified_phone === true
            ? true
            : false;

        var verified_email =
          req.body.email !== data.email
            ? false
            : data.verified_email === true
            ? true
            : false;

        if (req.body.phone_number) {
          var us = false;
          var other = false;
          var us_number = null;

          var phone_number = req.body.phone_number;

          if (phone_number && phone_number.indexOf("+1") === 0) {
            phone_number = phone_number.substring(2);
            us_number =
              phone_number.substring(2).toString().length === 10
                ? phone_number.substring(2).toString()
                : null;
            phone_number = "1" + phone_number;
            us = true;
          } else if (phone_number && phone_number.indexOf("1") === 0) {
            phone_number = phone_number;
            us_number = phone_number.substring(1);
            us_number =
              phone_number.substring(1).toString().length === 10
                ? phone_number.substring(1).toString()
                : null;
            us = true;
          } else if (phone_number && phone_number.indexOf("+") === 0) {
            phone_number = phone_number.substring(1);
            other = true;
          }

          var cred_string = us
            ? "+" + app.tools.phone_number_only(phone_number)
            : other
            ? "+" + app.tools.phone_number_only(phone_number)
            : "+1" + app.tools.phone_number_only(phone_number);
        }

        return app.tools.update(
          data._id,
          {
            email: req.body.email,
            verified_email: verified_email,
            verified_phone: verified_phone_number,
            phone_number: cred_string ? cred_string : "",
          },
          "users"
        );
      })
      .then((result) => {
        res.send({
          severity: "success",
          message: "Profile updated",
        });
      })
      .catch((err) => {
        res.send({ severity: "error", message: err });
      });
  });

  router.post("/socket", (req, res) => {
    async function getUser() {
      var ret = {};

      let user = await app.db
        .collection("users")
        .findOne({ token: req.body.token });

      if (!user) {
        criteria = { uuid: req.body.token, status: "active" };
        var token = await app.db.collection("tokens").findOne(criteria);

        if (token) {
          criteria = { _id: token.user };
          user = await app.db.collection("users").findOne(criteria);
        }
      }

      return user;
    }

    var isAuto = req.body.auto ? true : false;

    getUser()
      .then((u) => {
        return app.tools
          .update(u._id, { socket_id: req.body.socket, auto: null }, "users")
          .then((updated) => {
            return u;
          });
      })
      .then(async (u) => {
        res.send({
          status: true,
        });

        if (u && req.body.auto) {
          var msg = "Welcome back!";

          if (u.name && u.name.length) {
            msg = "Welcome back, " + u.name + "!";
          }

          /*
          app.emitMessage(
            app.sox[req.body.socket],
            {
              open: true,
              severity: "info",
              message: msg,
              vertical: "bottom",
              horizontal: "center",
              no_alert: true,
            },
            "alert"
          );
       */

          if (req.body.socket) {
            var notifications = await app.db
              .collection("notifications")
              .find({ user: u._id, status: "unread" })
              .limit(20)
              .toArray();

            var _sockets = [];
            notifications.forEach((n, i) => {
              var _n = Object.assign({}, n);
              _n.confirm = _n._id.toString();
              delete _n.user;
              delete _n._id;
              _sockets.push(_n);
            });

            app.emitMessage(app.sox[req.body.socket], _sockets, "alerts");
          }
        }
      })
      .catch((err) => {
        console.log(err);
        res.send({ error: "Account does not exist" });
      });
  });

  router.post("/testsocket", (req, res) => {
    app.emitMessage(
      app.sox[req.body.socket],
      {
        open: true,
        severity: "info",
        message: "socket test from server @" + Moment().valueOf(),
        no_alert: false,
      },
      "alert"
    );

    res.send("tested");
  });

  return router;
};
