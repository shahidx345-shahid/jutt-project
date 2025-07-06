"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Search, Package, Edit, Trash2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

type Product = {
  id: number
  name: string
  sku: string
  price: number
  stock: number
  category: string
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      if (response.ok) {
        const data = await response.json()
        // Ensure numeric fields are properly converted
        const normalizedProducts = data.map((product: any) => ({
          ...product,
          price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
          stock: typeof product.stock === "string" ? Number.parseInt(product.stock, 10) : product.stock,
        }))
        setProducts(normalizedProducts)
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

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setProducts(products.filter((product) => product.id !== id))
        toast({
          title: "Product deleted",
          description: "The product has been successfully deleted.",
        })
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
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
            Products
          </h1>
          <p className="text-muted-foreground mt-1">Manage your product inventory</p>
        </div>
        <Link href="/dashboard/products/create">
          <Button className="cosmic-glow">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
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
          placeholder="Search products by name, SKU, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 glass-effect"
        />
      </motion.div>

      {/* Products Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glass-effect hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-cosmic-blue" />
              Products ({filteredProducts.length})
            </CardTitle>
            <CardDescription>
              {products.length === 0
                ? "No products found. Add your first product to get started."
                : `Showing ${filteredProducts.length} of ${products.length} products`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                <p className="text-muted-foreground mb-4">Get started by adding your first product.</p>
                <Link href="/dashboard/products/create">
                  <Button className="cosmic-glow">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </Link>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms.</p>
              </div>
            ) : (
              <div className="border border-border/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{product.name}</span>
                            <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {product.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-cosmic-green">${(product.price || 0).toFixed(2)}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                          >
                            {product.stock || 0} units
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-cosmic-blue/10">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
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

      {/* Low Stock Alert */}
      {products.some((product) => product.stock <= 5) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Alert className="border-cosmic-orange/50 bg-cosmic-orange/5">
            <AlertCircle className="h-4 w-4 text-cosmic-orange" />
            <AlertDescription className="text-cosmic-orange">
              {products.filter((product) => product.stock <= 5).length} product(s) have low stock levels.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  )
}
