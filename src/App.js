import React, { useState, useCallback } from "react";
import { Canvas } from "./components/Canvas";
// import { Goo } from "./components/Goo";
// import { Intro } from "./components/Intro";
import { Toolbar } from "./components/Toolbar";
import { usePainter } from "./hooks/usePainter";

const App = () => {
  const [dateUrl, setDataUrl] = useState("#");
  const [
    { canvas, isReady, ...state },
    { onMouseDown, onMouseMove, endPaintEvent, ...api },
  ] = usePainter();

  const handleDownload = useCallback(() => {
    if (!canvas || !canvas.current) return;

    setDataUrl(canvas.current.toDataURL("image/png"));
  }, [canvas]);

  const toolbarProps = { ...state, ...api, dateUrl, handleDownload };

  return (
    <>
      {/* <Intro isReady={isReady} /> */}
      {/* <Goo /> */}
      <Toolbar {...toolbarProps} />
      <Canvas
        width={state.currentWidth}
        canvasRef={canvas}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        endPaintEvent={endPaintEvent}
      />
    </>
  );
};

export default App;
