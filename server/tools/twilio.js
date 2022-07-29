var mongo = require("mongodb");
var objectID = mongo.ObjectID;
var Moment = require("moment-timezone");
const axios = require("axios");
var url_base_test = `http://localhost:2000/remote/api/backend/`;
var url_base = `https://api.twilio.com/`;

var oid = (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
  s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h));

module.exports = function (app, sid, token) {
  db = app.db;

  return {
    create_account: async (app, accountSid, original_token) => {
      var bodyData = {};

      var rurl = `https://api.twilio.com/2010-04-01/Accounts.json`;

      var message_object = {
        method: "POST",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
      };

      let account = await axios(message_object)
        .then((api_call) => {
          return api_call.data;
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve(null);
          });
        });

      return account;
    },

    delete_account: async (accountSid, original_token, target_sid, updates) => {
      var bodyData = updates;
      accountSid + "-SUBACCOUNT-SID-" + target_sid;
      var rurl =
        `https://api.twilio.com/2010-04-01/Accounts/` + target_sid + `.json`;

      var message_object = {
        method: "POST",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
        data: Object.keys(bodyData)
          .map((key) => key + "=" + bodyData[key])
          .join("&"),
      };

      let account = await axios(message_object)
        .then((api_call) => {
          return api_call.data;
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve(null);
          });
        });

      return account;
    },

    update_account: async (accountSid, original_token, target_sid, updates) => {
      var bodyData = updates;

      var rurl =
        `https://api.twilio.com/2010-04-01/Accounts/` + target_sid + `.json`;

      var message_object = {
        method: "POST",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
        data: Object.keys(bodyData)
          .map((key) => key + "=" + bodyData[key])
          .join("&"),
      };

      let account = await axios(message_object)
        .then((api_call) => {
          return api_call.data;
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve(null);
          });
        });

      return account;
    },
    delete_number: async (accountSid, original_token, target_sid) => {
      var bodyData = {};

      var rurl =
        `https://api.twilio.com/2010-04-01/Accounts/` +
        accountSid +
        `/IncomingPhoneNumbers/` +
        target_sid +
        `.json`;

      var message_object = {
        method: "DELETE",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
      };

      let account = await axios(message_object)
        .then((api_call) => {
          return api_call.data;
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve(null);
          });
        });

      return account;
    },
    create_number: async (
      accountSid,
      original_token,
      target_sid,
      area_code,
      base_url
    ) => {
      var bodyData = {
        AreaCode: area_code,
        //PhoneNumber: '+15555555555'
        sms_method: "POST",
        sms_url:
          "https://" +
          process.env.REACT_APP_DOMAIN +
          base_url +
          "remote/api/inbound",
        status_callback_method: "POST",
        status_callback:
          "https://" +
          process.env.REACT_APP_DOMAIN +
          base_url +
          "remote/api/update?db=" +
          base_url.substring(1, base_url.length - 1),
      };

      var rurl =
        `https://api.twilio.com/2010-04-01/Accounts/` +
        target_sid +
        `/IncomingPhoneNumbers.json`;

      var message_object = {
        method: "POST",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
        data: Object.keys(bodyData)
          .map((key) => key + "=" + bodyData[key])
          .join("&"),
      };

      let account = await axios(message_object)
        .then((api_call) => {
          return api_call.data;
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve(null);
          });
        });

      return account;
    },

    reserve_number: async (
      accountSid,
      original_token,
      target_sid,
      phone_number,
      base_url
    ) => {
      var bodyData = {
        //AreaCode: area_code,
        PhoneNumber: phone_number,
        SmsMethod: "POST",
        SmsUrl:
          "https://" +
          process.env.REACT_APP_DOMAIN +
          base_url +
          "remote/api/inbound",
        StatusCallbackMethod: "POST",
        StatusCallback:
          "https://" +
          process.env.REACT_APP_DOMAIN +
          base_url +
          "remote/api/update?db=" +
          base_url.substring(1, base_url.length - 1),
      };

      var rurl =
        `https://api.twilio.com/2010-04-01/Accounts/` +
        target_sid +
        `/IncomingPhoneNumbers.json`;

      var message_object = {
        method: "POST",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
        data: Object.keys(bodyData)
          .map((key) => key + "=" + bodyData[key])
          .join("&"),
      };

      var account = await axios(message_object)
        .then((api_call) => {
          return api_call.data;
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve(null);
          });
        });

      return new Promise((resolve, reject) => {
        resolve(account);
      });
    },

    getBalance: async (accountSid, original_token) => {
      var bodyData = {};

      var rurl =
        `https://api.twilio.com/2010-04-01/Accounts/` +
        accountSid +
        `/Balance.json`;

      var message_object = {
        method: "GET",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
        data: Object.keys(bodyData)
          .map((key) => key + "=" + bodyData[key])
          .join("&"),
      };

      let balance = await axios(message_object)
        .then((api_call) => {
          return {
            status: "active",
            balance: api_call.data.balance,
          };
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve({
              status: err.response.statusText
                ? err.response.statusText
                : "invalid",
            });
          });
        });

      return balance;
    },
    getNumbers: async (accountSid, original_token) => {
      var bodyData = {};

      var rurl =
        `https://api.twilio.com/2010-04-01/Accounts/` +
        accountSid +
        `/IncomingPhoneNumbers.json?PageSize=1000&Page=0`;

      var message_object = {
        method: "GET",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
        data: Object.keys(bodyData)
          .map((key) => key + "=" + bodyData[key])
          .join("&"),
      };

      let numbers = await axios(message_object)
        .then((api_call) => {
          return api_call.data.incoming_phone_numbers;
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve([]);
          });
        });

      return numbers;
    },
    getApiAccount: async (accountSid, original_token, subAccountSid) => {
      var bodyData = {};

      var rurl =
        `https://api.twilio.com/2010-04-01/Accounts/` +
        subAccountSid +
        `.json?PageSize=1000&Page=0`;

      var message_object = {
        method: "GET",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
      };

      let accounts = await axios(message_object)
        .then((api_call) => {
          return api_call.data;
        })
        .catch((err) => {
          if (
            err.response &&
            err.response.statusText &&
            err.response.statusText === "UNAUTHORIZED"
          ) {
            var api_call = { data: {} };
            api_call.data.status = "unauthorized";
          } else {
            api_call = { data: { status: "error" } };
          }

          return api_call.data;
        });

      return accounts;
    },
    getApiAccounts: async (accountSid, original_token) => {
      var bodyData = {};

      var rurl = `https://api.twilio.com/2010-04-01/Accounts.json?PageSize=1000&Page=0`;

      var message_object = {
        method: "GET",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
      };

      let accounts = await axios(message_object)
        .then((api_call) => {
          return api_call.data;
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve([]);
          });
        });

      return accounts;
    },
    send: async (bodyData, live, accountSid, original_token) => {
      if (!accountSid) {
        accountSid = process.env.REACT_APP_TWILIO_ACCOUNTSID;
      }

      if (!original_token) {
        original_token = process.env.REACT_APP_TWILIO_AUTHTOKEN;
      }

      if (live) {
        var rurl =
          `https://api.twilio.com/2010-04-01/Accounts/` +
          accountSid +
          `/Messages.json`;
      } else {
        rurl = url_base_test;
      }

      return axios({
        method: "POST",
        url: rurl,
        auth: {
          username: accountSid,
          password: original_token,
        },
        data: Object.keys(bodyData)
          .map((key) => key + "=" + bodyData[key])
          .join("&"),
      });
    },
    lookupNumbers: async (
      accountSid,
      original_token,
      type,
      area_code,
      page_size = 5,
      country = "US"
    ) => {
      var bodyData = {};

      if (type === "local") {
        var rurl =
          `https://api.twilio.com/2010-04-01/Accounts/` +
          accountSid +
          `/AvailablePhoneNumbers/` +
          country +
          `/Local.json?PageSize=` +
          page_size;

        if (area_code && !["US", "CA"].includes(country)) {
          rurl = rurl + "&Locality=" + area_code;
        } else {
          rurl = rurl + "&AreaCode=" + area_code;
        }
      }

      if (type === "mobile") {
        rurl =
          `https://api.twilio.com/2010-04-01/Accounts/` +
          accountSid +
          `/AvailablePhoneNumbers/` +
          country +
          `/Mobile.json?PageSize=` +
          page_size;

        if (area_code && !["US", "CA"].includes(country)) {
          rurl = rurl + "&Locality=" + area_code;
        } else {
          rurl = rurl + "&AreaCode=" + area_code;
        }
      }

      if (type === "tollfree") {
        rurl =
          `https://api.twilio.com/2010-04-01/Accounts/` +
          accountSid +
          `/AvailablePhoneNumbers/` +
          country +
          `/TollFree.json?PageSize=` +
          page_size;

        if (area_code && !["US", "CA"].includes(country)) {
          rurl = rurl + "&Contains=" + area_code;
        } else {
          rurl = rurl + "&Contains=" + area_code;
        }
      }

      if (type)
        var message_object = {
          method: "GET",
          url: rurl,
          auth: {
            username: accountSid,
            password: original_token,
          },
          data: Object.keys(bodyData)
            .map((key) => key + "=" + bodyData[key])
            .join("&"),
        };

      let numbers = await axios(message_object)
        .then((api_call) => {
          return api_call.data.available_phone_numbers;
        })
        .catch((err) => {
          return new Promise((resolve, reject) => {
            resolve([]);
          });
        });

      return numbers;
    },
  };
};
