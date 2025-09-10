import type { PlasmoMessaging } from "@plasmohq/messaging"
import { API_URL } from "~config"

// Mock response for fallback
const MOCK_RESPONSE = {
  complianceScore: 85,
  issues: [
    "Price display format needs improvement"
  ],
  recommendations: [
    "Ensure price is clearly visible",
    "Add country of origin information"
  ]
}

const API_CONFIG = {
  endpoint: API_URL,
  timeout: 5000, 
  retries: 2
}

const callComplianceAPI = async (product: any): Promise<any> => {
  console.log("🌐 [BACKGROUND] Attempting API call...")
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)
    
    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log("✅ [BACKGROUND] API call successful:", data)
    
    return data
  } catch (error) {
    console.warn("⚠️ [BACKGROUND] API call failed:", error.message)
    throw error
  }
}

const callAPIWithRetries = async (product: any, retries: number = API_CONFIG.retries): Promise<any> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 [BACKGROUND] API attempt ${attempt}/${retries}`)
      return await callComplianceAPI(product)
    } catch (error) {
      console.warn(`❌ [BACKGROUND] API attempt ${attempt} failed:`, error.message)
      
      if (attempt === retries) {
        console.log("🚨 [BACKGROUND] All API attempts failed, falling back to mock data")
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    }
  }
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("🔥 [BACKGROUND] Handler called!")
  console.log("🔥 [BACKGROUND] Request received:", JSON.stringify(req, null, 2))
  
  try {
    const { product } = req.body || {}
    console.log("🔥 [BACKGROUND] Extracted product:", product)

    if (!product) {
      console.error("❌ [BACKGROUND] No product data received")
      const errorResponse = { error: "Invalid product data received." }
      console.log("🔥 [BACKGROUND] Sending error response:", errorResponse)
      res.send(errorResponse)
      return
    }

    let complianceResult = null

    try {
      console.log("🚀 [BACKGROUND] Starting API-first approach...")
      complianceResult = await callAPIWithRetries(product)
      console.log("🎉 [BACKGROUND] API call succeeded, using real data")
    } catch (apiError) {
      console.log("🔄 [BACKGROUND] API failed, using mock data as fallback")
      complianceResult = {
        ...MOCK_RESPONSE,
        productAnalysis: {
          title: product.title,
          price: product.price,
          analyzedAt: new Date().toISOString(),
          source: "mock_fallback"
        }
      }
    }

    console.log("✅ [BACKGROUND] Final compliance result:", complianceResult)

    console.log("🚀 [BACKGROUND] Sending response...")
    res.send(complianceResult)
    console.log("✅ [BACKGROUND] Response sent successfully!")
    
  } catch (error) {
    console.error("💥 [BACKGROUND] Error in handler:", error)
    res.send({ 
      error: "Background script error: " + error.message,
      fallbackData: MOCK_RESPONSE
    })
  }
}

console.log("🔄 [BACKGROUND] Background script loaded, handler registered")

export default handler
