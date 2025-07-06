"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { DollarSign, Users, Package, FileText, TrendingUp, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type DashboardStats = {
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  totalInvoices: number
  recentInvoices: Array<{
    id: number
    invoice_number: string
    customer_name: string
    total_amount: number
    created_at: string
  }>
  monthlyRevenue: Array<{
    month: string
    revenue: number
  }>
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel
      const [customersRes, productsRes, invoicesRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/products"),
        fetch("/api/invoices"),
      ])

      const [customers, products, invoices] = await Promise.all([
        customersRes.ok ? customersRes.json() : [],
        productsRes.ok ? productsRes.json() : [],
        invoicesRes.ok ? invoicesRes.json() : [],
      ])

      // Calculate stats
      const totalRevenue = invoices.reduce((sum: number, invoice: any) => {
        const amount =
          typeof invoice.total_amount === "string" ? Number.parseFloat(invoice.total_amount) : invoice.total_amount
        return sum + (amount || 0)
      }, 0)

      // Get recent invoices (last 3)
      const recentInvoices = invoices
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3)
        .map((invoice: any) => ({
          ...invoice,
          total_amount:
            typeof invoice.total_amount === "string" ? Number.parseFloat(invoice.total_amount) : invoice.total_amount,
        }))

      // Calculate monthly revenue for the last 12 months
      const monthlyRevenue = calculateMonthlyRevenue(invoices)

      setStats({
        totalRevenue,
        totalCustomers: customers.length,
        totalProducts: products.length,
        totalInvoices: invoices.length,
        recentInvoices,
        monthlyRevenue,
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateMonthlyRevenue = (invoices: any[]) => {
    const months = []
    const now = new Date()

    // Generate last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

      const monthRevenue = invoices
        .filter((invoice: any) => {
          const invoiceDate = new Date(invoice.created_at)
          const invoiceMonthKey = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, "0")}`
          return invoiceMonthKey === monthKey
        })
        .reduce((sum: number, invoice: any) => {
          const amount =
            typeof invoice.total_amount === "string" ? Number.parseFloat(invoice.total_amount) : invoice.total_amount
          return sum + (amount || 0)
        }, 0)

      months.push({
        month: monthName,
        revenue: monthRevenue,
      })
    }

    return months
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-80 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-cosmic bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Welcome to your cosmic invoice management system</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-cosmic-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cosmic-green">${stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From {stats.totalInvoices} invoices</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Customers</CardTitle>
              <Users className="h-4 w-4 text-cosmic-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cosmic-blue">{stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Active customers</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-cosmic-purple" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cosmic-purple">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">In inventory</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="glass-effect hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Invoices</CardTitle>
              <FileText className="h-4 w-4 text-cosmic-orange" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cosmic-orange">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">Total generated</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="glass-effect hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cosmic-green" />
                Monthly Revenue
              </CardTitle>
              <CardDescription>Revenue trend over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {stats.monthlyRevenue.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: any) => [`$${value.toFixed(2)}`, "Revenue"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No revenue data available</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="glass-effect hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-cosmic-blue" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest invoices and transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentInvoices.length > 0 ? (
                  stats.recentInvoices.map((invoice, index) => (
                    <motion.div
                      key={invoice.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                          <FileText className="h-4 w-4 text-cosmic-blue" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{invoice.invoice_number}</p>
                          <p className="text-xs text-muted-foreground">{invoice.customer_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-cosmic-green">${invoice.total_amount.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(invoice.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No recent invoices</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:bg-cosmic-blue/5 transition-colors border-cosmic-blue/20">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 text-cosmic-blue mx-auto mb-2" />
                    <h3 className="font-semibold text-cosmic-blue">Create Invoice</h3>
                    <p className="text-xs text-muted-foreground mt-1">Generate a new invoice</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:bg-cosmic-green/5 transition-colors border-cosmic-green/20">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-cosmic-green mx-auto mb-2" />
                    <h3 className="font-semibold text-cosmic-green">Add Customer</h3>
                    <p className="text-xs text-muted-foreground mt-1">Register a new customer</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="cursor-pointer hover:bg-cosmic-purple/5 transition-colors border-cosmic-purple/20">
                  <CardContent className="p-4 text-center">
                    <Package className="h-8 w-8 text-cosmic-purple mx-auto mb-2" />
                    <h3 className="font-semibold text-cosmic-purple">Add Product</h3>
                    <p className="text-xs text-muted-foreground mt-1">Add to your inventory</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
