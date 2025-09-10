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

try {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg?.name === 'complianceChecker' && Array.isArray(msg?.body?.products)) {
        try {
          const results = (msg.body.products as Product[]).map(checkCompliance)
          sendResponse({ results })
        } catch (err) {
          sendResponse({ error: 'Background processing failed' })
        }
        return true
      }

      if (msg?.action === 'persistResults' && msg?.tabId && Array.isArray(msg?.results)) {
        try {
          const key = msg.tabId
          const payload = { products: msg.products || [], results: msg.results, timestamp: Date.now() }
          chrome.storage.local.set({ [key]: payload }, () => {
            sendResponse({ ok: true })
          })
          return true
        } catch (e) {
          console.warn('[compliance][background] persistResults failed', e)
          sendResponse({ ok: false })
        }
      }
    })
  }
} catch (e) {
  console.warn('Could not attach runtime.onMessage listener in background:', e)
}
