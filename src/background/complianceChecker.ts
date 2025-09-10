import type { PlasmoMessaging } from "@plasmohq/messaging"

interface Product {
  title: string
  price: string
  image: string
  link: string
}

interface ComplianceResult {
  link: string
  isCompliant: boolean
  reasons: string[]
}

const checkCompliance = (product: Product): ComplianceResult => {
  const reasons: string[] = []

  if (!product.title || product.title.trim().length === 0) {
    reasons.push("Missing product title.")
  }

  if (!product.price || product.price.trim().length === 0) {
    reasons.push("Missing MRP.")
  }
  
  if (!product.image || product.image.trim().length === 0) {
    reasons.push("Missing product image.")
  }
  
  return {
    link: product.link,
    isCompliant: reasons.length === 0,
    reasons: reasons
  }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { products } = req.body
  console.log("Received products for compliance check:", products)

  if (!products || !Array.isArray(products)) {
    return res.send({ error: "Invalid product data received." })
  }

  const results: ComplianceResult[] = products.map(checkCompliance)

  console.log("Sending back compliance results:", results);
  
  res.send({
    results
  })
}

export default handler
