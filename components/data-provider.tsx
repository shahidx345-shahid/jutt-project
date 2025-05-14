"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "./auth-provider"

// Define types
type Product = {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  category: string
  description?: string
}

type Customer = {
  id: string
  name: string
  email: string
  phone: string
  invoices: number
}

type InvoiceItem = {
  id: string
  productId: string
  name: string
  quantity: number
  price: number
}

type Invoice = {
  id: string
  customer: string
  customerId: string
  date: string
  amount: number
  status: "paid" | "pending" | "overdue"
  items: InvoiceItem[]
}

type DataContextType = {
  products: Product[]
  customers: Customer[]
  invoices: Invoice[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  addCustomer: (customer: Omit<Customer, "id" | "invoices">) => void
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  addInvoice: (invoice: Omit<Invoice, "id" | "date">) => void
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  getCustomerById: (id: string) => Customer | undefined
  getProductById: (id: string) => Product | undefined
}

// Sample initial data
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Mercury Model",
    sku: "MERC-001",
    price: 29.99,
    stock: 15,
    category: "Planet Models",
  },
  {
    id: "2",
    name: "Venus Globe",
    sku: "VEN-002",
    price: 34.99,
    stock: 12,
    category: "Planet Models",
  },
  {
    id: "3",
    name: "Earth and Moon Set",
    sku: "EARTH-003",
    price: 49.99,
    stock: 20,
    category: "Planet Models",
  },
  {
    id: "4",
    name: "Mars Rover",
    sku: "MARS-004",
    price: 39.99,
    stock: 8,
    category: "Planet Models",
  },
  {
    id: "5",
    name: "Jupiter Giant",
    sku: "JUP-005",
    price: 59.99,
    stock: 5,
    category: "Planet Models",
  },
]

const initialCustomers: Customer[] = [
  {
    id: "1",
    name: "Stellar Labs",
    email: "contact@stellarlabs.com",
    phone: "123-456-7890",
    invoices: 3,
  },
  {
    id: "2",
    name: "Cosmic Enterprises",
    email: "info@cosmicent.com",
    phone: "234-567-8901",
    invoices: 2,
  },
  {
    id: "3",
    name: "Orbital Systems",
    email: "hello@orbitalsys.com",
    phone: "345-678-9012",
    invoices: 1,
  },
]

const initialInvoices: Invoice[] = [
  {
    id: "INV-001",
    customer: "Stellar Labs",
    customerId: "1",
    date: "2023-05-12",
    amount: 1299.99,
    status: "paid",
    items: [
      {
        id: "item1",
        productId: "1",
        name: "Mercury Model",
        quantity: 2,
        price: 29.99,
      },
      {
        id: "item2",
        productId: "5",
        name: "Jupiter Giant",
        quantity: 1,
        price: 59.99,
      },
    ],
  },
  {
    id: "INV-002",
    customer: "Cosmic Enterprises",
    customerId: "2",
    date: "2023-05-15",
    amount: 849.5,
    status: "pending",
    items: [
      {
        id: "item3",
        productId: "3",
        name: "Earth and Moon Set",
        quantity: 3,
        price: 49.99,
      },
    ],
  },
]

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)

  // Load data from localStorage on initial render
  useEffect(() => {
    if (user) {
      const userId = user.id
      const storedProducts = localStorage.getItem(`products_${userId}`)
      const storedCustomers = localStorage.getItem(`customers_${userId}`)
      const storedInvoices = localStorage.getItem(`invoices_${userId}`)

      if (storedProducts) setProducts(JSON.parse(storedProducts))
      if (storedCustomers) setCustomers(JSON.parse(storedCustomers))
      if (storedInvoices) setInvoices(JSON.parse(storedInvoices))
    }
  }, [user])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const userId = user.id
      localStorage.setItem(`products_${userId}`, JSON.stringify(products))
      localStorage.setItem(`customers_${userId}`, JSON.stringify(customers))
      localStorage.setItem(`invoices_${userId}`, JSON.stringify(invoices))
    }
  }, [products, customers, invoices, user])

  // Product functions
  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: `product_${Date.now()}`,
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const updateProduct = (id: string, product: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)))
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  // Customer functions
  const addCustomer = (customer: Omit<Customer, "id" | "invoices">) => {
    const newCustomer = {
      ...customer,
      id: `customer_${Date.now()}`,
      invoices: 0,
    }
    setCustomers((prev) => [...prev, newCustomer])
  }

  const updateCustomer = (id: string, customer: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...customer } : c)))
  }

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id))
  }

  // Invoice functions
  const addInvoice = (invoice: Omit<Invoice, "id" | "date">) => {
    const newInvoice = {
      ...invoice,
      id: `INV-${String(invoices.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
    }
    setInvoices((prev) => [...prev, newInvoice])

    // Update customer invoice count
    setCustomers((prev) => prev.map((c) => (c.id === invoice.customerId ? { ...c, invoices: c.invoices + 1 } : c)))
  }

  const updateInvoice = (id: string, invoice: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, ...invoice } : i)))
  }

  const deleteInvoice = (id: string) => {
    const invoiceToDelete = invoices.find((i) => i.id === id)
    if (invoiceToDelete) {
      // Update customer invoice count
      setCustomers((prev) =>
        prev.map((c) => (c.id === invoiceToDelete.customerId ? { ...c, invoices: Math.max(0, c.invoices - 1) } : c)),
      )
    }
    setInvoices((prev) => prev.filter((i) => i.id !== id))
  }

  // Helper functions
  const getCustomerById = (id: string) => {
    return customers.find((c) => c.id === id)
  }

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id)
  }

  return (
    <DataContext.Provider
      value={{
        products,
        customers,
        invoices,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        getCustomerById,
        getProductById,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
