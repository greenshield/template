import * as React from "react";
import axios from "axios";
import control, { set } from "../reducers";
import socketIOClient from "socket.io-client";

if (!window.notifications || !window.notifications.length) {
  window.notifications = [];
}

function Socket(props) {
  const { user, socket, action, temp, notifications } = props;

  const [socketCount, setSocketCount] = React.useState(0);

  React.useEffect(() => {
    var sockets = () => {
      /* force use of websocket transport
      const socket = socketIOClient('//', { rejectUnauthorized: false, secure: true, transports: ['websocket'] });
      */

      if (window.socket) {
        window.socket.disconnect();
      }

      const socketInstance = socketIOClient("//", {
        rejectUnauthorized: false,
        secure: true,
      });

      socketInstance.on("message", (data) => {
        console.log(data);
      });

      socketInstance.on("alert", (data) => {
        window.notifications.push(data);

        set("notifications", window.notifications.slice());
      });

      socketInstance.on("alerts", (data) => {
        var _notifications = [];
        data.forEach((n, i) => {
          const found = window.notifications.some(
            (el) => el.confirm === n.confirm
          );
          if (!found) _notifications.push(n);
        });

        window.notifications = window.notifications
          .slice()
          .concat(_notifications);

        set("notifications", window.notifications.slice());
      });

      socketInstance.on("hello", (data) => {
        set("socket", data);
      });

      socketInstance.on("reload", (data) => {
        console.log("RELOAD");

        var _temp = Object.assign({}, temp, {
          reload: true,
        });

        set("temp", _temp);
      });

      window.socket = socketInstance;
    };

    if (user && !socket) {
      set("socket", null);
      // disable socket connection, remove // on next line to enable
      sockets();
      var updating_user = true;
    }

    if (
      user &&
      user.token &&
      socket &&
      socket !== user.socket &&
      !updating_user
    ) {
      var updateSocket = (token, socket, auto) => {
        setSocketCount(socketCount + 1);

        axios
          .post("/remote/auth/socket", {
            token: token,
            socket: socket,
            auto: auto,
            attempt: socketCount,
          })
          .then((res) => {
            this.props.setUserSocket(socket);
          })
          .catch((err) => {});
      };

      var isAuto = user.auto ? true : false;
      action("user", { ...user, auto: null, socket: socket }, "user");
      updateSocket(user.token, socket, isAuto);
    }
  }, [user, socket, action, temp, notifications, socketCount]);

  return <React.Fragment></React.Fragment>;
}

export default control(Socket, [
  "user",
  "auth",
  "socket",
  "temp",
  "alert",
  "notifications",
]);
