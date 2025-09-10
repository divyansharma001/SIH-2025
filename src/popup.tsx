import { useState, useEffect } from "react"

// Mock components for demonstration
const Settings = () => (
  <button style={{
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }}>
    ⚙️
  </button>
)

const ProductStats = () => (
  <div>
    <h4 style={{
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px'
    }}>
      Analysis Summary
    </h4>
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#10B981'
        }}>12</div>
        <div style={{
          fontSize: '12px',
          color: '#6B7280'
        }}>Safe Products</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#EF4444'
        }}>3</div>
        <div style={{
          fontSize: '12px',
          color: '#6B7280'
        }}>Flagged Items</div>
      </div>
    </div>
  </div>
)

const ProductCard = ({ product, index, isAnalyzed, isSafe, analysisResult }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    background: '#F9FAFB',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    transition: 'all 0.2s ease'
  }}>
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '8px',
      background: product.image ? `url(${product.image})` : '#E5E7EB',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      flexShrink: 0
    }}>
      {!product.image && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9CA3AF',
          fontSize: '18px'
        }}>📦</div>
      )}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: '13px',
        fontWeight: '600',
        color: '#111827',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        {product.title || 'Product Title'}
      </div>
      <div style={{
        fontSize: '12px',
        color: '#059669',
        fontWeight: '600',
        marginTop: '2px'
      }}>
        {product.price || '$0.00'}
      </div>
    </div>
    {isAnalyzed && (
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: isSafe ? '#10B981' : '#EF4444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        flexShrink: 0
      }}>
        {isSafe ? '✓' : '⚠'}
      </div>
    )}
  </div>
)

interface Product {
  title: string
  price: string
  image: string
  link: string
}

interface DetectionResult {
  data?: any
  error?: string
}

