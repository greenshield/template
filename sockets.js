const redisAdapter = require("socket.io-redis");

module.exports = function (app) {
  return {
    socketIO: function (remoteserver, socket) {
      io = socket(remoteserver);

      /* force use of websocket transport
		io.set('transports', ['websocket']);
	  */

      io.adapter(redisAdapter({ host: "localhost", port: 6379 }));

      io.on("connection", (socket) => {
        //console.log('Client ' + socket.id + ' connected')

        var tempSox = app.sox;
        tempSox[socket.id] = socket;

        app.sox = tempSox;

        emitSocket(app.sox[socket.id]);

        socket.on("disconnect", async () => {
          var tempSox = app.sox;
          delete tempSox[socket.id];

          app.sox = tempSox;

          var updates = { $set: { socket_id: null } };
          await app.db
            .collection("users")
            .updateMany({ socket_id: socket.id }, updates);
        });
      });
    },
  };
};
