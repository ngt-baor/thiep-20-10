"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

const FlowerVideoTransition = forwardRef(function FlowerVideoTransition(
  { onCardReveal, onTransitionEnd },
  ref
) {
  const overlayRef = useRef(null);
  const videoRef = useRef(null);
  const activeRef = useRef(false);
  const onCardRevealRef = useRef(onCardReveal);
  const onTransitionEndRef = useRef(onTransitionEnd);

  onCardRevealRef.current = onCardReveal;
  onTransitionEndRef.current = onTransitionEnd;

  function finishTransition() {
    if (!activeRef.current) return;
    activeRef.current = false;
    videoRef.current?.pause();
    overlayRef.current?.classList.add("is-idle");
    onCardRevealRef.current?.();
    onTransitionEndRef.current?.();
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.addEventListener("ended", finishTransition);
    video.addEventListener("error", finishTransition);

    return () => {
      activeRef.current = false;
      video.removeEventListener("ended", finishTransition);
      video.removeEventListener("error", finishTransition);
      video.pause();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    start() {
      const video = videoRef.current;
      if (!video) return;

      activeRef.current = true;
      overlayRef.current?.classList.remove("is-idle");

      try {
        video.currentTime = 0;
        const playback = video.play();
        playback?.catch(finishTransition);
      } catch {
        finishTransition();
      }
    },
    stop() {
      activeRef.current = false;
      videoRef.current?.pause();
      overlayRef.current?.classList.add("is-idle");
    },
  }));

  return (
    <div
      ref={overlayRef}
      className="flower-bloom-overlay is-idle"
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        className="flower-bloom-video"
        src="/videos/flower-transition.mp4"
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
      />
    </div>
  );
});

export default FlowerVideoTransition;
