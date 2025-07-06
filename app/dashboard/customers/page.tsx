"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, Users, Edit, Trash2, Mail, Phone } from "lucide-react"
import Link from "next/link"

type Customer = {
  id: number
  name: string
  email: string
  phone: string
  address?: string
  created_at: string
  invoice_count?: number
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        // Ensure numeric fields are properly converted
        const normalizedCustomers = data.map((customer: any) => ({
          ...customer,
          invoice_count:
            typeof customer.invoice_count === "string"
              ? Number.parseInt(customer.invoice_count, 10)
              : customer.invoice_count || 0,
        }))
        setCustomers(normalizedCustomers)
      } else {
        throw new Error("Failed to fetch customers")
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this customer?")) return

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setCustomers(customers.filter((customer) => customer.id !== id))
        toast({
          title: "Customer deleted",
          description: "The customer has been successfully deleted.",
        })
      } else {
        throw new Error("Failed to delete customer")
      }
    } catch (error) {
      console.error("Error deleting customer:", error)
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      })
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.toLowerCase().includes(searchTerm.toLowerCase()),
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
            Customers
          </h1>
          <p className="text-muted-foreground mt-1">Manage your customer relationships</p>
        </div>
        <Link href="/dashboard/customers/create">
          <Button className="cosmic-glow">
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
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
          placeholder="Search customers by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 glass-effect"
        />
      </motion.div>

      {/* Customers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cosmic-blue" />
              Customers ({filteredCustomers.length})
            </CardTitle>
            <CardDescription>
              {customers.length === 0
                ? "No customers found. Add your first customer to get started."
                : `Showing ${filteredCustomers.length} of ${customers.length} customers`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No customers yet</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first customer.</p>
                <Link href="/dashboard/customers/create">
                  <Button className="cosmic-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Customer
                  </Button>
                </Link>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No customers found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-center">Invoices</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer, index) => (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{customer.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Customer since {new Date(customer.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-cosmic-blue">{customer.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{customer.phone}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {customer.address || "No address provided"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{customer.invoice_count || 0} invoices</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-cosmic-blue/10">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(customer.id)}
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
