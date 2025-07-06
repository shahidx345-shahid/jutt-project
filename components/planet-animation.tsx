"use client"

import { motion } from "framer-motion"
import { useEffect, useState, useRef } from "react"
import { useTheme } from "next-themes"

export function PlanetAnimation() {
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500" />
      </div>
    )
  }

  const isDark = theme === "dark" || resolvedTheme === "dark"

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Sun */}
      <motion.div
        className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full"
        style={{
          background: isDark
            ? "radial-gradient(circle at 30% 30%, #ffd700, #ff8c00)"
            : "radial-gradient(circle at 30% 30%, #ffeb3b, #ff9800)",
        }}
        initial={{ scale: 0.8 }}
        animate={{
          scale: [0.8, 1, 0.8],
          boxShadow: isDark
            ? [
                "0 0 20px 5px rgba(255, 165, 0, 0.5)",
                "0 0 30px 10px rgba(255, 165, 0, 0.7)",
                "0 0 20px 5px rgba(255, 165, 0, 0.5)",
              ]
            : [
                "0 0 20px 5px rgba(255, 152, 0, 0.3)",
                "0 0 30px 10px rgba(255, 152, 0, 0.5)",
                "0 0 20px 5px rgba(255, 152, 0, 0.3)",
              ],
        }}
        transition={{
          duration: 4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      >
        {/* Sun surface details */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-70"
          style={{
            background: "radial-gradient(circle at 70% 70%, transparent 0%, rgba(0,0,0,0.2) 100%)",
          }}
        />
      </motion.div>

      {/* Mercury Orbit */}
      <motion.div
        className="absolute w-32 h-32 rounded-full border border-dashed"
        style={{ borderColor: isDark ? "rgba(200, 200, 200, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Mercury */}
        <motion.div
          className="absolute w-3 h-3 rounded-full"
          style={{
            top: "calc(50% - 1.5px)",
            left: "-1.5px",
            background: isDark
              ? "radial-gradient(circle at 30% 30%, #d3d3d3, #a9a9a9)"
              : "radial-gradient(circle at 30% 30%, #e0e0e0, #bdbdbd)",
          }}
        />
      </motion.div>

      {/* Venus Orbit */}
      <motion.div
        className="absolute w-48 h-48 rounded-full border border-dashed"
        style={{ borderColor: isDark ? "rgba(200, 200, 200, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 15,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Venus */}
        <motion.div
          className="absolute w-5 h-5 rounded-full"
          style={{
            top: "calc(50% - 2.5px)",
            right: "-2.5px",
            background: isDark
              ? "radial-gradient(circle at 30% 30%, #e6c35c, #d4a017)"
              : "radial-gradient(circle at 30% 30%, #fff59d, #ffd54f)",
          }}
        />
      </motion.div>

      {/* Earth Orbit */}
      <motion.div
        className="absolute w-64 h-64 rounded-full border border-dashed"
        style={{ borderColor: isDark ? "rgba(200, 200, 200, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Earth */}
        <motion.div
          className="absolute w-8 h-8 rounded-full"
          style={{
            top: "calc(50% - 4px)",
            left: "-4px",
            background: isDark
              ? "radial-gradient(circle at 30% 30%, #4b6cb7, #182848)"
              : "radial-gradient(circle at 30% 30%, #64b5f6, #1976d2)",
          }}
        >
          {/* Earth cloud layer */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-40"
            style={{
              background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 70%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          {/* Moon */}
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-gray-300"
            style={{
              top: "-4px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
        </motion.div>
      </motion.div>

      {/* Mars Orbit */}
      <motion.div
        className="absolute w-80 h-80 rounded-full border border-dashed"
        style={{ borderColor: isDark ? "rgba(200, 200, 200, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Mars */}
        <motion.div
          className="absolute w-6 h-6 rounded-full"
          style={{
            top: "calc(50% - 3px)",
            right: "-3px",
            background: isDark
              ? "radial-gradient(circle at 30% 30%, #ff5252, #b71c1c)"
              : "radial-gradient(circle at 30% 30%, #ffab91, #e64a19)",
          }}
        />
      </motion.div>

      {/* Jupiter Orbit */}
      <motion.div
        className="absolute w-96 h-96 rounded-full border border-dashed"
        style={{ borderColor: isDark ? "rgba(200, 200, 200, 0.1)" : "rgba(0, 0, 0, 0.1)" }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 40,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      >
        {/* Jupiter */}
        <motion.div
          className="absolute w-12 h-12 rounded-full"
          style={{
            top: "calc(50% - 6px)",
            left: "-6px",
            background: isDark
              ? "radial-gradient(circle at 30% 30%, #f9d59c, #c8a97e)"
              : "radial-gradient(circle at 30% 30%, #ffe0b2, #ffb74d)",
          }}
        >
          {/* Jupiter bands */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
            }}
          />
        </motion.div>
      </motion.div>

      {/* Invoice floating */}
      <motion.div
        className="absolute w-40 h-56 bg-background/80 backdrop-blur-md rounded-lg shadow-lg border border-primary/30 flex flex-col p-4 overflow-hidden"
        initial={{ x: 100, y: -50, opacity: 0 }}
        animate={{
          x: [100, 120, 100],
          y: [-50, -30, -50],
          opacity: 1,
          rotateZ: [2, -2, 2],
        }}
        transition={{
          duration: 8,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          opacity: { duration: 1 },
        }}
      >
        <div className="text-xs font-bold text-primary mb-2">INVOICE</div>
        <div className="w-full h-3 bg-muted rounded mb-2"></div>
        <div className="w-3/4 h-3 bg-muted rounded mb-4"></div>
        <div className="flex justify-between mb-2">
          <div className="w-1/3 h-2 bg-muted rounded"></div>
          <div className="w-1/4 h-2 bg-muted rounded"></div>
        </div>
        <div className="flex justify-between mb-2">
          <div className="w-1/3 h-2 bg-muted rounded"></div>
          <div className="w-1/4 h-2 bg-muted rounded"></div>
        </div>
        <div className="flex justify-between mb-2">
          <div className="w-1/3 h-2 bg-muted rounded"></div>
          <div className="w-1/4 h-2 bg-muted rounded"></div>
        </div>
        <div className="mt-auto">
          <div className="w-full h-6 bg-primary/20 rounded"></div>
        </div>
      </motion.div>

      {/* Shooting stars */}
      <ShootingStar delay={2} top="10%" left="20%" isDark={isDark} />
      <ShootingStar delay={5} top="30%" left="70%" isDark={isDark} />
      <ShootingStar delay={8} top="60%" left="40%" isDark={isDark} />
    </div>
  )
}

function ShootingStar({ delay, top, left, isDark }: { delay: number; top: string; left: string; isDark: boolean }) {
  return (
    <motion.div
      className="absolute h-px w-20"
      style={{
        top,
        left,
        background: isDark ? "white" : "#1a1a2e",
      }}
      initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0],
        x: 100,
        y: 100,
        scale: [0, 1, 0],
      }}
      transition={{
        duration: 1,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: 15,
      }}
    />
  )
}
