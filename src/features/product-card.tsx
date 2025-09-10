import { useState } from "react"

interface Product {
  title: string
  price: string
  image: string
  link: string
  complianceScore?: number
  issues?: any[]
  recommendations?: any[]
}

interface ProductCardProps {
  product: Product
  index: number
  isAnalyzed?: boolean
  isSafe?: boolean
  analysisResult?: any
}

export const ProductCard = ({ product, index, isAnalyzed = false, isSafe = true, analysisResult }: ProductCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const getItemText = (item: any): string => {
    if (typeof item === 'string') {
      return item
    }
    
    if (typeof item === 'object' && item !== null) {
      return item.message || item.text || item.description || item.suggestion || item.field || 'Unknown item'
    }
    
    return String(item)
  }

  const getStatusIcon = () => {
    if (!isAnalyzed) return "⏳"
    return isSafe ? "✅" : "⚠️"
  }

  const getStatusColor = () => {
    if (!isAnalyzed) return "text-gray-500"
    return isSafe ? "text-green-600" : "text-red-600"
  }

  const getStatusText = () => {
    if (!isAnalyzed) return "Pending Analysis"
    if (product.complianceScore !== undefined) {
      return `Compliance Score: ${product.complianceScore}%`
    }
    return isSafe ? "Safe to Purchase" : "Flagged Content"
  }

  const getBorderColor = () => {
    if (!isAnalyzed) return "border-gray-200"
    return isSafe ? "border-green-200" : "border-red-200"
  }

  const getBackgroundColor = () => {
    if (!isAnalyzed) return "bg-white"
    return isSafe ? "bg-green-50" : "bg-red-50"
  }

  return (
    <div className={`plasmo-bg-white plasmo-rounded-xl plasmo-p-4 plasmo-shadow-sm hover:plasmo-shadow-md plasmo-transition-all plasmo-duration-200 ${getBorderColor()} ${getBackgroundColor()}`}>
      <div className="plasmo-flex plasmo-items-center plasmo-space-x-5">
        <div className="plasmo-flex-shrink-0">
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.title}
              className="plasmo-w-16 plasmo-h-16 plasmo-object-cover plasmo-rounded-xl plasmo-border plasmo-border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <div className="plasmo-w-16 plasmo-h-16 plasmo-bg-gray-200 plasmo-rounded-xl plasmo-flex plasmo-items-center plasmo-justify-center">
              <svg className="plasmo-w-8 plasmo-h-8 plasmo-text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        <div className="plasmo-flex-1 plasmo-min-w-0">
          <div className="plasmo-flex plasmo-items-start plasmo-justify-between plasmo-mb-2">
            <div className="plasmo-flex-1 plasmo-min-w-0">
              <h4 className="plasmo-text-lg plasmo-font-bold plasmo-text-gray-900 plasmo-line-clamp-2 plasmo-mb-2">
                {product.title}
              </h4>
              <p className="plasmo-text-xl plasmo-font-bold plasmo-text-blue-600 plasmo-mb-2">
                {product.price}
              </p>
              
              {product.complianceScore !== undefined && (
                <div className="plasmo-mb-2">
                  <span className="plasmo-text-sm plasmo-text-gray-600">
                    Compliance Score: 
                    <span className={`plasmo-font-bold plasmo-ml-1 ${
                      product.complianceScore >= 80 ? 'plasmo-text-green-600' :
                      product.complianceScore >= 60 ? 'plasmo-text-yellow-600' : 
                      'plasmo-text-red-600'
                    }`}>
                      {product.complianceScore}%
                    </span>
                  </span>
                </div>
              )}
            </div>
            
            <div className="plasmo-flex-shrink-0 plasmo-ml-3">
              <div className={`plasmo-flex plasmo-items-center plasmo-space-x-2 ${getStatusColor()}`}>
                <span className="plasmo-text-3xl">{getStatusIcon()}</span>
              </div>
            </div>
          </div>

          <div className="plasmo-mb-4">
            <span className={`plasmo-text-sm plasmo-font-bold plasmo-px-3 plasmo-py-1 plasmo-rounded-lg ${getStatusColor()} ${
              isSafe ? 'plasmo-bg-green-100' : 'plasmo-bg-red-100'
            }`}>
              {getStatusText()}
            </span>
          </div>

        
          {product.issues && product.issues.length > 0 && (
            <div className="plasmo-mb-3">
              <h5 className="plasmo-text-sm plasmo-font-semibold plasmo-text-red-700 plasmo-mb-1">Issues Found:</h5>
              <ul className="plasmo-text-xs plasmo-text-red-600 plasmo-space-y-1">
                {product.issues.map((issue, index) => (
                  <li key={index} className="plasmo-flex plasmo-items-start plasmo-space-x-1">
                    <span className="plasmo-text-red-500">•</span>
                    <span>{getItemText(issue)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.recommendations && product.recommendations.length > 0 && (
            <div className="plasmo-mb-4">
              <h5 className="plasmo-text-sm plasmo-font-semibold plasmo-text-blue-700 plasmo-mb-1">Recommendations:</h5>
              <ul className="plasmo-text-xs plasmo-text-blue-600 plasmo-space-y-1">
                {product.recommendations.map((rec, index) => (
                  <li key={index} className="plasmo-flex plasmo-items-start plasmo-space-x-1">
                    <span className="plasmo-text-blue-500">→</span>
                    <span>{getItemText(rec)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="plasmo-flex plasmo-space-x-4">
            {product.link && (
              <a
                href={product.link}
                target="_blank"
                rel="noopener noreferrer"
                className="plasmo-text-sm plasmo-text-blue-600 hover:plasmo-text-blue-800 plasmo-font-bold plasmo-bg-blue-50 plasmo-px-4 plasmo-py-2 plasmo-rounded-lg plasmo-transition-colors plasmo-hover:plasmo-bg-blue-100"
              >
                View Product →
              </a>
            )}
            
            {!isSafe && (
              <button className="plasmo-text-sm plasmo-text-red-600 hover:plasmo-text-red-800 plasmo-font-bold plasmo-bg-red-50 plasmo-px-4 plasmo-py-2 plasmo-rounded-lg plasmo-transition-colors plasmo-hover:plasmo-bg-red-100">
                Report Issue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
