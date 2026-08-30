"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Zap, ShieldCheck, Award, Layers, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Point3D {
  x: number;
  y: number;
  z: number;
  origX: number;
  origY: number;
  origZ: number;
  size: number;
}

export function Interactive3DOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 500);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    // Create 3D sphere points
    const points: Point3D[] = [];
    const numPoints = 220;
    const radius = Math.min(width, height) * 0.38;

    for (let i = 0; i < numPoints; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = Math.sqrt(numPoints * Math.PI) * theta;
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      points.push({
        x,
        y,
        z,
        origX: x,
        origY: y,
        origZ: z,
        size: Math.random() * 2 + 1.2,
      });
    }

    let rotX = 0.003;
    let rotY = 0.004;
    let angleX = 0;
    let angleY = 0;
    let targetAngleX = 0;
    let targetAngleY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / width - 0.5;
      const ny = (e.clientY - rect.top) / height - 0.5;
      targetAngleX = ny * 1.5;
      targetAngleY = nx * 1.5;
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse follow interpolation
      angleX += (targetAngleX - angleX) * 0.05 + rotX;
      angleY += (targetAngleY - angleY) * 0.05 + rotY;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const cx = width / 2;
      const cy = height / 2;
      const fov = 400;

      // Project & Transform Points
      const projected: Array<{ x: number; y: number; z: number; size: number; alpha: number }> = [];

      for (let i = 0; i < points.length; i++) {
        const p = points[i];

        // Rotate Y
        let x1 = p.origX * cosY - p.origZ * sinY;
        let z1 = p.origZ * cosY + p.origX * sinY;

        // Rotate X
        let y1 = p.origY * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.origY * sinX;

        // Perspective projection
        const scale = fov / (fov + z2 + radius);
        const projX = cx + x1 * scale;
        const projY = cy + y1 * scale;
        const alpha = Math.max(0.15, Math.min(1, (z2 + radius) / (2 * radius)));

        projected.push({
          x: projX,
          y: projY,
          z: z2,
          size: p.size * scale,
          alpha,
        });
      }

      // Draw interconnecting holographic lines
      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const distSq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2;

          if (distSq < 2800) {
            const lineAlpha = (1 - distSq / 2800) * 0.25 * ((p1.alpha + p2.alpha) / 2);
            ctx.strokeStyle = `rgba(147, 197, 253, ${lineAlpha})`; // Soft luminous electric blue
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw Points / Glowing Nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.fillStyle = `rgba(224, 231, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra subtle glow for front nodes
        if (p.z > radius * 0.4) {
          ctx.fillStyle = `rgba(96, 165, 250, ${p.alpha * 0.4})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[500px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0b0f19] via-[#0f172a] to-[#090d16] text-white select-none p-6"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 3D Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0 pointer-events-none" />

      {/* Floating 3D Holographic Badges */}
      <div className="relative z-10 w-full max-w-md h-[440px] flex flex-col justify-between pointer-events-none">
        {/* Top Floating Badge */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="self-start pointer-events-auto"
        >
          <div className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Groq LPU Synthesis</p>
              <p className="text-[10px] text-blue-200/70">Sub-600ms AI Curriculum Engine</p>
            </div>
          </div>
        </motion.div>

        {/* Center Floating Core Badge */}
        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="self-center text-center space-y-1 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl shadow-2xl"
        >
          <Badge variant="outline" className="text-[10px] text-blue-300 border-blue-400/30 bg-blue-500/10 mb-1">
            <Brain className="w-3 h-3 mr-1" /> Autonomous Capacity AI
          </Badge>
          <h2 className="text-xl font-black tracking-tight text-white font-sans">
            AXORIA PLATFORM
          </h2>
          <p className="text-[11px] text-slate-300 max-w-[240px]">
            Zero-to-Course in &lt;2s • Verifiable Credentials
          </p>
        </motion.div>

        {/* Bottom Floating Badges */}
        <div className="flex items-center justify-between w-full">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="pointer-events-auto"
          >
            <div className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex items-center gap-2.5">
              <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Zero-Trust RBAC</p>
                <p className="text-[10px] text-emerald-200/70">Enterprise Governance</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="pointer-events-auto"
          >
            <div className="p-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl flex items-center gap-2.5">
              <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Ledger Certificates</p>
                <p className="text-[10px] text-amber-200/70">Immutable SHA-256 ID</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
