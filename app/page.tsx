"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlanetAnimation } from "@/components/planet-animation"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="min-h-screen flex flex-col">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border/40 backdrop-blur-sm bg-background/30 sticky top-0 z-40"
      >
        <div className="container mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-600 animate-pulse" />
            </div>
            <span className="font-bold text-xl">Cosmic Invoicer</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      <div className="flex-1 container mx-auto px-4 sm:px-6 py-8 sm:py-12 grid lg:grid-cols-2 gap-8 items-center">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
          <motion.h1 variants={item} className="text-4xl md:text-6xl font-bold tracking-tight">
            <span className="block">Stellar Invoicing for</span>
            <span className="bg-gradient-to-r from-primary via-blue-500 to-indigo-600 text-transparent bg-clip-text">
              Your Cosmic Business
            </span>
          </motion.h1>
          <motion.p variants={item} className="text-muted-foreground text-lg md:text-xl">
            Generate professional invoices with our solar system-themed invoice generator. Track products, customers,
            and payments with ease.
          </motion.p>
          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full">
                Get Started
              </Button>
            </Link>
            <Link href="/demo" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">
                View Demo
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative h-[300px] sm:h-[400px] flex items-center justify-center"
        >
          {mounted && <PlanetAnimation />}
        </motion.div>
      </div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="border-t border-border/40 py-6 backdrop-blur-sm bg-background/30"
      >
        <div className="container mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Cosmic Invoicer. All rights reserved.
        </div>
      </motion.footer>
    </div>
  )
}
