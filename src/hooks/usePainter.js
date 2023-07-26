import { useCallback, useRef, useState, useEffect } from "react";

import useSocketIo from "./useSocketIo";

let line = [];

export const usePainter = () => {
  const canvas = useRef();

  const [isReady, setIsReady] = useState(false);
  const [isRegularMode, setIsRegularMode] = useState(true);
  const [isAutoWidth, setIsAutoWidth] = useState(false);
  const [isEraser, setIsEraser] = useState(false);
  // const [line, setLine] = useState([]);

  const [ctx, setCtx] = useState();

  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentWidth, setCurrentWidth] = useState(50);

  const autoWidth = useRef(false);
  const selectedSaturation = useRef(100);
  const selectedLightness = useRef(50);
  const selectedColor = useRef("#000000");
  const selectedLineWidth = useRef(50);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const hue = useRef(0);
  const isDrawing = useRef(false);
  const direction = useRef(true);
  const isRegularPaintMode = useRef(true);
  const isEraserMode = useRef(false);

  useEffect(() => {
    if (!canvas.current) return;

    console.log("useEffect");
    canvas.current.width = window.innerWidth - 196;
    canvas.current.height = window.innerHeight;

    const ctx = canvas.current.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 10;

    setCtx(ctx);

    setIsReady(true);
  }, []);

  const paint = useCallback(
    (position) => {
      const { start, stop, strokeStyle, lineWidth, globalCompositeOperation } =
        position;

      console.log("paint", position);

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lineWidth;
      ctx.globalCompositeOperation = globalCompositeOperation;

      ctx.beginPath();
      ctx.moveTo(start.offsetX, start.offsetY);
      ctx.lineTo(stop.offsetX, stop.offsetY);
      ctx.stroke();

      [lastX.current, lastY.current] = [stop.offsetX, stop.offsetY];
    },
    [ctx]
  );

  const onPaint = useCallback(
    (body) => {
      const { line } = body;

      line.forEach((position) => {
        paint(position);
      });
    },
    [paint]
  );

  const dynamicLineWidth = useCallback(() => {
    if (ctx.lineWidth > 90 || ctx.lineWidth < 10) {
      direction.current = !direction.current;
    }
    direction.current ? ctx.lineWidth++ : ctx.lineWidth--;
    setCurrentWidth(ctx.lineWidth);
  }, [ctx]);

  const socketIo = useSocketIo({ onPaint });

  const onMouseDown = ({ nativeEvent }) => {
    console.log("onMouseDown", nativeEvent);

    isDrawing.current = true;
    [lastX.current, lastY.current] = [nativeEvent.offsetX, nativeEvent.offsetY];
  };

  const onMouseMove = ({ nativeEvent }) => {
    // console.log("onMouseMove", e);

    if (!isDrawing.current) return;

    if (isRegularPaintMode.current || isEraserMode.current) {
      ctx.strokeStyle = selectedColor.current;
      setCurrentColor(selectedColor.current);
      autoWidth.current && !isEraserMode.current
        ? dynamicLineWidth()
        : (ctx.lineWidth = selectedLineWidth.current);
      isEraserMode.current
        ? (ctx.globalCompositeOperation = "destination-out")
        : (ctx.globalCompositeOperation = "source-over");
    } else {
      setCurrentColor(
        `hsl(${hue.current},${selectedSaturation.current}%,${selectedLightness.current}%)`
      );
      ctx.strokeStyle = `hsl(${hue.current},${selectedSaturation.current}%,${selectedLightness.current}%)`;
      ctx.globalCompositeOperation = "source-over";

      hue.current++;

      if (hue.current >= 360) hue.current = 0;

      autoWidth.current
        ? dynamicLineWidth()
        : (ctx.lineWidth = selectedLineWidth.current);
    }

    const position = {
      start: { offsetX: lastX.current, offsetY: lastY.current },
      stop: { offsetX: nativeEvent.offsetX, offsetY: nativeEvent.offsetY },
      lineWidth: ctx.lineWidth,
      strokeStyle: ctx.strokeStyle,
      globalCompositeOperation: ctx.globalCompositeOperation,
    };

    line = line.concat(position);

    paint(position);
  };

  const onMouseUp = () => {
    isDrawing.current = false;

    // console.log("line", line);
    socketIo.broadcast({
      line,
    });

    line = [];
  };

  const handleRegularMode = useCallback(() => {
    setIsRegularMode(true);
    isEraserMode.current = false;
    setIsEraser(false);
    isRegularPaintMode.current = true;
  }, []);

  const handleSpecialMode = useCallback(() => {
    setIsRegularMode(false);
    isEraserMode.current = false;
    setIsEraser(false);
    isRegularPaintMode.current = false;
  }, []);

  const handleColor = (e) => {
    setCurrentColor(e.currentTarget.value);
    selectedColor.current = e.currentTarget.value;
  };

  const handleWidth = (e) => {
    setCurrentWidth(e.currentTarget.value);
    selectedLineWidth.current = e.currentTarget.value;
  };

  const handleClear = useCallback(() => {
    ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
  }, [ctx]);

  const handleEraserMode = (e) => {
    autoWidth.current = false;
    setIsAutoWidth(false);
    setIsRegularMode(true);
    isEraserMode.current = true;
    setIsEraser(true);
  };

  const setCurrentSaturation = (e) => {
    setCurrentColor(
      `hsl(${hue.current},${e.currentTarget.value}%,${selectedLightness.current}%)`
    );
    selectedSaturation.current = e.currentTarget.value;
  };

  const setCurrentLightness = (e) => {
    setCurrentColor(
      `hsl(${hue.current},${selectedSaturation.current}%,${e.currentTarget.value}%)`
    );
    selectedLightness.current = e.currentTarget.value;
  };

  const setAutoWidth = (e) => {
    autoWidth.current = e.currentTarget.checked;
    setIsAutoWidth(e.currentTarget.checked);

    if (!e.currentTarget.checked) {
      setCurrentWidth(selectedLineWidth.current);
    } else {
      setCurrentWidth(ctx?.current?.lineWidth ?? selectedLineWidth.current);
    }
  };

  return [
    {
      canvas,
      isReady,
      currentWidth,
      currentColor,
      isRegularMode,
      isAutoWidth,
      isEraser,
    },
    {
      handleRegularMode,
      handleSpecialMode,
      handleColor,
      handleWidth,
      handleClear,
      handleEraserMode,
      setAutoWidth,
      setCurrentSaturation,
      setCurrentLightness,
      onMouseDown,
      onMouseMove,
      onMouseUp,
    },
  ];
};
