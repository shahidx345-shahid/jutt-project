"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, Loader2, Package, DollarSign, Hash } from "lucide-react"
import Link from "next/link"

export default function CreateProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    description: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate form data
      if (!formData.name || !formData.sku || !formData.category || !formData.price || !formData.stock) {
        throw new Error("Please fill in all required fields")
      }

      const price = Number.parseFloat(formData.price)
      const stock = Number.parseInt(formData.stock)

      if (isNaN(price) || price < 0) {
        throw new Error("Please enter a valid price")
      }

      if (isNaN(stock) || stock < 0) {
        throw new Error("Please enter a valid stock quantity")
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          sku: formData.sku.trim().toUpperCase(),
          category: formData.category,
          price: price,
          stock: stock,
          description: formData.description.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create product")
      }

      toast({
        title: "Product created successfully!",
        description: `${formData.name} has been added to your products.`,
      })

      router.push("/dashboard/products")
    } catch (error) {
      console.error("Product creation error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <Button variant="ghost" size="icon" className="hover:bg-cosmic-purple/10">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-cosmic bg-clip-text text-transparent">
            Add New Product
          </h1>
          <p className="text-muted-foreground mt-1">Create a new product in your inventory</p>
        </motion.div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Product Information */}
            <Card className="glass-effect hover-lift lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-cosmic-blue" />
                  Product Information
                </CardTitle>
                <CardDescription>Enter the basic details about your product</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Product Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. Mars Rover Model"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="glass-effect"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-sm font-medium flex items-center gap-1">
                    <Hash className="h-3 w-3" />
                    SKU *
                  </Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="e.g. MARS-001"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                    className="glass-effect font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Category *
                  </Label>
                  <Select value={formData.category} onValueChange={handleSelectChange} required>
                    <SelectTrigger id="category" className="glass-effect">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="glass-effect">
                      <SelectItem value="Planet Models">Planet Models</SelectItem>
                      <SelectItem value="Dwarf Planets">Dwarf Planets</SelectItem>
                      <SelectItem value="Moons">Moons</SelectItem>
                      <SelectItem value="Spacecraft">Spacecraft</SelectItem>
                      <SelectItem value="Collections">Collections</SelectItem>
                      <SelectItem value="Accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Price ($) *
                  </Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="glass-effect"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock" className="text-sm font-medium">
                    Stock Quantity *
                  </Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    className="glass-effect"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter product description..."
                    value={formData.description}
                    onChange={handleChange}
                    className="min-h-32 glass-effect resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="glass-effect lg:col-span-2">
              <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/dashboard/products")}
                  className="w-full sm:w-auto"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto cosmic-glow">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Package className="mr-2 h-4 w-4" />
                      Create Product
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
