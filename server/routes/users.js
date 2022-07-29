const express = require("express");
const router = express.Router();
const Moment = require("moment-timezone");
util = require("util");
var mongodb = require("mongodb");
var objectID = mongodb.ObjectId;
var axios = require("axios");

module.exports = function (app) {
  router.post("/add", async (req, res) => {
    var user = {
      name: req.body.name,
      email: req.body.email,
    };
    app.tools.insert([user], "users", {}).then((result) => {
      res.send({ message: "added", _id: result.insertedIds["0"] });
    });
  });

  router.post("/search", async (req, res) => {
    var query = req.body.query;

    var search_term = query.search_term ? query.search_term : "";
    var page = query.page ? query.page : 0;

    var ret = {};

    var match = {};

    var ors = [];

    var fields = ["email", "phone_number", "name"];

    if (req.body.query.search_term) {
      fields.forEach((f, fi) => {
        var ands = [];

        var search_terms = req.body.query.search_term.trim().split(" ");

        search_terms.forEach((v, i) => {
          var sub_and = {};
          sub_and[[f]] = {
            $regex: new RegExp(".*" + v + ".*"),
            $options: "i",
          };

          ands.push(sub_and);
        });

        ors.push({ $and: ands });
      });
    }

    var ands = [];
    if (!req.body.deleted) {
      ands.push({ deleted: { $nin: [true] } });
    }

    if (ors.length) {
      ands.push({ $or: ors });
    }

    if (ands.length) {
      match["$and"] = ands;
    }

    var base_filter = [
      {
        $match: match,
      },
    ];

    base_filter.push({ $sort: { name: 1 } });

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

  router.post("/delete", async (req, res) => {
    var user = {
      _id: objectID(req.body._id),
    };
    app.db
      .collection("users")
      .deleteOne({ _id: user._id })
      .then((result) => {
        res.send({ message: "deleted" });
      });
  });

  router.post("/soft", async (req, res) => {
    var user = {
      _id: objectID(req.body._id),
    };
    app.db
      .collection("users")
      .updateOne(
        { _id: user._id },
        {
          $set: {
            deleted: true,
          },
        }
      )
      .then((result) => {
        res.send({ message: "User marked as deleted", severity: "success" });
      });
  });

  router.post("/update", async (req, res) => {
    var user = {
      _id: objectID(req.body._id),
    };
    app.db
      .collection("users")
      .updateOne(
        { _id: user._id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
          },
        }
      )
      .then((result) => {
        res.send({
          message: "User updated",
          severity: "success",
          status: "updated",
        });
      });
  });

  router.post("/list", async (req, res) => {
    //await app.tools.sleep(2500)
    var ret = {};

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

    async function getUsers(_id, data) {
      var ret = {};

      var match = {};

      var ors = [];

      var fields = ["email", "phone_number", "name"];

      fields.forEach((f, fi) => {
        var ands = [];

        if (req.body.filter.search_term) {
          var search_terms = req.body.filter.search_term.trim().split(" ");

          search_terms.forEach((v, i) => {
            var sub_and = {};
            sub_and[[f]] = {
              $regex: new RegExp(".*" + v + ".*"),
              $options: "i",
            };

            ands.push(sub_and);
          });
        }

        ors.push({ $and: ands });
      });

      if (req.body.filter.search_term) {
        match["$and"] = [
          {
            $or: ors,
          },
        ];
      }

      if (req.body.filter.status) {
        if (match["$and"]) {
          match["$and"].push({ status: req.body.filter.status });
        } else {
          match["$and"] = [{ status: req.body.filter.status }];
        }
      }

      if (!req.body.query || !req.body.query.deleted) {
        if (match["$and"]) {
          match["$and"].push({ deleted: { $nin: [true] } });
        } else {
          match["$and"] = [{ deleted: { $nin: [true] } }];
        }
      }

      var base_filter = [];

      base_filter.push({
        $project: {
          email: { $ifNull: ["$email", ""] },
          name: { $ifNull: ["$name", ""] },
          phone_number: { $ifNull: ["$phone_number", ""] },
          status: { $ifNull: ["$status", ""] },
          deleted: { $ifNull: ["$deleted", false] },
        },
      });
      base_filter.push({
        $match: match,
      });

      if (req.body.filter.order_by) {
        var sort = {};
        sort[req.body.filter.order_by] =
          req.body.filter.order_direction === "asc" ? 1 : -1;
        base_filter.push({ $sort: sort });
      } else {
        base_filter.push({ $sort: { name: 1, _id: 1 } });
      }

      if (req.body.filter.search_term) {
        var and = {};
      }

      var total_filter = base_filter.concat([{ $count: "total" }]);
      var data_filter = base_filter.concat([
        {
          $limit: req.body.filter.pagination.limit,
        },
        {
          $skip: req.body.filter.pagination.skip,
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
        .aggregate(filter, { collation: { locale: "en" } })
        .toArray()
        .then((message_list) => {
          return message_list[0];
        });
    }

    getUser().then((data) => {
      getUsers(data._id, data).then((users) => {
        if (users.total[0]) {
          ret.total = users.total[0].total;
        } else {
          ret.total = 0;
        }

        var rows = [];

        var cols = [];

        cols.push({
          Header: "Name",
          label: "Name",
          accessor: "name",
          id: "name",
          disablePadding: false,
          numeric: false,
          padding: "none",
          align: "left",
        });
        cols.push({
          Header: "Email",
          label: "Email",
          accessor: "email",
          id: "email",
          disablePadding: false,
          numeric: false,
          align: "left",
        });
        cols.push({
          Header: "Phone",
          label: "Phone",
          accessor: "phone_number",
          id: "phone_number",
          disablePadding: false,
          numeric: false,
          align: "left",
          default: "none",
        });
        cols.push({
          Header: "Status",
          label: "Status",
          accessor: "status",
          id: "status",
          disablePadding: false,
          numeric: false,
          align: "right",
        });

        users.data.forEach(function (user, index) {
          var new_user = {};
          new_user._id = user._id.toString();
          new_user.name = user.name;
          new_user.phone_number = user.phone_number;
          new_user.email = user.email;
          new_user.token = user.token;
          new_user.status = user.status;
          new_user.deleted = user.deleted;

          rows.push(new_user);
        });

        var response = {
          columns: cols,
          rows: rows,
          total: ret.total,
        };

        if (req.body.download) {
          app.tools.push(cols, rows, res, "report.csv");
        } else {
          res.send(response);
        }
      });
    });
  });

  router.post("/mode", (req, res) => {
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

    getUser()
      .then((u) => {
        return app.tools
          .update(u._id, { mode: req.body.mode }, "users")
          .then((updated) => {
            return u;
          });
      })
      .then((u) => {
        res.send({
          status: true,
        });
      })
      .catch((err) => {
        res.send({ error: "Account does not exist" });
      });
  });

  router.post("/save", async (req, res) => {
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

    var user = {
      _id: objectID(req.body._id),
    };

    async function getRecord() {
      var ret = {};

      let account = await app.db
        .collection("users")
        .findOne({ _id: objectID(req.body._id) });

      return account;
    }

    getRecord()
      .then((data) => {
        return checkDuplicate(data).then((exists) => {
          if (exists && !exists.empty) {
            var error = "Duplicate account information";
            return Promise.reject(error);
          } else {
            return data;
          }
        });
      })
      .then(async (data) => {
        if (req.body.password) {
          let hashed = await app.tools.hash(req.body.password);
          data.password = hashed;
        }

        app.db
          .collection("users")
          .updateOne(
            { _id: user._id },
            {
              $set: {
                name: req.body.name,
                password: data.password,
                email: req.body.email,
                phone_number: req.body.phone_number,
              },
            }
          )
          .then(async (result) => {
            res.send({ message: "User saved", severity: "success" });

            var _n = {
              user: data._id,
              open: true,
              severity: "info",
              message:
                "Your account information was updated @" +
                Moment().valueOf().toString(),
              vertical: "bottom",
              horizontal: "center",
              status: "unread",
            };

            var inserted = await app.db
              .collection("notifications")
              .insertOne(_n);

            delete _n.user;
            delete _n._id;
            _n.confirm = inserted.insertedId;

            if (data.socket_id) {
              app.emitMessage(app.sox[data.socket_id], _n, "alert");
            }
          });
      })
      .catch((err) => {
        var message = err.message ? err.message : err;
        var error = {
          severity: "error",
          message: message,
        };

        res.send(error);
      });
  });

  router.post("/savemulti", async (req, res) => {
    var updates = req.body.updates;

    if (req.body.soft) {
      app.db
        .collection("users")
        .updateMany(
          {
            _id: {
              $in: req.body._ids.map(function (id) {
                return objectID(id);
              }),
            },
          },
          {
            $set: updates,
          }
        )
        .then((result) => {
          res.send({ message: "Users soft deleted", severity: "success" });
        });
    } else {
      app.db
        .collection("users")
        .deleteMany({
          _id: {
            $in: req.body._ids.map(function (id) {
              return objectID(id);
            }),
          },
        })
        .then((result) => {
          res.send({ message: "Users deleted", severity: "success" });
        });
    }
  });

  router.post("/create", async (req, res) => {
    async function checkDuplicate() {
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
        $or: ors,
      });

      return check;
    }

    checkDuplicate()
      .then((exists) => {
        if (exists && !exists.empty) {
          var error = "Duplicate account information";
          return Promise.reject(error);
        } else {
          return Promise.resolve(true);
        }
      })
      .then(async () => {
        var data = {};

        if (req.body.password) {
          let hashed = await app.tools.hash(req.body.password);
          data.password = hashed;
        }

        app.db
          .collection("users")
          .insertOne({
            name: req.body.name,
            password: data.password,
            email: req.body.email,
            phone_number: req.body.phone_number,
            status: req.body.status,
          })
          .then((result) => {
            res.send({
              message: "User added",
              severity: "success",
              _id: result.insertedId,
            });
          });
      })
      .catch((err) => {
        var message = err.message ? err.message : err;
        var error = {
          severity: "error",
          message: message,
        };

        res.send(error);
      });
  });

  router.post("/notification", (req, res) => {
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

    getUser()
      .then((u) => {
        app.db
          .collection("notifications")
          .updateOne(
            { _id: objectID(req.body.notification), user: u._id },
            {
              $set: {
                status: "read",
              },
            }
          )
          .then((updated) => {});
      })
      .catch((err) => {});
  });

  router.post("/entries", async (req, res) => {
    if (!req.auth_user.entryId) {
      res.send([]);
      return false;
    }

    match = { ownerEntryId: { $in: req.auth_user.entryId }, isDeleted: false };

    var entries = await app.db.collection("entries").find(match).toArray();

    res.send(entries);
  });

  router.post("/deleteentry", async (req, res) => {
    await app.db
      .collection("entries")
      .updateOne(
        { _id: objectID(req.body._id) },
        { $set: { isDeleted: true } }
      );
    match = { ownerEntryId: { $in: req.auth_user.entryId }, isDeleted: false };

    var entries = await app.db.collection("entries").find(match).toArray();

    res.send(entries);
  });

  router.post("/companies", async (req, res) => {
    async function search() {
      var ret = {};

      let companies = await app.db
        .collection("users")
        .find({
          price: { $ne: null },
          $or: [
            { displayName: { $regex: req.body.search_term, $options: "i" } },
            { name: { $regex: req.body.search_term, $options: "i" } },
          ],
        })
        .toArray();

      return companies;
    }

    var results = await search();

    var ret = results.map((v, i) => {
      return {
        name: v.displayName ? v.displayName : v.name,
        id: v._id,
        price: v.price,
      };
    });

    res.send(ret);
  });

  router.post("/company", async (req, res) => {
    let company = await app.db.collection("users").findOne({
      price: req.body.price,
    });

    var v = company;

    var ret = {
      name: v.displayName ? v.displayName : v.name,
      id: v._id,
      price: v.price,
    };

    const plan = await app.stripe.plans.retrieve(req.body.price);

    ret.plan = plan;

    res.send(ret);
  });

  router.post("/modify", (req, res) => {
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

    getUser()
      .then((u) => {
        return app.tools
          .update(u._id, req.body.updates, "users")
          .then((updated) => {
            return u;
          });
      })
      .then((u) => {
        res.send({
          status: true,
        });
      })
      .catch((err) => {
        res.send({ error: "Account does not exist" });
      });
  });

  return router;
};
