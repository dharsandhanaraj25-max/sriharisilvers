"use client";

import { useEffect, useRef } from "react";

interface DottedSurfaceProps {
  className?: string;
  /** Dot color as an "r,g,b" triplet. Defaults to white for dark panels. */
  color?: string;
  /** Peak opacity of the nearest dots (0–1). */
  opacity?: number;
}

/**
 * Animated dot-grid wave rendered on a plain 2D canvas.
 * Perspective-projected grid of dots rises and falls on layered sine
 * waves, with a gentle parallax drift that follows the pointer.
 * Respects prefers-reduced-motion (renders one static frame) and
 * pauses while the tab is hidden.
 */
export function DottedSurface({ className = "", color = "255,255,255", opacity = 0.35 }: DottedSurfaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const COLS = 46;
    const ROWS = 34;
    const SEPARATION = 64;
    const FOCAL = 620;
    const CAM_HEIGHT = 300;
    const CAM_DEPTH = 1350;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let phase = 0;
    let lastTime = 0;
    let rafId = 0;
    // Pointer parallax, lerped so movement stays soft
    let targetShift = 0;
    let shift = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const horizon = height * 0.38;

      for (let ix = 0; ix < COLS; ix++) {
        for (let iz = 0; iz < ROWS; iz++) {
          const wx = (ix - COLS / 2) * SEPARATION + shift;
          const wz = (iz - ROWS / 2) * SEPARATION + CAM_DEPTH;
          if (wz <= FOCAL * 0.3) continue;
          const wy =
            Math.sin((ix + phase) * 0.3) * 26 +
            Math.sin((iz + phase) * 0.5) * 26;

          const scale = FOCAL / wz;
          const sx = cx + wx * scale;
          const sy = horizon + (CAM_HEIGHT - wy) * scale;
          if (sx < -4 || sx > width + 4 || sy < -4 || sy > height + 4) continue;

          const alpha = Math.min(1, Math.max(0.12, scale * 1.1)) * opacity;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.max(0.6, 2.1 * scale), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color},${alpha.toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    const loop = (now: number) => {
      const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0.016;
      lastTime = now;
      phase += dt * 2.2;
      shift += (targetShift - shift) * Math.min(1, dt * 4);
      draw();
      rafId = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetShift = ((e.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 60;
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
        lastTime = 0;
      } else if (!reduceMotion) {
        rafId = requestAnimationFrame(loop);
      }
    };

    resize();
    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw();
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    if (reduceMotion) {
      draw();
    } else {
      rafId = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [color, opacity]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    />
  );
}
