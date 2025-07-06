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
import { Plus, Search, MoreHorizontal, Edit, Trash2, ArrowUpDown, Package, DollarSign, TrendingUp } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

type Product = {
  id: number
  name: string
  sku: string
  price: string | number
  stock: string | number
  category: string
  description?: string
}

export default function ProductsPage() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: "ascending" | "descending"
  } | null>(null)

  // Fetch products
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        // Ensure price and stock are numbers
        const normalizedData = data.map((product: any) => ({
          ...product,
          price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
          stock: typeof product.stock === "string" ? Number.parseInt(product.stock) : product.stock,
        }))
        setProducts(normalizedData)
      } else {
        throw new Error("Failed to fetch products")
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortConfig) return 0

    const key = sortConfig.key as keyof typeof a
    let aVal = a[key]
    let bVal = b[key]

    // Convert to numbers for price and stock
    if (key === "price" || key === "stock") {
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

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== id))
        toast({
          title: "Product deleted",
          description: "The product has been removed successfully.",
        })
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  // Calculate stats - ensure numbers
  const totalProducts = products.length
  const totalValue = products.reduce((sum, product) => {
    const price = typeof product.price === "string" ? Number.parseFloat(product.price) : product.price
    const stock = typeof product.stock === "string" ? Number.parseInt(product.stock) : product.stock
    return sum + price * stock
  }, 0)
  const lowStockProducts = products.filter((product) => {
    const stock = typeof product.stock === "string" ? Number.parseInt(product.stock) : product.stock
    return stock < 10
  }).length

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
            Products
          </h1>
          <p className="text-muted-foreground mt-1">Manage your solar system products</p>
        </div>
        <Link href="/dashboard/products/create">
          <Button className="cosmic-glow hover-lift">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card className="glass-effect hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-cosmic-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cosmic-blue">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-cosmic-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cosmic-green">${totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>

        <Card className="glass-effect hover-lift">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-cosmic-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cosmic-orange">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">Items below 10</p>
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
            placeholder="Search products..."
            className="pl-10 glass-effect"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Products Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Product Inventory</CardTitle>
            <CardDescription>Manage your product catalog and inventory</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="w-[100px]">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("sku")}
                        className="flex items-center gap-1 hover:bg-transparent text-cosmic-purple"
                      >
                        SKU
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("name")}
                        className="flex items-center gap-1 hover:bg-transparent text-cosmic-purple"
                      >
                        Name
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("category")}
                        className="flex items-center gap-1 hover:bg-transparent text-cosmic-purple"
                      >
                        Category
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("price")}
                        className="flex items-center gap-1 justify-end ml-auto hover:bg-transparent text-cosmic-purple"
                      >
                        Price
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => requestSort("stock")}
                        className="flex items-center gap-1 justify-end ml-auto hover:bg-transparent text-cosmic-purple"
                      >
                        Stock
                        <ArrowUpDown className="h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {sortedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">No products found.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedProducts.map((product, index) => {
                        const price =
                          typeof product.price === "string" ? Number.parseFloat(product.price) : product.price
                        const stock = typeof product.stock === "string" ? Number.parseInt(product.stock) : product.stock

                        return (
                          <motion.tr
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-border/50 hover:bg-muted/50 transition-colors"
                          >
                            <TableCell className="font-medium">
                              <Badge variant="outline" className="font-mono">
                                {product.sku}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{product.category}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-cosmic-green">
                              ${price.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant={stock < 10 ? "destructive" : "default"}
                                className={stock < 10 ? "text-cosmic-red" : "text-cosmic-blue"}
                              >
                                {stock}
                              </Badge>
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
                                    <Link href={`/dashboard/products/${product.id}`} className="flex items-center">
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive hover:bg-cosmic-red/10"
                                    onClick={() => handleDeleteProduct(product.id)}
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
