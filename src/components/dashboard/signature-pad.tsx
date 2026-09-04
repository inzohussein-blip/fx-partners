"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type SignaturePadHandle = {
  toDataURL: () => string;
  clear: () => void;
  isEmpty: () => boolean;
};

/**
 * Lightweight canvas signature pad (mouse + touch). Dark ink on a light
 * pad so the exported PNG reads clearly on the white PDF page.
 */
export const SignaturePad = forwardRef<SignaturePadHandle>(function SignaturePad(
  _props,
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const empty = useRef(true);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
  }, []);

  function pos(e: MouseEvent | TouchEvent) {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    const p = "touches" in e ? e.touches[0] : e;
    return { x: p.clientX - r.left, y: p.clientY - r.top };
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e.nativeEvent);
    ctx.beginPath();
    ctx.moveTo(x, y);
  }
  function move(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current!.getContext("2d")!;
    const { x, y } = pos(e.nativeEvent);
    ctx.lineTo(x, y);
    ctx.stroke();
    empty.current = false;
  }
  function end() {
    drawing.current = false;
  }

  useImperativeHandle(ref, () => ({
    toDataURL: () => canvasRef.current!.toDataURL("image/png"),
    clear: () => {
      const c = canvasRef.current!;
      c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
      empty.current = true;
    },
    isEmpty: () => empty.current,
  }));

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={start}
      onMouseMove={move}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={start}
      onTouchMove={move}
      onTouchEnd={end}
      className="h-40 w-full cursor-crosshair touch-none rounded-xl bg-slate-100"
    />
  );
});
