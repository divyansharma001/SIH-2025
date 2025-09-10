import { useState, useEffect } from "react"
import { ProductCard } from "~features/product-card"
import { ProductStats } from "~features/count-button"
import { Settings } from "~features/settings"
import "~style.css"

interface Product {
  title: string
  price: string
  image: string
  link: string
  complianceScore?: number
  issues?: any[]
  recommendations?: any[]
}

interface DetectionResult {
  data?: any
  error?: string
}

function IndexPopup() {
  const [isDetecting, setIsDetecting] = useState(true)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [currentSite, setCurrentSite] = useState<string>("Scanning...")
  const [products, setProducts] = useState<Product[]>([])
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDataForCurrentTab = async () => {
      setIsDetecting(true)
      setError(null)
      
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        
        if (!tab.url || !tab.url.includes("amazon.")) {
          setCurrentSite("Unsupported Site")
          setError("This extension only supports Amazon product pages.")
          setIsDetecting(false)
          setProducts([])
          return
        }

        setCurrentSite("Amazon")
        
        const hostname = new URL(tab.url).hostname
        const allData = await chrome.storage.local.get()
        
        let foundData = null
        for (const [key, value] of Object.entries(allData)) {
          if (key.startsWith(`compliance_${hostname}`)) {
            foundData = value
            break
          }
        }
        
        if (foundData && foundData.product && foundData.result) {
          const product: Product = {
            title: foundData.product.title || 'Unknown Product',
            price: foundData.product.price || 'Price not found',
            image: foundData.product.images?.[0] || '',
            link: foundData.product.productUrl || tab.url,
            complianceScore: foundData.result.complianceScore,
            issues: foundData.result.issues || [],
            recommendations: foundData.result.recommendations || []
          }
          
          setProducts([product])
          
          const isSafe = foundData.result.complianceScore > 80
          const flaggedCount = isSafe ? 0 : 1
          
          setDetectionResult({ 
            data: { 
              products: [{ isSafe }], 
              flaggedCount 
            } 
          })
          
          if (flaggedCount > 0) setShowAllProducts(true)
        } else {
          setError("No products detected. Try clicking 'Scan Products on Page' first.")
          setProducts([])
          setDetectionResult(null)
        }
      } catch (e) {
        console.error('Error fetching data:', e)
        setError("An error occurred while fetching data.")
      } finally {
        setIsDetecting(false)
      }
    }

    fetchDataForCurrentTab()

    const storageListener = (changes: any, area: string) => {
      if (area === "local") {
        fetchDataForCurrentTab()
      }
    }

    chrome.storage.onChanged.addListener(storageListener)
    return () => chrome.storage.onChanged.removeListener(storageListener)
  }, [])

  const handleDetectProducts = async () => {
    setIsDetecting(true)
    setError(null)
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      
      if (!tab || !tab.id) {
        setError("Could not find an active tab to scan.")
        setIsDetecting(false)
        return
      }

      await chrome.tabs.sendMessage(tab.id, { action: "rescan" })
      
    } catch (e) {
      console.error('Error triggering scan:', e)
      setError("Could not communicate with the page. Try refreshing the page first.")
      setIsDetecting(false)
    }
  }

  return (
    <div className="plasmo-w-[400px] plasmo-h-[650px] plasmo-bg-slate-50 plasmo-overflow-hidden plasmo-relative">
      <div className="plasmo-absolute plasmo-inset-0 plasmo-bg-[url('data:image/svg+xml,%3Csvg_width=%2260%22_height=%2260%22_viewBox=%220_0_60_60%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg_fill=%22none%22_fill-rule=%22evenodd%22%3E%3Cg_fill=%22%23dbeafe%22_fill-opacity=%220.4%22%3E%3Cpath_d=%22m36_34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6_34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6_4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" ></div>
      <div className="plasmo-relative plasmo-z-10 plasmo-flex plasmo-flex-col plasmo-h-full">
        <header className="plasmo-bg-blue-600 plasmo-text-white plasmo-p-5 plasmo-shadow-lg plasmo-relative">
          <div className="plasmo-flex plasmo-items-center plasmo-justify-between">
            <div className="plasmo-flex plasmo-items-center plasmo-gap-4">
              <div className="plasmo-w-12 plasmo-h-12 plasmo-bg-white/20 plasmo-rounded-xl plasmo-flex plasmo-items-center plasmo-justify-center plasmo-border plasmo-border-white/30">
                <span className="plasmo-text-2xl">🛡️</span>
              </div>
              <div>
                <h1 className="plasmo-text-lg plasmo-font-bold">E-Commerce Guard</h1>
                <p className="plasmo-text-sm plasmo-opacity-90">AI-Powered Compliance Scanner</p>
              </div>
            </div>
            <div className="plasmo-flex plasmo-items-center plasmo-gap-3">
              <span className="plasmo-text-3xl" title={currentSite}>🛒</span>
              <Settings />
            </div>
          </div>
        </header>

        <main className="plasmo-flex-1 plasmo-p-5 plasmo-overflow-y-auto plasmo-space-y-4">
          <div className="plasmo-bg-white plasmo-p-4 plasmo-rounded-xl plasmo-shadow-soft">
            <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-4">
              <div>
                <p className="plasmo-text-sm plasmo-text-gray-500">Current Site</p>
                <p className="plasmo-text-lg plasmo-font-bold plasmo-text-gray-800">{currentSite}</p>
              </div>
              <span
                className={`plasmo-px-3 plasmo-py-1 plasmo-rounded-full plasmo-text-sm plasmo-font-semibold ${
                  currentSite === "Unsupported Site"
                    ? "plasmo-bg-red-100 plasmo-text-red-700"
                    : "plasmo-bg-green-100 plasmo-text-green-700"
                }`}>
                {currentSite === "Unsupported Site" ? "Not Supported" : "✓ Supported"}
              </span>
            </div>
            <button
              onClick={handleDetectProducts}
              disabled={isDetecting || currentSite === "Unsupported Site"}
              className="plasmo-w-full plasmo-bg-blue-600 hover:plasmo-bg-blue-700 plasmo-text-white plasmo-font-bold plasmo-py-3 plasmo-px-4 plasmo-rounded-lg plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-3 plasmo-transition-all disabled:plasmo-bg-gray-400 disabled:plasmo-cursor-not-allowed">
              {isDetecting ? (
                <>
                  <svg className="plasmo-animate-spin plasmo-h-5 plasmo-w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="plasmo-opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="plasmo-opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  <span>Scanning...</span>
                </>
              ) : (
                "Scan Products on Page"
              )}
            </button>
          </div>
          
          {error && (
            <div className="plasmo-bg-red-100 plasmo-border-l-4 plasmo-border-red-500 plasmo-text-red-700 plasmo-p-4 plasmo-rounded-lg">
                <p className="plasmo-font-bold">Error</p>
                <p>{error}</p>
            </div>
          )}

          <div className="plasmo-bg-white plasmo-p-4 plasmo-rounded-xl plasmo-shadow-soft">
            <ProductStats />
          </div>

          {products.length > 0 && (
            <div className="plasmo-bg-white plasmo-p-4 plasmo-rounded-xl plasmo-shadow-soft">
              <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-3">
                <h3 className="plasmo-text-lg plasmo-font-bold">Detected Products</h3>
                <span className="plasmo-text-sm plasmo-font-medium plasmo-text-gray-600 plasmo-bg-gray-100 plasmo-px-3 plasmo-py-1 plasmo-rounded-full">
                  {products.length} found
                  {detectionResult?.data?.flaggedCount > 0 && ` • ${detectionResult.data.flaggedCount} flagged`}
                </span>
              </div>
              <div className="plasmo-space-y-3">
                {(showAllProducts ? products : products.slice(0, 4)).map((product, index) => (
                  <ProductCard
                    key={index}
                    product={product}
                    index={index}
                    isAnalyzed={!!detectionResult?.data}
                    isSafe={detectionResult?.data?.products?.[index]?.isSafe ?? true}
                  />
                ))}
                {products.length > 4 && !showAllProducts && (
                  <div className="plasmo-text-center plasmo-pt-2">
                    <button onClick={() => setShowAllProducts(true)} className="plasmo-text-sm plasmo-font-semibold plasmo-text-blue-600 hover:plasmo-underline">
                      Show {products.length - 4} more products
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default IndexPopup