import socketIOClient from "socket.io-client";
import { useState, useEffect, useCallback } from "react";

import { toast } from "react-hot-toast";

const useSocketIo = ({ user, setUser, onPaint, refresh, setRefresh }) => {
  const [receivedMessage, setReceivedMessage] = useState();
  const [socket, setSocket] = useState();
  // const [onPaint, setOnPaint] = useState();

  const broadcast = useCallback(
    (body) => {
      socket.emit("paint", body);
    },
    [socket]
  );

  useEffect(() => {
    const socket = socketIOClient(process.env.REACT_APP_SERVER);

    console.log(`useSocketIo::useEffect`, process.env.REACT_APP_SERVER);
    setSocket(socket);

    socket.on("connect", () => {
      console.log(`useSocketIo is connected.`, socket.id);
      socket.emit("onUserReactConnected", user);
    });

    socket.on("onPaint", (body) => {
      console.log(`useSocketIo::onPaint`);
      onPaint(body);
    });

    socket.on("onReceivedMessage", (state) => {
      console.log(`useSocketIo::onReceivedMessage`, state.text);
      setReceivedMessage(state);
    });

    socket.on("onToast", (msg) => {
      console.log(`useSocketIo::onToast`);
      toast.success(msg);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`useSocketIo Reconnected after ${attemptNumber} attempts`);
    });

    socket.on("reconnect_error", (error) => {
      console.log("useSocketIo Reconnection error:", error);
    });
    socket.on("disconnect", () => {
      console.log(`useSocketIo disconnected . Waiting...`);
    });
    // Cleanup function to disconnect the socket when the component unmounts
    return () => {
      console.log(`useSocketIo is disconnected permanent.`);
      socket.disconnect();
    };
  }, [refresh, setRefresh, user, setUser, onPaint]);

  return { broadcast, receivedMessage };
};

export default useSocketIo;