function IndexPopup() {
  const [isDetecting, setIsDetecting] = useState(false)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [currentSite, setCurrentSite] = useState<string>("Amazon")
  const [products, setProducts] = useState<Product[]>([])

  const handleDetectProducts = async () => {
    setIsDetecting(true)
    setDetectionResult(null)
    
    // Simulate detection process
    setTimeout(() => {
      setDetectionResult({ 
        data: { 
          products: products.map((_, i) => ({ 
            isSafe: Math.random() > 0.3 
          })) 
        } 
      })
      setIsDetecting(false)
    }, 2000)
  }

  const getSiteIcon = () => {
    switch (currentSite) {
      case "Amazon":
        return "🛒"
      case "Flipkart":
        return "🛍️"
      case "Zepto":
        return "⚡"
      default:
        return "❌"
    }
  }

  const popupStyles = {
    container: {
      width: '400px',
      height: '650px',
      background: '#f8fafc',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative' as const
    },
    backgroundPattern: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      opacity: 0.6
    },
    mainCard: {
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      margin: '20px',
      height: 'calc(100% - 40px)',
      overflow: 'hidden',
      position: 'relative' as const,
      zIndex: 1
    },
    header: {
      background: '#3b82f6',
      color: 'white',
      padding: '24px',
      borderRadius: '16px 16px 0 0',
      position: 'relative' as const
    },
    headerOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
      borderRadius: '24px 24px 0 0'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative' as const,
      zIndex: 1
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    logoIcon: {
      width: '48px',
      height: '48px',
      background: 'rgba(255, 255, 255, 0.2)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    logoText: {
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '4px'
    },
    logoSubtext: {
      fontSize: '14px',
      opacity: 0.9,
      fontWeight: '500'
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    siteIcon: {
      fontSize: '28px',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
    },
    content: {
      padding: '24px',
      height: 'calc(100% - 120px)',
      overflowY: 'auto' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '20px'
    },
    statusCard: {
      background: '#f8fafc',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid #e2e8f0',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    statusCardOverlay: {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      width: '100px',
      height: '100px',
      background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
      borderRadius: '50%',
      transform: 'translate(30px, -30px)'
    },
    statusContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative' as const,
      zIndex: 1
    },
    statusLabel: {
      fontSize: '14px',
      color: '#64748b',
      fontWeight: '600',
      marginBottom: '8px'
    },
    statusValue: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#0f172a'
    },
    statusBadge: {
      padding: '8px 16px',
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: '600',
      background: currentSite === "Unsupported Site" ? '#fee2e2' : '#dcfce7',
      color: currentSite === "Unsupported Site" ? '#dc2626' : '#16a34a',
      border: `1px solid ${currentSite === "Unsupported Site" ? '#fecaca' : '#bbf7d0'}`
    },
    scanButton: {
      width: '100%',
      background: '#3b82f6',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      position: 'relative' as const,
      overflow: 'hidden'
    },
    scanButtonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 15px 35px -5px rgba(102, 126, 234, 0.5)'
    },
    scanButtonDisabled: {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: '0 5px 15px -5px rgba(102, 126, 234, 0.2)'
    },
    spinner: {
      width: '20px',
      height: '20px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      borderTop: '2px solid white',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    resultCard: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    resultIcon: {
      width: '20px',
      height: '20px'
    },
    successResult: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#16a34a'
    },
    errorResult: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: '#dc2626'
    },
    statsCard: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    productsCard: {
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    productsHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px'
    },
    productsTitle: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#111827'
    },
    productsCount: {
      fontSize: '13px',
      color: '#6b7280',
      background: '#f3f4f6',
      padding: '6px 12px',
      borderRadius: '20px',
      fontWeight: '500'
    },
    productsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '12px',
      maxHeight: '200px',
      overflowY: 'auto' as const
    },
    moreProducts: {
      textAlign: 'center' as const,
      padding: '16px 0',
      fontSize: '14px',
      color: '#6b7280'
    },
    footer: {
      textAlign: 'center' as const,
      padding: '16px 0',
      fontSize: '13px',
      color: '#9ca3af',
      borderTop: '1px solid #f3f4f6',
      marginTop: 'auto'
    }
  }

  return (
    <div style={popupStyles.container}>
      <div style={popupStyles.backgroundPattern}></div>
      
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .scan-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 15px 35px -5px rgba(102, 126, 234, 0.5);
          }
          
          .content-scroll::-webkit-scrollbar {
            width: 6px;
          }
          
          .content-scroll::-webkit-scrollbar-track {
            background: #f1f5f9;
            border-radius: 3px;
          }
          
          .content-scroll::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          
          .content-scroll::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>

      <div style={popupStyles.mainCard}>
        {/* Header */}
        <div style={popupStyles.header}>
          <div style={popupStyles.headerOverlay}></div>
          <div style={popupStyles.headerContent}>
            <div style={popupStyles.logo}>
              <div style={popupStyles.logoIcon}>
                <span style={{
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>🛡️</span>
              </div>
              <div>
                <div style={popupStyles.logoText}>E-Commerce Guard</div>
                <div style={popupStyles.logoSubtext}>AI-Powered Safety Scanner</div>
              </div>
            </div>
            <div style={popupStyles.headerRight}>
              <div style={popupStyles.siteIcon}>{getSiteIcon()}</div>
              <Settings />
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={popupStyles.content} className="content-scroll">
          {/* Current Site Status */}
          <div style={popupStyles.statusCard}>
            <div style={popupStyles.statusCardOverlay}></div>
            <div style={popupStyles.statusContent}>
              <div>
                <div style={popupStyles.statusLabel}>Current Site</div>
                <div style={popupStyles.statusValue}>{currentSite}</div>
              </div>
              <div style={popupStyles.statusBadge}>
                {currentSite === "Unsupported Site" ? "Not Supported" : "✓ Supported"}
              </div>
            </div>
          </div>

          {/* Scan Button */}
          <button
            onClick={handleDetectProducts}
            disabled={isDetecting || currentSite === "Unsupported Site"}
            className="scan-button"
            style={{
              ...popupStyles.scanButton,
              ...(isDetecting || currentSite === "Unsupported Site" ? popupStyles.scanButtonDisabled : {})
            }}
          >
            {isDetecting ? (
              <>
                <div style={popupStyles.spinner}></div>
                <span>Scanning Products...</span>
              </>
            ) : (
              <>
                <svg style={popupStyles.resultIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Scan Products for Safety</span>
              </>
            )}
          </button>

          {/* Detection Results */}
          {detectionResult && (
            <div style={popupStyles.resultCard}>
              {detectionResult.error ? (
                <div style={popupStyles.errorResult}>
                  <svg style={popupStyles.resultIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ fontWeight: '600' }}>{detectionResult.error}</span>
                </div>
              ) : (
                <div style={popupStyles.successResult}>
                  <svg style={popupStyles.resultIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span style={{ fontWeight: '600' }}>Products analyzed successfully!</span>
                </div>
              )}
            </div>
          )}

          {/* Statistics */}
          <div style={popupStyles.statsCard}>
            <ProductStats />
          </div>

          {/* Product Preview */}
          {products.length > 0 && (
            <div style={popupStyles.productsCard}>
              <div style={popupStyles.productsHeader}>
                <h3 style={popupStyles.productsTitle}>Detected Products</h3>
                <span style={popupStyles.productsCount}>
                  {products.length} found
                </span>
              </div>
              <div style={popupStyles.productsList}>
                {products.slice(0, 3).map((product, index) => (
                  <ProductCard
                    key={index}
                    product={product}
                    index={index}
                    isAnalyzed={!!detectionResult?.data}
                    isSafe={detectionResult?.data?.products?.[index]?.isSafe ?? true}
                    analysisResult={detectionResult?.data?.products?.[index]}
                  />
                ))}
                {products.length > 3 && (
                  <div style={popupStyles.moreProducts}>
                    <p>+{products.length - 3} more products detected</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={popupStyles.footer}>
            <p>🔒 Keep your shopping safe with AI-powered analysis</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup