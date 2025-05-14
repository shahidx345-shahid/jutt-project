"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

// Sample customer data
const customers = [
  { id: "1", name: "Stellar Labs", email: "contact@stellarlabs.com", phone: "123-456-7890" },
  { id: "2", name: "Cosmic Enterprises", email: "info@cosmicent.com", phone: "234-567-8901" },
  { id: "3", name: "Orbital Systems", email: "hello@orbitalsys.com", phone: "345-678-9012" },
  { id: "4", name: "Galaxy Research", email: "research@galaxy.org", phone: "456-789-0123" },
  { id: "5", name: "Nebula Innovations", email: "support@nebulainnovate.com", phone: "567-890-1234" },
]

// Sample product data
const products = [
  { id: "1", name: "Mercury Model", price: 29.99 },
  { id: "2", name: "Venus Globe", price: 34.99 },
  { id: "3", name: "Earth and Moon Set", price: 49.99 },
  { id: "4", name: "Mars Rover", price: 39.99 },
  { id: "5", name: "Jupiter Giant", price: 59.99 },
  { id: "6", name: "Saturn with Rings", price: 64.99 },
  { id: "7", name: "Uranus Model", price: 44.99 },
  { id: "8", name: "Neptune Blue", price: 44.99 },
  { id: "9", name: "Pluto Dwarf", price: 24.99 },
  { id: "10", name: "Solar System Complete Set", price: 299.99 },
]

type InvoiceItem = {
  id: string
  productId: string
  name: string
  quantity: number
  price: number
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState(1)

  const addItem = () => {
    if (!selectedProduct || quantity < 1) return

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      quantity: quantity,
      price: product.price,
    }

    setInvoiceItems([...invoiceItems, newItem])
    setSelectedProduct("")
    setQuantity(1)
  }

  const removeItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter((item) => item.id !== id))
  }

  const calculateSubtotal = () => {
    return invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.1 // 10% tax
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = (e: React.FormEvent) => {
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

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Invoice created",
        description: `Invoice has been created successfully.`,
      })
      setIsSubmitting(false)
      router.push("/dashboard/invoices")
    }, 1500)
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/invoices">
          <Button variant="ghost" size="icon" className="mr-4">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
          <p className="text-muted-foreground mt-1">Generate a new invoice for your customer</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <Card className="border-primary/20 bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Select the customer for this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer</Label>
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger id="customer" className="bg-background/50">
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCustomer && (
                  <div className="mt-4 p-4 rounded-md bg-primary/5 border border-primary/10">
                    {(() => {
                      const customer = customers.find((c) => c.id === selectedCustomer)
                      if (!customer) return null

                      return (
                        <div className="space-y-1">
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                          <p className="text-sm text-muted-foreground">{customer.phone}</p>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
                <CardDescription>Add products to this invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-[1fr_120px_auto]">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product</Label>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger id="product" className="bg-background/50">
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - ${product.price.toFixed(2)}
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
                      className="bg-background/50"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addItem} className="mb-0.5">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Item
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoiceItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            No items added to this invoice yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoiceItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                            <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.id)}
                                className="h-8 w-8"
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

                {invoiceItems.length > 0 && (
                  <div className="mt-6 space-y-2 border-t pt-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (10%)</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-background/80 backdrop-blur-sm">
              <CardFooter className="flex justify-between pt-6">
                <Button variant="outline" type="button" onClick={() => router.push("/dashboard/invoices")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || invoiceItems.length === 0 || !selectedCustomer}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Invoice"
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
