import React, { useEffect, useRef } from "react";
import { v4 } from "uuid";
import Pusher from "pusher-js";

const url = process.env.REACT_APP_BACKEND_URL;
const pusher_key = process.env.REACT_APP_PUSHER_KEY;
const pusher_cluster= process.env.REACT_APP_PUSHER_CLUSTER;

/**
 * Canvas component for painting.
 */
const Canvas = ({ canvasRef, width }) => {
  const isPainting = useRef(false);
  const line = useRef([]);
  const userId = useRef(v4());
  const prevPos = useRef({ offsetX: 0, offsetY: 0 });

  const widthHalf = width ? width / 2 : 0;
  const cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000000" opacity="0.3" height="${width}" viewBox="0 0 ${width} ${width}" width="${width}"><circle cx="${widthHalf}" cy="${widthHalf}" r="${widthHalf}" fill="%23000000" /></svg>') ${widthHalf} ${widthHalf}, auto`;

  useEffect(() => {
    const pusher = new Pusher(pusher_key, {
      cluster: pusher_cluster,
    });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 2.5;

    const channel = pusher.subscribe("painting");
    channel.bind("draw", (data) => {
      const { userId, line, strokeStyle, lineWidth } = data;
      if (userId !== userId.current) {
        line.forEach((position) => {
          paint(position.start, position.stop, strokeStyle, lineWidth);
        });
      }
    });

    return () => {
      channel.unbind("draw");
      pusher.unsubscribe("painting");
    };
  }, []);

  const onMouseDown = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    isPainting.current = true;
    prevPos.current = { offsetX, offsetY };
  };

  const onMouseMove = ({ nativeEvent }) => {
    if (isPainting.current) {
      const ctx = canvasRef.current.getContext("2d");
      const { offsetX, offsetY } = nativeEvent;
      const offSetData = { offsetX, offsetY };
      const position = {
        start: { ...prevPos.current },
        stop: { ...offSetData },
      };
      line.current = line.current.concat(position);
      paint(prevPos.current, offSetData, ctx.strokeStyle, ctx.lineWidth);
    }
  };

  const endPaintEvent = () => {
    if (isPainting.current) {
      isPainting.current = false;
      sendPaintData();
    }
  };

  const paint = (prevPos, currPos, strokeStyle, lineWidth) => {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;

    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.moveTo(x, y);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();

    prevPos.current = { offsetX, offsetY };
  };

  /**
   * Sends the paint data to the server.
   */
  const sendPaintData = async () => {
    const ctx = canvasRef.current.getContext("2d");
    const body = {
      line: line.current,
      userId: userId.current,
      strokeStyle: ctx.strokeStyle,
      lineWidth: ctx.lineWidth
    };
    try {
      const req = await fetch(url, {
        method: "post",
        body: JSON.stringify(body),
        headers: {
          "content-type": "application/json",
        },
      });

      await req.json();
      line.current = [];
    }
    catch (err) {
      console.error(err)
    }
  };

  return (
    <canvas
      ref={canvasRef}
      style={{ cursor }}
      onMouseDown={onMouseDown}
      onMouseLeave={endPaintEvent}
      onMouseUp={endPaintEvent}
      onMouseMove={onMouseMove}
    />
  );
};

export default Canvas;