import React, { useEffect, useRef } from "react";
import { v4 } from "uuid";
import Pusher from "pusher-js";

const url = process.env.BACKEND_URL || "http://localhost:4000/paint";
const userStrokeStyle = "#EE92C2";
const guestStrokeStyle = "#F0C987";

const Canvas = ({canvasRef, width}) => {
  const isPainting = useRef(false);
  const line = useRef([]);
  const userId = useRef(v4());
  const prevPos = useRef({ offsetX: 0, offsetY: 0 });

  const widthHalf = width ? width / 2 : 0;
  const cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%23000000" opacity="0.3" height="${width}" viewBox="0 0 ${width} ${width}" width="${width}"><circle cx="${widthHalf}" cy="${widthHalf}" r="${widthHalf}" fill="%23000000" /></svg>') ${widthHalf} ${widthHalf}, auto`;
  
  
  useEffect(() => {
    const pusher = new Pusher("1e5ba9b60e39d68d2587", {
      cluster: "ap2",
    });
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 5;
    
    const channel = pusher.subscribe("painting");
    channel.bind("draw", (data) => {
      const { userId, line } = data;
      if (userId !== userId.current) {
        line.forEach((position) => {
          paint(position.start, position.stop, guestStrokeStyle);
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
      const { offsetX, offsetY } = nativeEvent;
      const offSetData = { offsetX, offsetY };
      const position = {
        start: { ...prevPos.current },
        stop: { ...offSetData },
      };
      line.current = line.current.concat(position);
      paint(prevPos.current, offSetData, userStrokeStyle);
    }
  };
  
  const endPaintEvent = () => {
    if (isPainting.current) {
      isPainting.current = false;
      sendPaintData();
    }
  };
  
  const paint = (prevPos, currPos, strokeStyle) => {
    const { offsetX, offsetY } = currPos;
    const { offsetX: x, offsetY: y } = prevPos;
  
    const ctx = canvasRef.current.getContext("2d");
    ctx.beginPath();
    ctx.strokeStyle = strokeStyle;
    ctx.moveTo(x, y);
    ctx.lineTo(offsetX, offsetY);
    ctx.stroke();
  
    prevPos.current = { offsetX, offsetY };
  };
  
  const sendPaintData = async () => {
    const body = {
      line: line.current,
      userId: userId.current,
    };
    
    try{
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
    catch(err){
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