import { useCallback, useRef, useState } from "react";

export const useToolbar = ({ ctx }) => {
  const [isRegularMode, setIsRegularMode] = useState(true);
  const [isAutoWidth, setIsAutoWidth] = useState(false);
  const [isEraser, setIsEraser] = useState(false);

  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentWidth, setCurrentWidth] = useState(50);

  const autoWidth = useRef(false);
  const selectedSaturation = useRef(100);
  const selectedLightness = useRef(50);
  const selectedColor = useRef("#000000");
  const selectedLineWidth = useRef(50);
  const hue = useRef(0);
  const direction = useRef(true);
  const isRegularPaintMode = useRef(true);
  const isEraserMode = useRef(false);

  // useEffect(() => {
  //   if (!canvas.current) return;

  //   console.log("useEffect");
  //   canvas.current.width = window.innerWidth - 196;
  //   canvas.current.height = window.innerHeight;

  //   const ctx = canvas.current.getContext("2d");
  //   ctx.lineJoin = "round";
  //   ctx.lineCap = "round";
  //   ctx.lineWidth = 10;

  //   setCtx(ctx);

  //   setIsReady(true);
  // }, []);

  const dynamicLineWidth = useCallback(() => {
    if (ctx.lineWidth > 90 || ctx.lineWidth < 10) {
      direction.current = !direction.current;
    }
    direction.current ? ctx.lineWidth++ : ctx.lineWidth--;
    setCurrentWidth(ctx.lineWidth);
  }, [ctx]);

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

  // const handleClear = useCallback(() => {
  // ctx.clearRect(0, 0, canvas.current.width, canvas.current.height);
  // }, [ctx]);

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
      currentWidth,
      currentColor,
      isRegularMode,
      isAutoWidth,
      isEraser,
      handleRegularMode,
      handleSpecialMode,
      handleColor,
      handleWidth,
      dynamicLineWidth,
      handleEraserMode,
      setAutoWidth,
      setCurrentSaturation,
      setCurrentLightness,
    },
  ];
};
