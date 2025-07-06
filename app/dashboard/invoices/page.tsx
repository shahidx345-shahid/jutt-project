"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, MoreHorizontal, Edit, Trash2, ArrowUpDown, FileText, DollarSign, Clock, Eye } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Invoice = {
  id: number
  invoice_number: string
  customer_name: string
  customer_id: number
  issue_date: string
  due_date: string
  total_amount: string | number
  status: "pending" | "paid" | "overdue"
  created_at: string
}

export default function InvoicesPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  // Fetch invoices
  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices")
      if (response.ok) {
        const data = await response.json()
        // Ensure total_amount is a number
        const normalizedData = data.map((invoice: any) => ({
          ...invoice,
          total_amount:
            typeof invoice.total_amount === "string" ? Number.parseFloat(invoice.total_amount) : invoice.total_amount,
        }))
        setInvoices(normalizedData)
      } else {
        throw new Error("Failed to fetch invoices")
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (!sortConfig) return 0

    const key = sortConfig.key as keyof typeof a
    let aVal = a[key]
    let bVal = b[key]

    // Convert to numbers for total_amount
    if (key === "total_amount") {
      aVal = typeof aVal === "string" ? Number.parseFloat(aVal as string) : aVal
      bVal = typeof bVal === "string" ? Number.parseFloat(bVal as string) : bVal
    }

    if (aVal < bVal) {
      return sortConfig.direction === "ascending" ? -1 : 1
    }
    if (aVal > bVal) {
      return sortConfig.direction === "ascending" ? 1 : -1
    }
    return 0
  })

  // Request sort
  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Delete invoice
  const handleDeleteInvoice = async (id: number) => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setInvoices(invoices.filter((i) => i.id !== id))
        toast({
          title: "Invoice deleted",
          description: "The invoice has been removed successfully.",
        })
      } else {
        throw new Error("Failed to delete invoice")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      })
    }
  }

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-cosmic-green/10 text-cosmic-green border-cosmic-green/20"
      case "pending":
        return "bg-cosmic-yellow/10 text-cosmic-yellow border-cosmic-yellow/20"
      case "overdue":
        return "bg-cosmic-red/10 text-cosmic-red border-cosmic-red/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  // Calculate stats
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, invoice) => {
    const amount =
      typeof invoice.total_amount === "string" ? Number.parseFloat(invoice.total_amount) : invoice.total_amount
    return sum + amount
  }, 0)
  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid").length
  const pendingInvoices = invoices.filter((invoice) => invoice.status === "pending").length

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-cosmic bg-clip-text text-transparent">
            Invoices
          </h1>
          <p className="text-muted-foreground mt-1">Manage your customer invoices</p>
        </div>
        <Link href="/dashboard/invoices/create">
          <Button className="cosmic-glow hover-lift">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card className="glass-effect hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-cosmic-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cosmic-blue">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">All invoices</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-cosmic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cosmic-green">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Invoice value</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <FileText className="h-4 w-4 text-cosmic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cosmic-green">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-cosmic-yellow" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cosmic-yellow">{pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="pl-10 glass-effect"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Invoices Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Invoice Management</CardTitle>
            <CardDescription>Track and manage your customer invoices</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="w-[120px]">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("invoice_number")}
                        className="flex items-center gap-1 hover:bg-transparent text-cosmic-purple"
                      >
                        Invoice #
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("customer_name")}
                        className="flex items-center gap-1 hover:bg-transparent text-cosmic-purple"
                      >
                        Customer
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("issue_date")}
                        className="flex items-center gap-1 hover:bg-transparent text-cosmic-purple"
                      >
                        Date
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("status")}
                        className="flex items-center gap-1 hover:bg-transparent text-cosmic-purple"
                      >
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("total_amount")}
                        className="flex items-center gap-1 justify-end ml-auto hover:bg-transparent text-cosmic-purple"
                      >
                        Amount
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sortedInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No invoices found.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedInvoices.map((invoice, index) => {
                        const totalAmount =
                          typeof invoice.total_amount === "string"
                            ? Number.parseFloat(invoice.total_amount)
                            : invoice.total_amount

                        return (
                          <motion.tr
                            key={invoice.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              <Badge variant="outline" className="font-mono">
                                {invoice.invoice_number}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{invoice.customer_name}</TableCell>
                            <TableCell className="text-sm">
                              {new Date(invoice.issue_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(invoice.status)}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-cosmic-green">
                              ${totalAmount.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-cosmic-purple/10">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="glass-effect">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem className="hover:bg-cosmic-blue/10">
                                    <Link href={`/dashboard/invoices/${invoice.id}`} className="flex items-center">
                                      <Eye className="mr-2 h-4 w-4" />
                                      View
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="hover:bg-cosmic-green/10">
                                    <Link href={`/dashboard/invoices/${invoice.id}/edit`} className="flex items-center">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive hover:bg-cosmic-red/10"
                                    onClick={() => handleDeleteInvoice(invoice.id)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </motion.tr>
                        )
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
