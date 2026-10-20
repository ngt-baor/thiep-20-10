"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { FlowerBloomEngine, prewarmFlowerSprites } from "../lib/flowerBloomEngine";

const FlowerBloomCanvas = forwardRef(function FlowerBloomCanvas(
  { onCardReveal, onTransitionEnd },
  ref
) {
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const onCardRevealRef = useRef(onCardReveal);
  const onTransitionEndRef = useRef(onTransitionEnd);

  onCardRevealRef.current = onCardReveal;
  onTransitionEndRef.current = onTransitionEnd;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Prewarm sprites in idle time so start() has 0ms generation cost
    prewarmFlowerSprites();

    const engine = new FlowerBloomEngine(
      canvas,
      () => onCardRevealRef.current?.(),
      () => {
        if (overlayRef.current) {
          overlayRef.current.classList.add("is-idle");
        }
        onTransitionEndRef.current?.();
      }
    );
    engineRef.current = engine;

    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.stop();
      engineRef.current = null;
    };
  }, []);

  useImperativeHandle(ref, () => ({
    start() {
      if (overlayRef.current) {
        overlayRef.current.classList.remove("is-idle");
      }
      engineRef.current?.start();
    },
    stop() {
      engineRef.current?.stop();
      if (overlayRef.current) {
        overlayRef.current.classList.add("is-idle");
      }
    },
  }));

  return (
    <div
      ref={overlayRef}
      className="flower-bloom-overlay is-idle"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="flower-bloom-canvas" />
    </div>
  );
});

export default FlowerBloomCanvas;
