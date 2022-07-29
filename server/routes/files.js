const express = require("express");
const router = express.Router();
const Moment = require("moment-timezone");
util = require("util");
var mongodb = require("mongodb");
var objectID = mongodb.ObjectId;
var fs = require("fs");
const AWS = require("aws-sdk");
const Readable = require("stream").Readable;
const ID = process.env.AWS_S3_ID;
const SECRET = process.env.AWS_S3_SECRET;
// The name of the bucket that you have created
const BUCKET_NAME = process.env.BUCKET_NAME;
const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});
const archiver = require("archiver");

module.exports = function (app) {
  router.post("/add", async (req, res) => {
    var user = {
      filename: req.body.filename,
    };
    app.tools.insert([user], "fs.files", {}).then((result) => {
      res.send({ message: "added", _id: result.insertedIds["0"] });
    });
  });

  router.post("/delete", async (req, res) => {
    var file = {
      _id: objectID(req.body._id),
    };

    app.db
      .collection("fs.files")
      .find({ _id: file._id })
      .toArray(async (err, results) => {
        if (err) throw err;

        var promises = [];
        results.forEach((v, i) => {
          var result = v;

          var task = new Promise((resolve) => {
            console.log("task");
            app.db.collection("fs.chunks").deleteMany({ files_id: result._id });

            app.db.collection("fs.files").deleteMany({ _id: result._id });
            resolve(true);
          });

          promises.push(task);
        });

        Promise.all(promises).then(() => {
          res.send({ message: "deleted" });
        });
      });
  });

  router.post("/soft", async (req, res) => {
    var user = {
      _id: objectID(req.body._id),
    };
    app.db
      .collection("fs.files")
      .updateOne(
        { _id: user._id },
        {
          $set: {
            deleted: true,
          },
        }
      )
      .then((result) => {
        res.send({ message: "File marked as deleted", severity: "success" });
      });
  });

  router.post("/update", async (req, res) => {
    var user = {
      _id: objectID(req.body._id),
    };
    app.db
      .collection("fs.files")
      .updateOne(
        { _id: user._id },
        {
          $set: {
            filename: req.body.filename,
          },
        }
      )
      .then((result) => {
        res.send({
          message: "Record updated",
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

    async function getRecords(_id, data) {
      var ret = {};

      var match = {};

      var ors = [];

      var fields = ["filename"];

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
          filename: { $ifNull: ["$filename", ""] },
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
        .collection("fs.files")
        .aggregate(filter, { collation: { locale: "en" } })
        .toArray()
        .then((record_list) => {
          return record_list[0];
        });
    }

    getUser().then((data) => {
      getRecords(data._id, data).then((records) => {
        if (records.total[0]) {
          ret.total = records.total[0].total;
        } else {
          ret.total = 0;
        }

        var rows = [];

        var cols = [];

        cols.push({
          Header: "Filename",
          label: "Filename",
          accessor: "filename",
          id: "filename",
          disablePadding: false,
          numeric: false,
          padding: "none",
          align: "left",
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

        records.data.forEach(function (record, index) {
          var new_file = {};
          new_file._id = record._id.toString();
          new_file.filename = record.filename;
          new_file.status = record.status;
          new_file.deleted = record.deleted;

          rows.push(new_file);
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

  router.post("/save", async (req, res) => {
    async function checkDuplicate(u) {
      var ret = {};

      var ors = [];

      if (!req.body.filename) {
        return { empty: true };
      }

      if (req.body.filename) {
        ors.push({ filename: req.body.filename });
      }

      let check = await app.db.collection("fs.files").findOne({
        _id: { $ne: u._id },
        $or: ors,
      });

      return check;
    }

    var file = {
      _id: objectID(req.body._id),
    };

    async function getRecord() {
      var ret = {};

      let account = await app.db
        .collection("fs.files")
        .findOne({ _id: objectID(req.body._id) });

      return account;
    }

    getRecord()
      .then((data) => {
        return checkDuplicate(data).then((exists) => {
          if (exists && !exists.empty) {
            var error = "Duplicate record";
            return Promise.reject(error);
          } else {
            return data;
          }
        });
      })
      .then(async (data) => {
        app.db
          .collection("fs.files")
          .updateOne(
            { _id: data._id },
            {
              $set: {
                filename: req.body.filename,
              },
            }
          )
          .then(async (result) => {
            res.send({ message: "File saved", severity: "success" });
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
        .collection("fs.files")
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
          res.send({ message: "Files soft deleted", severity: "success" });
        });
    } else {
      await app.db.collection("fs.chunks").deleteMany({
        files_id: {
          $in: req.body._ids.map(function (id) {
            return objectID(id);
          }),
        },
      });

      await app.db
        .collection("fs.files")
        .deleteMany({
          _id: {
            $in: req.body._ids.map(function (id) {
              return objectID(id);
            }),
          },
        })
        .then((result) => {
          res.send({ message: "Files deleted", severity: "success" });
        });
    }
  });

  router.post("/create", async (req, res) => {
    async function checkDuplicate() {
      var ret = {};

      var ors = [];

      if (!req.body.filename) {
        return { empty: true };
      }

      if (req.body.filename) {
        ors.push({ filename: req.body.filename });
      }

      let check = await app.db.collection("fs.files").findOne({
        $or: ors,
      });

      return check;
    }

    checkDuplicate()
      .then((exists) => {
        if (exists && !exists.empty) {
          var error = "Duplicate record";
          return Promise.reject(error);
        } else {
          return Promise.resolve(true);
        }
      })
      .then(async () => {
        var data = {};

        app.db
          .collection("fs.files")
          .insertOne({
            filename: req.body.filename,
            status: req.body.status,
          })
          .then((result) => {
            res.send({
              message: "File added",
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

  router.get("/list", (req, res) => {
    var params = {
      Prefix: "faa61c5c1ffe754a27b3",
      Bucket: BUCKET_NAME,
    };

    fs.mkdir(
      process.env.SERVER_PATH + "archive/" + params.Prefix,
      { recursive: true },
      (err) => {
        if (err) {
          return console.error(err);
        }
      }
    );

    var promises = [];

    s3.listObjects(params, function (err, data) {
      data.Contents.forEach((d, i) => {
        var task = new Promise((resolve, reject) => {
          var p = {
            Key: d.Key,
            Bucket: BUCKET_NAME,
          };

          s3.getObject(p, (err, dat) => {
            if (err) console.error(err);
            fs.writeFileSync(
              process.env.SERVER_PATH + "archive/" + d.Key,
              dat.Body
            );
            resolve(true);
          });
        });

        promises.push(task);
      });
      Promise.all(promises).then(async () => {
        const output = fs.createWriteStream(
          process.env.SERVER_PATH + "archive/" + params.Prefix + ".zip"
        );
        const archive = archiver("zip");

        archive.pipe(output);
        archive.directory(
          process.env.SERVER_PATH + "archive/" + params.Prefix,
          false
        );
        await archive.finalize();

        fs.rm(
          process.env.SERVER_PATH + "archive/" + params.Prefix,
          { recursive: true },
          (err) => {
            if (err) {
            }

            var path =
              process.env.SERVER_PATH + "archive/" + params.Prefix + ".zip";

            var reader = fs.readFileSync(path);

            var oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

            // Setting up S3 upload parameters
            const upload_params = {
              Bucket: BUCKET_NAME,
              Key: params.Prefix + ".zip", // File name you want to save as in S3
              Body: reader,
              ContentType: "application/zip",
              CacheControl: "max-age=31536000",
              Expires: oneYearFromNow,
            };

            app.tools.upload_aws(upload_params, path);

            fs.rm(
              process.env.SERVER_PATH + "archive/" + params.Prefix + ".zip",
              () => {}
            );

            res.send(process.env.BUCKET_URL + params.Prefix + ".zip");
          }
        );
      });
    });
  });

  return router;
};
