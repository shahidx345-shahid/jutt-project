"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { DollarSign, Package, Users, FileText, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { useTheme } from "next-themes"

export default function DashboardPage() {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("")
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  const isDark =
    theme === "dark" ||
    (!mounted && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches)

  useEffect(() => {
    setMounted(true)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="p-4 sm:p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {greeting}, {user?.name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your business today.</p>
      </motion.div>

      <motion.div
        className="grid gap-4 sm:gap-6 mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card className="border-primary/20 bg-background/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground mt-1">+20.1% from last month</p>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: "80%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-primary/20 bg-background/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">+3 new this month</p>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.6 }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-primary/20 bg-background/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground mt-1">+2 new this month</p>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: "40%" }}
                transition={{ duration: 1, delay: 0.7 }}
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-primary/20 bg-background/80 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="relative">
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground mt-1">+1 pending approval</p>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: "20%" }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 mt-6 grid-cols-1 lg:grid-cols-7">
        <motion.div
          className="lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-primary/20 bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Your revenue for the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                {mounted && <RevenueChart isDark={isDark} />}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="border-primary/20 bg-background/80 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent business activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <ActivityItem
                  icon={<TrendingUp className="h-4 w-4" />}
                  color="green"
                  title="New invoice created"
                  description="Invoice #1234 for Customer A"
                  time="2 hours ago"
                  delay={0.1}
                />

                <ActivityItem
                  icon={<Users className="h-4 w-4" />}
                  color="blue"
                  title="New customer added"
                  description="Customer B was added to your list"
                  time="5 hours ago"
                  delay={0.2}
                />

                <ActivityItem
                  icon={<Package className="h-4 w-4" />}
                  color="purple"
                  title="Product updated"
                  description="Product 'Mars Rover' price updated"
                  time="Yesterday"
                  delay={0.3}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        className="mt-6 flex flex-wrap gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Link href="/dashboard/invoices/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
        <Link href="/dashboard/products/create">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
        <Link href="/dashboard/customers/create">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </Link>
      </motion.div>
    </div>
  )
}

function ActivityItem({
  icon,
  color,
  title,
  description,
  time,
  delay,
}: {
  icon: React.ReactNode
  color: string
  title: string
  description: string
  time: string
  delay: number
}) {
  const colorMap = {
    green: "bg-green-500/10 text-green-500",
    blue: "bg-blue-500/10 text-blue-500",
    purple: "bg-purple-500/10 text-purple-500",
  }

  return (
    <motion.div
      className="flex items-start gap-4"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={`rounded-full p-2 ${colorMap[color as keyof typeof colorMap]}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </motion.div>
  )
}

function RevenueChart({ isDark }: { isDark: boolean }) {
  const barColor = isDark ? "rgba(124, 58, 237, 0.8)" : "rgba(124, 58, 237, 0.6)"
  const textColor = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"

  // Mock data for the chart
  const data = [
    { month: "Jan", revenue: 4000 },
    { month: "Feb", revenue: 5000 },
    { month: "Mar", revenue: 3000 },
    { month: "Apr", revenue: 7000 },
    { month: "May", revenue: 5500 },
    { month: "Jun", revenue: 8000 },
    { month: "Jul", revenue: 9500 },
    { month: "Aug", revenue: 11000 },
    { month: "Sep", revenue: 8500 },
    { month: "Oct", revenue: 10000 },
    { month: "Nov", revenue: 9000 },
    { month: "Dec", revenue: 12000 },
  ]

  const maxRevenue = Math.max(...data.map((item) => item.revenue))

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-end">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
            <motion.div
              className="w-5/6 rounded-t-sm"
              style={{ backgroundColor: barColor, height: `${(item.revenue / maxRevenue) * 100}%` }}
              initial={{ height: 0 }}
              animate={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
            />
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center">
            <span className="text-xs" style={{ color: textColor }}>
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
