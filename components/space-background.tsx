"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

export function SpaceBackground() {
  const [stars, setStars] = useState<{ x: number; y: number; size: number; opacity: number; delay: number }[]>([])
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const generateStars = () => {
      const newStars = []
      for (let i = 0; i < 150; i++) {
        newStars.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.7 + 0.3,
          delay: Math.random() * 5,
        })
      }
      setStars(newStars)
    }

    generateStars()

    // Regenerate stars on window resize for better responsiveness
    const handleResize = () => {
      generateStars()
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [mounted])

  if (!mounted) {
    return <div className="fixed inset-0 bg-background" />
  }

  const isDark = theme === "dark" || resolvedTheme === "dark"

  return (
    <motion.div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      animate={{
        background: isDark
          ? "radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)"
          : "radial-gradient(ellipse at bottom, #f0f4fd 0%, #e6eefa 100%)",
      }}
      transition={{ duration: 0.8 }}
    >
      {stars.map((star, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
          }}
          animate={{
            opacity: [star.opacity, star.opacity * 1.5, star.opacity],
            backgroundColor: isDark ? "#ffffff" : "#1a1a2e",
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: star.delay,
            opacity: { duration: Math.random() * 3 + 2 },
            backgroundColor: { duration: 0.8 },
          }}
        />
      ))}

      {/* Nebula effects */}
      <motion.div
        className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 blur-3xl rounded-full"
        animate={{
          backgroundColor: isDark ? "rgba(128, 90, 213, 0.05)" : "rgba(128, 90, 213, 0.03)",
        }}
        transition={{ duration: 0.8 }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-1/3 h-1/3 blur-3xl rounded-full"
        animate={{
          backgroundColor: isDark ? "rgba(59, 130, 246, 0.05)" : "rgba(59, 130, 246, 0.03)",
        }}
        transition={{ duration: 0.8 }}
      />
    </motion.div>
  )
}
