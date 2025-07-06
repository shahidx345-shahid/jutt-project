"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-provider"
import { Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react"

// Helper functions for safe data conversion
const safeNumber = (value: any): number => {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

const safeInteger = (value: any): number => {
  if (typeof value === "number") return Math.floor(value)
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

interface Product {
  id: number
  name: string
  sku: string
  price: number
  stock: number
}

interface Customer {
  id: number
  name: string
  email: string
}

interface InvoiceItem {
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

export default function CreateInvoicePage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [formData, setFormData] = useState({
    customer_id: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "",
    tax_rate: 10,
    status: "pending",
    notes: "",
  })

  const [items, setItems] = useState<InvoiceItem[]>([])

  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && user) {
      fetchData()
    }
  }, [mounted, user])

  const fetchData = async () => {
    try {
      const [customersRes, productsRes] = await Promise.all([fetch("/api/customers"), fetch("/api/products")])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData)
      } else {
        console.error("Failed to fetch customers:", await customersRes.text())
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        const normalizedProducts = productsData.map((product: any) => ({
          ...product,
          price: safeNumber(product.price),
          stock: safeInteger(product.stock),
        }))
        setProducts(normalizedProducts)
      } else {
        console.error("Failed to fetch products:", await productsRes.text())
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({
        title: "Error",
        description: "Failed to load data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addItem = () => {
    setItems([
      ...items,
      {
        product_id: 0,
        product_name: "",
        quantity: 1,
        unit_price: 0,
        total_price: 0,
      },
    ])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    if (field === "product_id") {
      const product = products.find((p) => p.id === Number(value))
      if (product) {
        updatedItems[index].product_name = product.name
        updatedItems[index].unit_price = safeNumber(product.price)
        updatedItems[index].total_price = safeNumber(product.price) * updatedItems[index].quantity
      }
    }

    if (field === "quantity" || field === "unit_price") {
      const quantity = safeInteger(updatedItems[index].quantity)
      const unitPrice = safeNumber(updatedItems[index].unit_price)
      updatedItems[index].total_price = quantity * unitPrice
    }

    setItems(updatedItems)
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + safeNumber(item.total_price), 0)
    const taxAmount = (subtotal * safeNumber(formData.tax_rate)) / 100
    const total = subtotal + taxAmount

    return {
      subtotal: subtotal,
      taxAmount: taxAmount,
      total: total,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customer_id) {
      toast({
        title: "Error",
        description: "Please select a customer.",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one item.",
        variant: "destructive",
      })
      return
    }

    // Validate items
    for (const item of items) {
      if (!item.product_id || item.quantity <= 0 || item.unit_price < 0) {
        toast({
          title: "Error",
          description: "Please ensure all items have valid product, quantity, and price.",
          variant: "destructive",
        })
        return
      }
    }

    setSubmitting(true)

    try {
      const { subtotal, taxAmount, total } = calculateTotals()

      const invoiceData = {
        customer_id: Number(formData.customer_id),
        issue_date: formData.issue_date,
        due_date: formData.due_date || formData.issue_date,
        subtotal: subtotal,
        tax_rate: safeNumber(formData.tax_rate),
        tax_amount: taxAmount,
        total_amount: total,
        status: formData.status,
        notes: formData.notes,
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: safeInteger(item.quantity),
          unit_price: safeNumber(item.unit_price),
          total_price: safeNumber(item.total_price),
        })),
      }

      console.log("Submitting invoice data:", invoiceData)

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("Invoice creation failed:", responseData)
        throw new Error(responseData.error || responseData.details || "Failed to create invoice")
      }

      console.log("Invoice created successfully:", responseData)

      toast({
        title: "Success",
        description: "Invoice created successfully!",
      })

      router.push("/dashboard/invoices")
    } catch (error) {
      console.error("Error creating invoice:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => router.back()} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <h1 className="text-3xl font-bold">Create Invoice</h1>
      </div>

      {customers.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You need to add customers before creating invoices.{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/dashboard/customers/create")}>
              Add a customer first
            </Button>
          </p>
        </div>
      )}

      {products.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You need to add products before creating invoices.{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/dashboard/products/create")}>
              Add a product first
            </Button>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer">Customer *</Label>
                <Select
                  value={formData.customer_id}
                  onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
                  disabled={customers.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={customers.length === 0 ? "No customers available" : "Select a customer"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name} ({customer.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="issue_date">Issue Date *</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice Items</CardTitle>
              <Button type="button" onClick={addItem} size="sm" disabled={products.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {products.length === 0
                  ? "Add products first before creating invoice items."
                  : 'No items added yet. Click "Add Item" to get started.'}
              </p>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-2">
                      <Label>Product *</Label>
                      <Select
                        value={item.product_id.toString()}
                        onValueChange={(value) => updateItem(index, "product_id", Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} - ${safeNumber(product.price).toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>Unit Price *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>Total</Label>
                      <Input
                        type="text"
                        value={`$${safeNumber(item.total_price).toFixed(2)}`}
                        readOnly
                        className="bg-muted"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax ({safeNumber(formData.tax_rate)}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitting || customers.length === 0 || products.length === 0 || items.length === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Invoice"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
