"use client"

import { motion } from "framer-motion"

export function LoadingAnimation() {
  return (
    <div className="flex items-center justify-center h-40">
      <div className="relative w-20 h-20">
        {/* Orbit */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />

        {/* Planet */}
        <motion.div
          className="absolute w-4 h-4 rounded-full bg-primary"
          initial={{ x: 0, y: -36 }}
          animate={{
            rotate: 360,
          }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          style={{ transformOrigin: "center center", translate: "0 -36px" }}
        />

        {/* Center sun */}
        <motion.div
          className="absolute w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{
            boxShadow: [
              "0 0 10px 2px rgba(255, 165, 0, 0.3)",
              "0 0 20px 5px rgba(255, 165, 0, 0.5)",
              "0 0 10px 2px rgba(255, 165, 0, 0.3)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        />
      </div>
    </div>
  )
}
