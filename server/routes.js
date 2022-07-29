const axios = require("axios");
const express = require("express");
const router = express.Router();
var mongodb = require("mongodb");
const Moment = require("moment-timezone");
var objectID = mongodb.ObjectId;
var formidable = require("formidable");
const async = require("async");

module.exports = function (app) {
  const auth = require("./routes/auth")(app);
  app.use("*/remote/auth", auth);
  app.use("/auth/", auth);

  const users = require("./routes/users")(app);
  app.use("*/remote/users", users);
  app.use("/users/", users);

  const files = require("./routes/files")(app);
  app.use("*/remote/files", files);
  app.use("/files/", files);

  const items = require("./routes/items")(app);
  app.use("*/remote/items", items);
  app.use("/items/", items);

  router.get("/", (req, res) => {
    res.send("default route");
  });

  router.get("/remote/test", (req, res) => {
    res.send("remote test");
  });

  router.get("/partial/:name", async (req, res) => {
    var foundMetaFile;

    foundMetaFile = await app.db
      .collection("fs.files")
      .find({ filename: req.params.name })
      .sort({ insert_stamp: -1 })
      .limit(1)
      .toArray()
      .then((files) => {
        return files[0];
      });

    if (!foundMetaFile)
      return res
        .status(400)
        .json(
          Res.error(undefined, { message: `invalid ${req.params.name} file` })
        );

    let fileLength = foundMetaFile["length"] ? foundMetaFile["length"] : "";
    let contentType = foundMetaFile["contentType"]
      ? foundMetaFile["contentType"]
      : "";
    let chunkSize = foundMetaFile["chunkSize"];

    if (req.headers["range"]) {
      // Range request, partial stream the file
      //console.log('Range Request');
      var parts = req.headers["range"].replace(/bytes=/, "").split("-");
      var partialStart = parts[0];
      var partialEnd = parts[1];

      var start = parseInt(partialStart, 10);
      var end = partialEnd ? parseInt(partialEnd, 10) : fileLength - 1;
      chunkSize = end - start + 1;

      //console.log('Range ', start, '-', end);

      res.writeHead(206, {
        "Content-Range": "bytes " + start + "-" + end + "/" + fileLength,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": contentType,
      });
    }

    let bucket = new mongodb.GridFSBucket(app.db, {
      chunkSizeBytes: chunkSize,
    });

    return new Promise((resolve, reject) => {
      let downloadStream = bucket.openDownloadStreamByName(req.params.name, {
        start: start,
        end: end,
      });
      downloadStream.on("error", (err) => {
        //console.log("Received Error stream")
        res.end();
        reject(err);
      });

      downloadStream.on("end", () => {
        //console.log("Received End stream");
        res.end();
        resolve(true);
      });
      //console.log("start streaming");
      downloadStream.pipe(res);
    });
  });

  router.get("/file/:name", (req, res) => {
    const bucket = new mongodb.GridFSBucket(app.db, {
      chunkSizeBytes: 1024,
    });

    bucket
      .openDownloadStreamByName(req.params.name)
      .pipe(res)
      .on("error", function (error) {
        //assert.ifError(error);
      })
      .on("finish", function () {});
  });

  router.post("/remote/remove", async (req, res) => {
    var files = req.body.files;

    files.forEach(async (f, i) => {
      var file = f.file;

      await app.db
        .collection("fs.files")
        .find({ filename: file.filename })
        .sort({ insert_stamp: -1 })
        .toArray((err, results) => {
          if (err) throw err;

          results.forEach((v, i) => {
            var result = v;

            app.db.collection("fs.files").deleteMany({ _id: result._id });
            app.db.collection("fs.chunks").deleteMany({ files_id: result._id });
          });
        });
    });
    res.send({ status: "removed" });
  });

  router.post("/remote/delete", async (req, res) => {
    var files = req.body.files;

    var file_info = await app.db
      .collection("files")
      .findOne({ _id: objectID(req.body._id) });

    await app.db
      .collection("fs.files")
      .find({ full_file_name: file_info.full_file_name })
      .sort({ insert_stamp: -1 })
      .toArray((err, results) => {
        if (err) throw err;

        app.db.collection("files").deleteMany({ _id: file_info._id });

        results.forEach((v, i) => {
          var result = v;

          app.db.collection("fs.files").deleteMany({ _id: result._id });
          app.db.collection("fs.chunks").deleteMany({ files_id: result._id });
        });
      });

    await app.db
      .collection("fs.files")
      .find({ full_file_name: "thumb_" + file_info.full_file_name })
      .sort({ insert_stamp: -1 })
      .toArray((err, results) => {
        if (err) throw err;

        results.forEach((v, i) => {
          var result = v;

          app.db.collection("fs.files").deleteMany({ _id: result._id });
          app.db.collection("fs.chunks").deleteMany({ files_id: result._id });
        });
      });

    res.send({ status: "removed" });
  });

  router.post("/remote/upload", (req, res) => {
    var form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, async function (err, fields, files) {
      var bucket = new mongodb.GridFSBucket(app.db);

      var skip_convert = false;

      var options = {};

      if (!Array.isArray(files.file)) {
        var f = [files.file];
      } else {
        f = files.file;
      }

      var file_list = [];

      var tasks = [];

      f.forEach(async (file, i) => {
        task = (callback) => {
          var _callback = async () => {
            var original = await app.tools
              .upload(file, bucket, skip_convert, null, options)
              .catch((err) => {
                console.log(err);
              });

            file_list.push(original);

            var options = {
              prefix: "thumb_",
            };

            options.resize = true;
            options.size = 128;

            var thumb = await app.tools
              .upload(file, bucket, skip_convert, null, options)
              .catch((err) => {
                console.log(err);
              });

            file_list.push(thumb);
            callback();
          };

          _callback();
        };

        tasks.push(task);
      });

      async.parallel(tasks, function (err) {
        if (err) {
          console.log(err);
          res.send({ status: "error" });
        }

        res.send(file_list);
      });
    });
  });

  router.get("/deletefiles", (req, res) => {
    var file = req.query.file;

    app.db
      .collection("fs.files")
      .find()
      .sort({ insert_stamp: -1 })
      .toArray((err, results) => {
        if (err) throw err;

        results.forEach((v, i) => {
          var result = v;

          app.db.collection("fs.files").deleteMany({ _id: result._id });
          app.db.collection("fs.chunks").deleteMany({ files_id: result._id });
        });

        var result = {
          status: true,
        };

        res.send(result);
      });
  });

  router.post("/remote/create-checkout-session", async (req, res) => {
    const session = await app.stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1LPo0EKZjZfQBxXgl4z4Fyfn",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: process.env.BASE_URL + `change`,
      cancel_url: process.env.BASE_URL + `forgot`,
    });

    res.send(session);
  });

  router.post("/remote/intent", async (req, res) => {
    var stripe = app.stripe;

    //instant
    //const paymentIntent = await stripe.paymentIntents.create(intent);

    if (!req.auth_user.customer_token) {
      var customer = await stripe.customers.create({
        email: req.auth_user.email,
      });

      customer = customer.id;

      await app.db.collection("users").updateOne(
        { _id: req.auth_user._id },
        {
          $set: {
            customer_token: customer,
          },
        }
      );
    } else {
      customer = req.auth_user.customer_token;
    }

    const priceId = req.body.priceId;

    try {
      // Create the subscription. Note we're expanding the Subscription's
      // latest invoice and that invoice's payment_intent
      // so we can pass it to the front end to confirm the payment
      const subscription = await stripe.subscriptions.create({
        customer: customer,
        items: [
          {
            price: priceId,
          },
        ],
        payment_behavior: "default_incomplete",
        payment_settings: { save_default_payment_method: "on_subscription" },
        metadata: {
          customer: customer,
          price: priceId,
        },
        expand: ["latest_invoice.payment_intent"],
      });

      res.send({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      });
    } catch (error) {
      return res.status(400).send({ error: { message: error.message } });
    }
  });

  router.post("/remote/upgrade", async (req, res) => {
    var stripe = app.stripe;

    if (req.auth_user.last_successful_intent === req.body.payment.id) {
      res.send(true);
      return false;
    }

    await app.db.collection("users").updateOne(
      { _id: req.auth_user._id },
      {
        $set: {
          upgraded: true,
          company_price: req.body.company_price,
          payment: req.body.payment.id,
          last_successful_intent: req.body.payment.id,
          last_upgrade: req.body.payment.id,
        },
      }
    );

    res.send({ status: "upgraded" });
  });

  router.post("/remote/stripehook", async (req, res) => {
    var stripe = app.stripe;

    async function getUser() {
      var ret = {};

      let user = await app.db
        .collection("users")
        .findOne({ customer_token: req.body.data.object.customer });

      return user;
    }

    var user = await getUser();

    if (user.last_successful_intent === req.body.data.object.payment_intent) {
      res.send(true);
      return false;
    }

    await app.db.collection("users").updateOne(
      { customer_token: req.body.data.object.customer },
      {
        $set: {
          upgraded: true,
          company_price: req.body.data.object.lines.data[0].plan.id,
          payment: req.body.data.object.lines.data[0].plan.id,

          last_successful_intent: req.body.data.object.payment_intent,
          last_webhook: req.body.data.object.payment_intent,
        },
      }
    );

    res.send(true);
  });

  router.post("/remote/intentonly", async (req, res) => {
    const paymentIntent = await app.stripe.setupIntents.create();

    res.json({
      client_secret: paymentIntent.client_secret,
    });
  });

  router.post("/remote/dropload/", async (req, res) => {
    async function getUser(_token) {
      var ret = {};

      let user = await app.db.collection("users").findOne({ token: _token });

      if (!user) {
        var criteria = { uuid: _token, status: "active" };
        var token = await app.db.collection("tokens").findOne(criteria);

        if (token) {
          criteria = { _id: token.user };
          user = await app.db.collection("users").findOne(criteria);
        }
      }

      return user;
    }

    var form = new formidable.IncomingForm({ multiples: true });

    var file_list = [];
    form.parse(req, async function (err, fields, files) {
      var _user = await getUser(fields.token);

      var bucket = new mongodb.GridFSBucket(app.db);

      var skip_convert = false;

      var options = {};

      if (!Array.isArray(files.file)) {
        var f = files.file;
      } else {
        f = files.file[0];
      }

      var base = "/server/lestudio/uploads/";

      var bucket = new mongodb.GridFSBucket(app.db);

      var complete = 0;

      if (!f) {
        res.send({ message: "done" });
        return false;
      }

      var v = "/" + f.originalFilename;

      var type = f.mimetype;

      var time_stamp = Moment().valueOf();

      var file_uuid = app.tools.uuid();

      var prefix = file_uuid.toString() + "_" + time_stamp;

      var file_name = f.originalFilename;

      var full_file_name = prefix + "_" + file_name;

      var new_file = {
        type: type,
        user: objectID(_user._id.toString()),
        name: file_name,
        full_path: _user._id.toString() + v,
        s3: false,
        uuid: app.tools.uuid(),
        prefix: prefix,
        file_name: file_name,
        full_file_name: full_file_name,
        status: "active",
      };

      var add_files = [];

      var check_file = await app.db
        .collection("files")
        .findOne({ full_file_name: new_file.full_file_name });

      if (!check_file) {
        add_files.push(new_file);

        var details = {
          type: type,
          name: file_name,
          uuid: new_file.uuid,
        };

        if (add_files.length) {
          var file_insert = await app.tools.insert(add_files, "files");
          var file_id = file_insert.insertedIds[0];
        }

        details.file_id = file_id;

        var thumb = await app.tools.resize(
          {
            path: f.filepath,
            name: full_file_name,
            mimetype: type,
          },
          bucket,
          { prefix: "thumb_", size: 200 }
        );

        file_list.push(thumb);

        var original = await app.tools
          .upload({ path: f.filepath, name: full_file_name }, bucket, details)
          .catch((err) => console.log(err));

        var aws_prefix = file_name;
        var aws_prefix_thumb = "thumb_" + file_name;

        await app.tools.upload_aws_stream(
          _user._id.toString() + "/" + aws_prefix_thumb,
          app.db,
          "thumb_" + prefix + "_" + file_name
        );

        await app.tools.upload_aws_stream(
          _user._id.toString() + "/" + aws_prefix,
          app.db,
          prefix + "_" + file_name
        );

        file_list.push(original);

        res.send(file_list);
      }
    });
  });

  router.post("/remote/photos", async (req, res) => {
    var photos = await app.db
      .collection("files")
      .find({
        user: req.auth_user._id,
      })
      .sort({ insert_stamp: -1 })
      .toArray();

    var photos_map = photos.map((p, i) => {
      return {
        _id: p._id.toString(),
        path:
          process.env.BUCKET_URL + req.auth_user._id.toString() + "/" + p.name,
        thumb_path:
          process.env.BUCKET_URL +
          req.auth_user._id.toString() +
          "/thumb_" +
          p.name,
      };
    });

    res.send(photos_map);
  });

  return router;
};
