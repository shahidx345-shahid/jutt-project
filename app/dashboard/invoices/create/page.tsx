"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Plus, Trash2, FileText, Calculator, Users, Package } from "lucide-react"
import Link from "next/link"

type Customer = {
  id: number
  name: string
  email: string
  phone: string
  address?: string
}

type Product = {
  id: number
  name: string
  sku: string
  price: number
  stock: number
}

type InvoiceItem = {
  id: string
  product_id: number
  name: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [taxRate, setTaxRate] = useState(10)

  // Fetch customers and products
  useEffect(() => {
    fetchCustomers()
    fetchProducts()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  const addItem = () => {
    if (!selectedProduct || quantity < 1) return

    const product = products.find((p) => p.id === Number.parseInt(selectedProduct))
    if (!product) return

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      product_id: product.id,
      name: product.name,
      quantity: quantity,
      unit_price: product.price,
      total_price: product.price * quantity,
    }

    setInvoiceItems([...invoiceItems, newItem])
    setSelectedProduct("")
    setQuantity(1)
  }

  const removeItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id))
  }

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.total_price, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCustomer) {
      toast({
        title: "Customer required",
        description: "Please select a customer for this invoice.",
        variant: "destructive",
      })
      return
    }

    if (invoiceItems.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const invoiceData = {
        customer_id: Number.parseInt(selectedCustomer),
        issue_date: new Date().toISOString().split("T")[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
        subtotal: calculateSubtotal(),
        tax_rate: taxRate,
        tax_amount: calculateTax(),
        total_amount: calculateTotal(),
        status: "pending",
      }

      const items = invoiceItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice: invoiceData, items }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create invoice")
      }

      toast({
        title: "Invoice created",
        description: "Invoice has been created successfully.",
      })

      router.push("/dashboard/invoices")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create invoice",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCustomerData = customers.find((c) => c.id === Number.parseInt(selectedCustomer))

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="icon" className="hover:bg-cosmic-purple/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-cosmic bg-clip-text text-transparent">
            Create Invoice
          </h1>
          <p className="text-muted-foreground mt-1">Generate a new invoice for your customer</p>
        </motion.div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6">
            {/* Customer Selection */}
            <Card className="glass-effect hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-cosmic-blue" />
                  Customer Information
                </CardTitle>
                <CardDescription>Select the customer for this invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger id="customer" className="glass-effect">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect">
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCustomerData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-4 rounded-lg bg-cosmic-blue/5 border border-cosmic-blue/20"
                  >
                    <div className="space-y-2">
                      <p className="font-medium text-cosmic-blue">{selectedCustomerData.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomerData.email}</p>
                      <p className="text-sm text-muted-foreground">{selectedCustomerData.phone}</p>
                      {selectedCustomerData.address && (
                        <p className="text-sm text-muted-foreground">{selectedCustomerData.address}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Invoice Items */}
            <Card className="glass-effect hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-cosmic-green" />
                  Invoice Items
                </CardTitle>
                <CardDescription>Add products to this invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add Item Form */}
                <div className="grid gap-4 md:grid-cols-[1fr_120px_auto] p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger id="product" className="glass-effect">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect">
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{product.name}</span>
                              <Badge variant="outline" className="ml-2">
                                ${product.price.toFixed(2)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                      className="glass-effect"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addItem} className="cosmic-glow" disabled={!selectedProduct}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <Package className="h-8 w-8 text-muted-foreground" />
                              <p className="text-muted-foreground">No items added to this invoice yet.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoiceItems.map((item) => (
                          <TableRow key={item.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right text-cosmic-green font-semibold">
                              ${item.unit_price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right text-cosmic-blue font-semibold">
                              ${item.total_price.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8 hover:bg-cosmic-red/10 hover:text-cosmic-red"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Invoice Summary */}
                {invoiceItems.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-4 rounded-lg bg-gradient-nebula/10 border border-cosmic-purple/20"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Calculator className="h-5 w-5 text-cosmic-purple" />
                      <h3 className="font-semibold text-cosmic-purple">Invoice Summary</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-semibold">${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span>Tax Rate</span>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={taxRate}
                            onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
                            className="w-20 h-8 text-xs glass-effect"
                          />
                          <span className="text-xs">%</span>
                        </div>
                        <span className="font-semibold">${calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold text-cosmic-purple border-t pt-2">
                        <span>Total</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="glass-effect">
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/dashboard/invoices")}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || invoiceItems.length === 0 || !selectedCustomer}
                  className="w-full sm:w-auto cosmic-glow"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Create Invoice
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
