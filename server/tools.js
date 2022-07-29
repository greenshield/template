var mongo = require("mongodb");
var objectID = mongo.ObjectId;
var Moment = require("moment-timezone");
const bcrypt = require("bcryptjs");
const uuidv4 = require("uuid").v4;
const async = require("async");
const crypto = require("crypto");
const axios = require("axios");
const nodemailer = require("nodemailer");
const algorithm = "aes-256-cbc";
const iv = crypto.randomBytes(16);
const stream = require("stream");
const sharp = require("sharp");
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

let poolConfig = {
  pool: true,
  host: process.env.REACT_APP_EMAIL_DOMAIN,
  port: process.env.REACT_APP_EMAIL_PORT,
  secure: process.env.REACT_APP_EMAIL_SECURE,
  requireTLS: process.env.REACT_APP_EMAIL_REQUIRETLS,
  auth: {
    user: process.env.REACT_APP_SMTP_EMAIL_ADDRESS,
    pass: process.env.REACT_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: process.env.REACT_APP_EMAIL_REJECT_UNAUTHORIZED,
  },
};

let transporter = nodemailer.createTransport(poolConfig);

var key = null;

var oid = (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
  s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h));

module.exports = function (app, database, encryptKey, lp, master) {
  key = encryptKey;

  return {
    transporter: transporter,
    ouuid: (m = Math, d = Date, h = 16, s = (s) => m.floor(s).toString(h)) =>
      s(d.now() / 1000) + " ".repeat(h).replace(/./g, () => s(m.random() * h)),
    connEnd: function (client) {
      client.end();
      return true;
    },
    bcrypt: bcrypt,
    uuidv4: uuidv4,
    hash: async function (password) {
      let hash = await bcrypt.hash(password, bcrypt.genSaltSync(10));

      return hash;
    },
    gen: function (count, highlighted) {
      var b = "";

      for (var i = 0; i < count; i++) {
        if (i === 0) {
          if (highlighted) {
            num = Math.floor(Math.random() * 10);
          } else {
            num = Math.floor(Math.random() * 9) + 1;
          }
        } else {
          num = Math.floor(Math.random() * 10);
        }

        b = b + num.toString();
      }

      return b;
    },
    encrypt: async function (text) {
      let cipher = crypto.createCipheriv(
        "aes-256-cbc",
        Buffer.from(key, "hex"),
        iv
      );
      let encrypted = cipher.update(text);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return Promise.resolve({
        iv: iv.toString("hex"),
        encryptedData: encrypted.toString("hex"),
      });
    },
    decrypt: async function (text) {
      let iv = Buffer.from(text.iv, "hex");
      let encryptedText = Buffer.from(text.encryptedData, "hex");
      let decipher = crypto.createDecipheriv(
        "aes-256-cbc",
        Buffer.from(key, "hex"),
        iv
      );
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return Promise.resolve(decrypted.toString());
    },
    update: async function (id, updateObj, coll, db) {
      var filter = { _id: objectID(id) };

      var d = new Date();
      var n = d.getTime();

      if (!id && !updateObj._id) {
        updateObj._id = objectID(oid());
        filter = { _id: updateObj._id };
      }

      var updates = { $set: updateObj };

      var dbo = app.db;

      let update = dbo.collection(coll).updateMany(filter, updates);

      return new Promise(function (resolve, reject) {
        if (update) {
          resolve(update);
        } else {
          reject(false);
        }
      });
    },
    sleep: async function (ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    },
    insert: async function (docs, coll, options, db) {
      new_docs = docs.map((doc) => {
        if (!doc._id) {
          doc._id = objectID(oid());

          if (!doc.email) {
            delete doc.email;
          }

          if (!doc.phone_number) {
            delete doc.phone_number;
          }

          doc.insert_stamp = Moment().valueOf();
        }

        return doc;
      });

      var dbo = app.db;

      const collection = dbo.collection(coll);

      var ret = {};

      let inserted = await collection.insertMany(new_docs, {
        ordered: options && options.ordered ? true : false,
      });

      ret = inserted;

      return ret;
    },
    uuid: function () {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + s4() + s4() + s4();
    },
    short: function (count) {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }

      if (!count) {
        return s4() + s4();
      } else {
        var st = "";

        for (var i = 0; i < count; i++) {
          st += s4();
        }

        return st;
      }
    },
    code: function () {
      return Math.floor(1000 + Math.random() * 9000);
    },
    formatter: function (amount) {
      var converter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      });

      return converter.format(amount);
    },
    push: function (cols, rows, res, filename) {
      var response = "";

      var headers = cols.map((col, index) => {
        return col.accessor;
      });

      var columns = headers.join(",");

      response += columns + "\r\n";

      rows.forEach((row, index) => {
        var cols = headers.map((header, index) => {
          return row[header];
        });

        var columns = cols.join(",");

        response += columns + "\r\n";
      });

      res.setHeader(
        "Content-disposition",
        "attachment; filename=" + filename ? filename : "report.csv"
      );
      res.setHeader("Content-Type", "text/csv");
      res.status(200).send(response);
    },
    emailIsValid: function (email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    numbers_only: function (number) {
      var myString = number.replace(/\D/g, "");
      return myString;
    },
    phone_number_only: function (number) {
      var myString = number.replace(/\D/g, "").replace(/^\+[0-9]/, "");
      return myString;
    },
    inload_text: async function (text, save_name) {
      var uuid = app.tools.uuid();
      var name = save_name ? save_name + ".txt" : "file_" + uuid + ".txt";
      let together = text;
      let asc = new Readable();
      asc._read = () => {};
      asc.push(together);
      asc.push(null);

      var bucket = new mongodb.GridFSBucket(app.db);

      return app.tools
        .inloadstream(asc, bucket, name)
        .then(() => {
          return new Promise(async (resolve, reject) => {
            resolve(name);
          });
        })
        .catch(function (err) {});
    },
    query: async function (query, page) {},
    exists: async function (collection, filter) {
      var results = await app.db.collection(collection).find(filter).toArray();
      return results.length;
    },
    noDup: async (collection, field, value) => {
      var check = {};
      check[field] = value;

      let found = await app.db.collection(collection).findOne(check);

      if (!found) {
        return true;
      } else {
        return app.tools.noDup(collection, field, value);
      }
    },
    upload: function (file_data, bucket, opts) {
      var upload = null;

      var file = file_data;

      return new Promise((resolve, reject) => {
        var tasks = [];

        if (Array.isArray(file)) {
          file.forEach((val, i) => {
            var uuid = this.uuid();

            var task = function (callback) {
              fs.createReadStream(val.path)
                .pipe(
                  bucket.openUploadStream(val.name, {
                    contentType: opts.type,
                  })
                )
                .on("error", function (error) {
                  assert.ifError(error);
                })
                .on("finish", function (f) {
                  upload = f;
                  callback();
                });
            };

            tasks.push(task);
          });
        } else {
          var uuid = this.uuid();

          var task = function (callback) {
            fs.createReadStream(file.path)
              .pipe(
                bucket.openUploadStream(file.name, {
                  contentType: opts.type,
                  metadata: {
                    ...opts,
                    hash: file.hash,
                    time_stamp: Moment().valueOf(),
                  },
                })
              )
              .on("error", function (error) {
                assert.ifError(error);
              })
              .on("finish", function (f) {
                upload = f;
                callback();
              });
          };

          tasks.push(task);
        }

        async.parallel(tasks, function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            file: upload,
          });
        });
      });
    },
    resize: function (file, bucket, options) {
      var upload = null;

      return new Promise((resolve, reject) => {
        var tasks = [];

        var filename = file.name;

        var uuid = this.uuid();

        var w = 0;
        var h = 0;
        var r = 0;
        var new_w = w;
        var new_h = h;

        if (options.prefix) {
          filename = options.prefix + filename;
        }

        task = (callback) => {
          sharp(file.path)
            .metadata()
            .then((metadata) => {
              w = metadata.width;
              h = metadata.height;
              r = 0;
              new_w = w;
              new_h = h;

              if (w > h) {
                if (w > options.size) {
                  r = options.size / w;
                  new_w = options.size;
                  new_h = h * r;
                }
              } else if (h > w) {
                if (h > options.size) {
                  r = options.size / h;
                  new_h = options.size;
                  new_w = w * r;
                }
              } else if (w === h) {
                if (w > options.size) {
                  r = options.size / w;
                  new_w = options.size;
                  new_h = options.size;
                }
              }

              if (r > 0) {
                //image.resize(new_w, new_h);

                var resizer = sharp(file.path)
                  .resize(parseInt(new_w), parseInt(new_h))
                  .jpeg({
                    quality: 100,
                    chromaSubsampling: "4:4:4",
                  });
              }

              mime_type = file.mimetype;

              resizer.toBuffer((err, data, info) => {
                // data here directly contains the buffer object.
                const fileStream = stream.Readable.from(data);

                fileStream
                  .pipe(
                    bucket.openUploadStream(filename, {
                      contentType: mime_type,
                    })
                  )
                  .on("error", function (error) {
                    assert.ifError(error);
                  })
                  .on("finish", function (f) {
                    f.original_file = file.name;
                    upload = f;
                    callback();
                  });
              });
            });
        };

        tasks.push(task);

        async.parallel(tasks, function (err) {
          if (err) {
            return reject(err);
          }

          return resolve({
            file: upload,
          });
        });
      });
    },
    upload_aws: async function (params, path) {
      // Read content from the file
      const fileContents = fs.readFileSync(path);

      // Setting up S3 upload parameters

      // Uploading files to the bucket
      //return false
      await s3.upload(params).promise();
      return new Promise((resolve, reject) => {
        resolve(true);
      });
    },
    get_auth: async function (token) {
      var ret = {};

      let user = await app.db.collection("users").findOne({ token: token });

      if (!user) {
        var criteria = { uuid: token, status: "active" };
        var token = await app.db.collection("tokens").findOne(criteria);

        if (token) {
          criteria = { _id: token.user };
          user = await app.db.collection("users").findOne(criteria);
        }
      }

      return user;
    },
    upload_aws_stream: async function (fileName, db, full_file_name) {
      const bucket = new mongo.GridFSBucket(db, {
        chunkSizeBytes: 1024,
      });

      const files = await bucket
        .find({ filename: full_file_name })
        .sort({ uploadDate: -1 })
        .toArray();
      if (files.length === 0) {
        return false;
      }

      let downloadStream = bucket.openDownloadStreamByName(full_file_name);

      let buffer = [];
      downloadStream.on("data", (chunk) => {
        buffer.push(chunk);
      });
      downloadStream.on("end", () => {
        let readable = new Readable();
        readable._read = () => {};
        readable.push(Buffer.concat(buffer));
        readable.push(null);

        var oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        // Setting up S3 upload parameters
        const params = {
          Bucket: BUCKET_NAME,
          Key: fileName, // File name you want to save as in S3
          Body: readable,
          ContentType: files[0].type ? files[0].type : files[0].contentType,
          CacheControl: "max-age=31536000",
          Expires: oneYearFromNow,
        };

        // Uploading files to the bucket
        //return false
        s3.upload(params, function (err, data) {
          if (err) {
            throw err;
          }
          //console.log(`File uploaded successfully. ${data.Location}`);
        });

        return false;
      });
    },
    clear: async function (folder) {
      async function emptyS3Directory(bucket, dir) {
        const listParams = {
          Bucket: bucket,
          Prefix: dir,
        };

        if (!folder || folder === "/") {
          delete listParams.Prefix;
        }

        const listedObjects = await s3.listObjectsV2(listParams).promise();

        if (listedObjects.Contents.length === 0) return;

        const deleteParams = {
          Bucket: bucket,
          Delete: { Objects: [] },
        };

        listedObjects.Contents.forEach(({ Key }) => {
          deleteParams.Delete.Objects.push({ Key });
        });

        await s3.deleteObjects(deleteParams).promise();

        if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
      }

      await emptyS3Directory(BUCKET_NAME, folder ? folder : "/");
    },
  };
};
