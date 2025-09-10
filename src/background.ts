import { API_URL } from "~config"

console.log("🟢 [BACKGROUND] Main background script loaded")

const MOCK_RESPONSE = {
  complianceScore: 85,
  issues: [
    {
      type: "warning", 
      message: "Price display format needs improvement",
      field: "price"
    }
  ],
  recommendations: [
    "Ensure price is clearly visible",
    "Add country of origin information"
  ]
}

const callComplianceAPI = async (product: any): Promise<any> => {
  console.log("🌐 [BACKGROUND] Attempting API call to:", API_URL)
  
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(API_URL, {
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

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("📨 [BACKGROUND] Chrome runtime message received:", request)
  console.log("📨 [BACKGROUND] Sender:", sender)
  
  if (request.name === 'complianceChecker') {
    console.log("🎯 [BACKGROUND] ComplianceChecker message received")
    
    try {
      const apiResult = await callComplianceAPI(request.body?.product)
      console.log("📤 [BACKGROUND] Sending API response:", apiResult)
      sendResponse(apiResult)
    } catch (error) {
      console.log("� [BACKGROUND] API failed, using mock response")
      sendResponse(MOCK_RESPONSE)
    }
    
    return true 
  }
  
  return false
})

console.log("✅ [BACKGROUND] Message listeners registered")
