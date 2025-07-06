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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Plus, Trash2, FileText, Calculator, Users, Package, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  category: string
}

type InvoiceItem = {
  id: string
  product_id: number
  name: string
  sku: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [taxRate, setTaxRate] = useState(10)
  const [notes, setNotes] = useState("")
  const [dueDate, setDueDate] = useState("")

  // Initialize due date to 30 days from now
  useEffect(() => {
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    setDueDate(thirtyDaysFromNow.toISOString().split("T")[0])
  }, [])

  // Fetch customers and products
  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([fetch("/api/customers"), fetch("/api/products")])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      } else {
        throw new Error("Failed to fetch customers")
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData)
      } else {
        throw new Error("Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load customers and products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    if (!selectedProduct || quantity < 1) {
      toast({
        title: "Invalid selection",
        description: "Please select a product and enter a valid quantity",
        variant: "destructive",
      })
      return
    }

    const product = products.find((p) => p.id === Number.parseInt(selectedProduct))
    if (!product) {
      toast({
        title: "Product not found",
        description: "Selected product could not be found",
        variant: "destructive",
      })
      return
    }

    // Check if product already exists in items
    const existingItem = invoiceItems.find((item) => item.product_id === product.id)
    if (existingItem) {
      toast({
        title: "Product already added",
        description: "This product is already in the invoice. Edit the quantity instead.",
        variant: "destructive",
      })
      return
    }

    // Check stock availability
    if (quantity > product.stock) {
      toast({
        title: "Insufficient stock",
        description: `Only ${product.stock} units available for ${product.name}`,
        variant: "destructive",
      })
      return
    }

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      quantity: quantity,
      unit_price: product.price,
      total_price: product.price * quantity,
    }

    setInvoiceItems([...invoiceItems, newItem])
    setSelectedProduct("")
    setQuantity(1)

    toast({
      title: "Item added",
      description: `${product.name} added to invoice`,
    })
  }

  const removeItem = (id: string) => {
    const item = invoiceItems.find((item) => item.id === id)
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id))

    if (item) {
      toast({
        title: "Item removed",
        description: `${item.name} removed from invoice`,
      })
    }
  }

  const updateItemQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const item = invoiceItems.find((item) => item.id === id)
    if (!item) return

    const product = products.find((p) => p.id === item.product_id)
    if (!product) return

    if (newQuantity > product.stock) {
      toast({
        title: "Insufficient stock",
        description: `Only ${product.stock} units available for ${product.name}`,
        variant: "destructive",
      })
      return
    }

    setInvoiceItems(
      invoiceItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity, total_price: item.unit_price * newQuantity } : item,
      ),
    )
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

  const validateForm = () => {
    if (!selectedCustomer) {
      toast({
        title: "Customer required",
        description: "Please select a customer for this invoice.",
        variant: "destructive",
      })
      return false
    }

    if (invoiceItems.length === 0) {
      toast({
        title: "No items added",
        description: "Please add at least one item to the invoice.",
        variant: "destructive",
      })
      return false
    }

    if (!dueDate) {
      toast({
        title: "Due date required",
        description: "Please set a due date for this invoice.",
        variant: "destructive",
      })
      return false
    }

    const dueDateObj = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dueDateObj < today) {
      toast({
        title: "Invalid due date",
        description: "Due date cannot be in the past.",
        variant: "destructive",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const invoiceData = {
        customer_id: Number.parseInt(selectedCustomer),
        issue_date: new Date().toISOString().split("T")[0],
        due_date: dueDate,
        subtotal: calculateSubtotal(),
        tax_rate: taxRate,
        tax_amount: calculateTax(),
        total_amount: calculateTotal(),
        status: "pending",
        notes: notes.trim() || null,
      }

      const items = invoiceItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      console.log("Submitting invoice:", { invoice: invoiceData, items })

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invoice: invoiceData, items }),
      })

      const responseData = await response.json()
      console.log("Response:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to create invoice")
      }

      toast({
        title: "Invoice created successfully!",
        description: `Invoice ${responseData.invoice_number || "created"} has been generated.`,
      })

      // Redirect to invoices page
      router.push("/dashboard/invoices")
    } catch (error) {
      console.error("Invoice creation error:", error)
      toast({
        title: "Failed to create invoice",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCustomerData = customers.find((c) => c.id === Number.parseInt(selectedCustomer))
  const selectedProductData = products.find((p) => p.id === Number.parseInt(selectedProduct))

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show message if no customers or products
  if (customers.length === 0 || products.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/invoices">
            <Button variant="ghost" size="icon" className="hover:bg-cosmic-purple/10">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-cosmic bg-clip-text text-transparent">
              Create Invoice
            </h1>
            <p className="text-muted-foreground mt-1">Generate a new invoice for your customer</p>
          </div>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {customers.length === 0 && products.length === 0
              ? "You need to add customers and products before creating an invoice."
              : customers.length === 0
                ? "You need to add customers before creating an invoice."
                : "You need to add products before creating an invoice."}
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          {customers.length === 0 && (
            <Link href="/dashboard/customers/create">
              <Button>
                <Users className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </Link>
          )}
          {products.length === 0 && (
            <Link href="/dashboard/products/create">
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          )}
        </div>
      </div>
    )
  }

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
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customer">Customer *</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger id="customer" className="glass-effect">
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent className="glass-effect">
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{customer.name}</span>
                              <span className="text-xs text-muted-foreground">{customer.email}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="glass-effect"
                      required
                    />
                  </div>
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
                              <div className="flex flex-col">
                                <span className="font-medium">{product.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {product.sku} • Stock: {product.stock}
                                </span>
                              </div>
                              <Badge variant="outline" className="ml-2">
                                ${product.price.toFixed(2)}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedProductData && (
                      <p className="text-xs text-muted-foreground">Available: {selectedProductData.stock} units</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={selectedProductData?.stock || 999}
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
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-muted-foreground">{item.sku}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, Number.parseInt(e.target.value) || 1)}
                                className="w-20 h-8 text-right"
                              />
                            </TableCell>
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

            {/* Notes */}
            <Card className="glass-effect hover-lift">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>Add any additional information for this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter any notes or special instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-24 glass-effect resize-none"
                />
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
                  disabled={isSubmitting}
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
                      Creating Invoice...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Create Invoice ({invoiceItems.length} items - ${calculateTotal().toFixed(2)})
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
