"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, FileText, Eye, Edit, Trash2, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

type Invoice = {
  id: number
  invoice_number: string
  customer_name: string
  customer_email: string
  issue_date: string
  due_date: string
  total_amount: number
  status: "pending" | "paid" | "overdue" | "cancelled"
  created_at: string
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices")
      if (response.ok) {
        const data = await response.json()
        // Ensure numeric fields are properly converted
        const normalizedInvoices = data.map((invoice: any) => ({
          ...invoice,
          total_amount:
            typeof invoice.total_amount === "string" ? Number.parseFloat(invoice.total_amount) : invoice.total_amount,
        }))
        setInvoices(normalizedInvoices)
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return

    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setInvoices(invoices.filter((invoice) => invoice.id !== id))
        toast({
          title: "Invoice deleted",
          description: "The invoice has been successfully deleted.",
        })
      } else {
        throw new Error("Failed to delete invoice")
      }
    } catch (error) {
      console.error("Error deleting invoice:", error)
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-cosmic-green/10 text-cosmic-green border-cosmic-green/20"
      case "pending":
        return "bg-cosmic-blue/10 text-cosmic-blue border-cosmic-blue/20"
      case "overdue":
        return "bg-cosmic-red/10 text-cosmic-red border-cosmic-red/20"
      case "cancelled":
        return "bg-muted/10 text-muted-foreground border-muted/20"
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20"
    }
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
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
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-cosmic bg-clip-text text-transparent">
            Invoices
          </h1>
          <p className="text-muted-foreground mt-1">Manage your billing and payments</p>
        </div>
        <Link href="/dashboard/invoices/create">
          <Button className="cosmic-glow">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative"
      >
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search invoices by number, customer name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 glass-effect"
        />
      </motion.div>

      {/* Invoices Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cosmic-blue" />
              Invoices ({filteredInvoices.length})
            </CardTitle>
            <CardDescription>
              {invoices.length === 0
                ? "No invoices found. Create your first invoice to get started."
                : `Showing ${filteredInvoices.length} of ${invoices.length} invoices`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
                <p className="text-muted-foreground mb-4">Get started by creating your first invoice.</p>
                <Link href="/dashboard/invoices/create">
                  <Button className="cosmic-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Button>
                </Link>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice, index) => (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-cosmic-blue">{invoice.invoice_number}</span>
                            <span className="text-xs text-muted-foreground">
                              Created {new Date(invoice.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{invoice.customer_name}</span>
                            <span className="text-xs text-muted-foreground">{invoice.customer_email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>Issued: {new Date(invoice.issue_date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>Due: {new Date(invoice.due_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className="h-4 w-4 text-cosmic-green" />
                            <span className="font-semibold text-cosmic-green">
                              {(invoice.total_amount || 0).toFixed(2)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={getStatusColor(invoice.status)} variant="outline">
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-cosmic-blue/10">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-cosmic-blue/10">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(invoice.id)}
                              className="h-8 w-8 hover:bg-cosmic-red/10 hover:text-cosmic-red"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
