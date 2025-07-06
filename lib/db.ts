import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL)

// Export both sql and query for compatibility
export { sql }
export const query = sql

// Helper functions for safe data conversion
export function safeNumber(value: any): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

export function safeInteger(value: any): number {
  if (typeof value === "number") return Math.floor(value)
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// Database helper functions
export async function getUser(email: string) {
  try {
    const result = await sql`
      SELECT id, name, email, password_hash 
      FROM users 
      WHERE email = ${email}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error getting user:", error)
    throw error
  }
}

export async function createUser(name: string, email: string, passwordHash: string) {
  try {
    const result = await sql`
      INSERT INTO users (name, email, password_hash)
      VALUES (${name}, ${email}, ${passwordHash})
      RETURNING id, name, email
    `
    return result[0]
  } catch (error) {
    console.error("Error creating user:", error)
    throw error
  }
}

export async function getProducts(userId: number) {
  try {
    const result = await sql`
      SELECT * FROM products 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return result.map((product) => ({
      ...product,
      price: safeNumber(product.price),
      stock: safeInteger(product.stock),
    }))
  } catch (error) {
    console.error("Error getting products:", error)
    throw error
  }
}

export async function createProduct(userId: number, product: any) {
  try {
    const result = await sql`
      INSERT INTO products (user_id, name, sku, description, price, stock, category)
      VALUES (${userId}, ${product.name}, ${product.sku}, ${product.description || ""}, ${safeNumber(product.price)}, ${safeInteger(product.stock)}, ${product.category})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(productId: number, userId: number, product: any) {
  try {
    const result = await sql`
      UPDATE products 
      SET name = ${product.name}, sku = ${product.sku}, description = ${product.description || ""}, 
          price = ${safeNumber(product.price)}, stock = ${safeInteger(product.stock)}, category = ${product.category},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${productId} AND user_id = ${userId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(productId: number, userId: number) {
  try {
    await sql`
      DELETE FROM products 
      WHERE id = ${productId} AND user_id = ${userId}
    `
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}

export async function getCustomers(userId: number) {
  try {
    const result = await sql`
      SELECT c.*, COUNT(i.id) as invoice_count
      FROM customers c
      LEFT JOIN invoices i ON c.id = i.customer_id
      WHERE c.user_id = ${userId}
      GROUP BY c.id, c.name, c.email, c.phone, c.address, c.user_id, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
    `
    return result.map((customer) => ({
      ...customer,
      invoice_count: safeInteger(customer.invoice_count),
    }))
  } catch (error) {
    console.error("Error getting customers:", error)
    throw error
  }
}

export async function createCustomer(userId: number, customer: any) {
  try {
    const result = await sql`
      INSERT INTO customers (user_id, name, email, phone, address)
      VALUES (${userId}, ${customer.name}, ${customer.email}, ${customer.phone}, ${customer.address || ""})
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

export async function updateCustomer(customerId: number, userId: number, customer: any) {
  try {
    const result = await sql`
      UPDATE customers 
      SET name = ${customer.name}, email = ${customer.email}, phone = ${customer.phone}, 
          address = ${customer.address || ""}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${customerId} AND user_id = ${userId}
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error updating customer:", error)
    throw error
  }
}

export async function deleteCustomer(customerId: number, userId: number) {
  try {
    await sql`
      DELETE FROM customers 
      WHERE id = ${customerId} AND user_id = ${userId}
    `
  } catch (error) {
    console.error("Error deleting customer:", error)
    throw error
  }
}

export async function getInvoices(userId: number) {
  try {
    const result = await sql`
      SELECT i.*, c.name as customer_name, c.email as customer_email
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.user_id = ${userId}
      ORDER BY i.created_at DESC
    `
    return result.map((invoice) => ({
      ...invoice,
      subtotal: safeNumber(invoice.subtotal),
      tax_rate: safeNumber(invoice.tax_rate),
      tax_amount: safeNumber(invoice.tax_amount),
      total_amount: safeNumber(invoice.total_amount),
    }))
  } catch (error) {
    console.error("Error getting invoices:", error)
    throw error
  }
}

export async function createInvoice(userId: number, invoice: any) {
  try {
    // Generate invoice number
    const invoiceCount = await sql`
      SELECT COUNT(*) as count FROM invoices WHERE user_id = ${userId}
    `
    const count = safeInteger(invoiceCount[0]?.count || 0)
    const invoiceNumber = `INV-${String(count + 1).padStart(4, "0")}`

    console.log("Generated invoice number:", invoiceNumber)

    const result = await sql`
      INSERT INTO invoices (
        user_id, customer_id, invoice_number, issue_date, due_date, 
        subtotal, tax_rate, tax_amount, total_amount, status, notes
      )
      VALUES (
        ${userId}, 
        ${invoice.customer_id}, 
        ${invoiceNumber}, 
        ${invoice.issue_date}, 
        ${invoice.due_date}, 
        ${safeNumber(invoice.subtotal)}, 
        ${safeNumber(invoice.tax_rate)}, 
        ${safeNumber(invoice.tax_amount)}, 
        ${safeNumber(invoice.total_amount)}, 
        ${invoice.status}, 
        ${invoice.notes || ""}
      )
      RETURNING *
    `

    console.log("Invoice created in database:", result[0])
    return result[0]
  } catch (error) {
    console.error("Error creating invoice:", error)
    throw error
  }
}

export async function createInvoiceItems(invoiceId: number, items: any[]) {
  try {
    console.log("Creating invoice items:", { invoiceId, items })

    for (const item of items) {
      const result = await sql`
        INSERT INTO invoice_items (invoice_id, product_id, quantity, unit_price, total_price)
        VALUES (
          ${invoiceId}, 
          ${safeInteger(item.product_id)}, 
          ${safeInteger(item.quantity)}, 
          ${safeNumber(item.unit_price)}, 
          ${safeNumber(item.total_price)}
        )
        RETURNING *
      `
      console.log("Created invoice item:", result[0])
    }
  } catch (error) {
    console.error("Error creating invoice items:", error)
    throw error
  }
}

export async function getInvoiceWithItems(invoiceId: number, userId: number) {
  try {
    const invoice = await sql`
      SELECT i.*, c.name as customer_name, c.email as customer_email, 
             c.phone as customer_phone, c.address as customer_address
      FROM invoices i
      JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ${invoiceId} AND i.user_id = ${userId}
    `

    if (invoice.length === 0) {
      return null
    }

    const items = await sql`
      SELECT ii.*, p.name as product_name, p.sku as product_sku
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = ${invoiceId}
    `

    return {
      ...invoice[0],
      items,
    }
  } catch (error) {
    console.error("Error getting invoice with items:", error)
    throw error
  }
}

export async function deleteInvoice(invoiceId: number, userId: number) {
  try {
    await sql`
      DELETE FROM invoices 
      WHERE id = ${invoiceId} AND user_id = ${userId}
    `
  } catch (error) {
    console.error("Error deleting invoice:", error)
    throw error
  }
}
