require("dotenv-flow").config();
const express = require("express");
const http = require("http");
const https = require("https");
const path = require("path");
const axios = require("axios");
const cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var dbConfig = require("./server/database.config.js");
var settings = require("./server/settings.js");
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var SIO = require("socket.io");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const router = express.Router({
  caseSensitive: true,
});

const app = (module.exports = express());

app.settings = settings;

app.sox = {};

app.stripe = stripe;

app.use(cookieParser());

app.enable("trust proxy");
app.set("trust proxy", "loopback, 127.0.0.1");

app.use(
  express.static(path.join(__dirname, "build"), {
    index: "index.html",
    extensions: ["html"],
  })
);

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ limit: "200mb", extended: true }));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());

app.use(router);

loadRoutes = () => {
  router.all("*", async (req, res, next) => {
    var protected = false;

    //var auth_user = null
    if (req.body.token) {
      let auth_user = await app.tools.get_auth(req.body.token);
      req.auth_user = auth_user;
    }

    if (req.query.token) {
      let auth_user = await app.tools.get_auth(req.query.token);
      req.auth_user = auth_user;
    }

    if (req.protect && req.protect === "true") {
      protected = true;
    }

    if (protected) {
      if (!auth_user) {
        res.send({ status: false });
        return true;
      } else {
        next();
      }
    } else {
      next();
    }
  });

  const routes = require("./server/routes")(app);
  app.use("/", routes);

  app.carrier = require("./server/tools/twilio.js")(
    app,
    process.env.REACT_APP_TWILIO_ACCOUNTSID,
    process.env.REACT_APP_TWILIO_AUTHTOKEN
  );
  app.carriers = {};
  app.carriers.twilio = app.carrier;
};

const remoteport = process.env.SERVER_PORT;

var remoteserver = http.createServer(app).listen(remoteport, function () {
  sockets.socketIO(remoteserver, SIO);
});

Socket = (socket) => {
  socket.emit("hello", socket.id);
};

emitSocket = (socket) => {
  socket.emit("hello", socket.id);
};

app.emitSocket = emitSocket;

emitMessage = async (socket, content, type) => {
  if (socket) {
    socket.emit(type, content);
  }
};

app.emitMessage = emitMessage;

reloadSocket = (socket) => {
  console.log(socket.id);
  socket.emit("reload", socket.id);
};

app.reloadSocket = reloadSocket;

emitRun = (socket, fun, id) => {
  console.log(fun);
  socket.emit("run", fun);
};

var sockets = require("./sockets")(app);

MongoClient.connect(
  dbConfig.url,
  {
    useNewUrlParser: true,
    connectTimeoutMS: 5000,
    keepAlive: true,
    socketTimeoutMS: 30000,
    useUnifiedTopology: true,
  },
  (err, db) => {
    if (err) {
      throw err;
    }

    app.db = db.db(process.env.REACT_APP_DB);

    app.tools = require("./server/tools.js")(app);

    loadRoutes();
  }
);
