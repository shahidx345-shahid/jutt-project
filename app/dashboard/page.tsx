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

type Invoice = {
  id: number
  invoice_number: string
  customer_name: string
  total_amount: number
  status: string
  issue_date: string
  created_at: string
}

type Product = {
  id: number
  name: string
  price: number
  stock: number
}

type Customer = {
  id: number
  name: string
  email: string
}

type MonthlyData = {
  month: string
  revenue: number
  invoices: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [greeting, setGreeting] = useState("")
  const [mounted, setMounted] = useState(false)
  const { theme, resolvedTheme } = useTheme()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

  useEffect(() => {
    setMounted(true)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  // Fetch all data
  useEffect(() => {
    if (mounted) {
      fetchDashboardData()
    }
  }, [mounted])

  const fetchDashboardData = async () => {
    try {
      const [invoicesRes, productsRes, customersRes] = await Promise.all([
        fetch("/api/invoices"),
        fetch("/api/products"),
        fetch("/api/customers"),
      ])

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData)
        generateMonthlyData(invoicesData)
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      }

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateMonthlyData = (invoicesData: Invoice[]) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()

    // Generate last 12 months
    const months: MonthlyData[] = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentYear, currentDate.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      const monthInvoices = invoicesData.filter((invoice) => {
        const invoiceDate = new Date(invoice.issue_date)
        const invoiceMonthKey = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, "0")}`
        return invoiceMonthKey === monthKey
      })

      months.push({
        month: monthNames[date.getMonth()],
        revenue: monthInvoices.reduce((sum, inv) => sum + inv.total_amount, 0),
        invoices: monthInvoices.length,
      })
    }

    setMonthlyData(months)
  }

  // Calculate statistics
  const totalRevenue = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0)
  const totalProducts = products.length
  const totalCustomers = customers.length
  const totalInvoices = invoices.length
  const recentInvoices = invoices
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

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

  if (!mounted) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-7">
            <div className="lg:col-span-4 h-96 bg-muted rounded"></div>
            <div className="lg:col-span-3 h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const isDark = theme === "dark" || resolvedTheme === "dark"

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
              <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {invoices.length > 0 ? `From ${invoices.length} invoices` : "No invoices yet"}
              </p>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: totalRevenue > 0 ? "80%" : "0%" }}
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
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalProducts > 0 ? "Active products" : "No products added"}
              </p>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: totalProducts > 0 ? "60%" : "0%" }}
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
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalCustomers > 0 ? "Registered customers" : "No customers added"}
              </p>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: totalCustomers > 0 ? "40%" : "0%" }}
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
              <div className="text-2xl font-bold">{totalInvoices}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {invoices.filter((i) => i.status === "pending").length > 0
                  ? `${invoices.filter((i) => i.status === "pending").length} pending`
                  : "All up to date"}
              </p>
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: totalInvoices > 0 ? "20%" : "0%" }}
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
              <CardDescription>Your revenue for the past 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <RevenueChart isDark={isDark} data={monthlyData} />
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
                {recentInvoices.length > 0 ? (
                  recentInvoices.map((invoice, index) => (
                    <ActivityItem
                      key={invoice.id}
                      icon={<FileText className="h-4 w-4" />}
                      color="blue"
                      title={`Invoice ${invoice.invoice_number}`}
                      description={`${invoice.customer_name} - $${invoice.total_amount.toFixed(2)}`}
                      time={new Date(invoice.created_at).toLocaleDateString()}
                      delay={index * 0.1}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No recent activity</p>
                    <p className="text-xs text-muted-foreground">Create your first invoice to see activity</p>
                  </div>
                )}
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
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
        <p className="text-xs text-muted-foreground mt-1">{time}</p>
      </div>
    </motion.div>
  )
}

function RevenueChart({ isDark, data }: { isDark: boolean; data: MonthlyData[] }) {
  const barColor = isDark ? "rgba(124, 58, 237, 0.8)" : "rgba(124, 58, 237, 0.6)"
  const textColor = isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)"

  if (data.length === 0 || data.every((item) => item.revenue === 0)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
        <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">No revenue data yet</p>
        <p className="text-sm">Create invoices to see your revenue chart</p>
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map((item) => item.revenue))

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-end">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end h-full px-1">
            <motion.div
              className="w-full max-w-8 rounded-t-sm relative group cursor-pointer"
              style={{
                backgroundColor: barColor,
                height: maxRevenue > 0 ? `${(item.revenue / maxRevenue) * 100}%` : "0%",
                minHeight: item.revenue > 0 ? "4px" : "0px",
              }}
              initial={{ height: 0 }}
              animate={{
                height: maxRevenue > 0 ? `${(item.revenue / maxRevenue) * 100}%` : "0%",
              }}
              transition={{ duration: 1, delay: index * 0.1 }}
              title={`${item.month}: $${item.revenue.toFixed(2)} (${item.invoices} invoices)`}
            >
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                ${item.revenue.toFixed(2)}
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      <div className="flex mt-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 text-center px-1">
            <span className="text-xs" style={{ color: textColor }}>
              {item.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
