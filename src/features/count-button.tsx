import { useState, useEffect } from "react"

interface ProductStats {
  totalScanned: number
  safeProducts: number
  flaggedProducts: number
  lastScanTime: string | null
}

export const ProductStats = () => {
  const [stats, setStats] = useState<ProductStats>({
    totalScanned: 0,
    safeProducts: 0,
    flaggedProducts: 0,
    lastScanTime: null
  })

  // Load stats from storage on mount
  useEffect(() => {
    chrome.storage.local.get(['productStats'], (result) => {
      if (result.productStats) {
        setStats(result.productStats)
      }
    })
  }, [])

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.productStats) {
        setStats(changes.productStats.newValue)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => chrome.storage.onChanged.removeListener(handleStorageChange)
  }, [])

  const formatLastScan = (timestamp: string | null) => {
    if (!timestamp) return "Never"
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div>
      <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-6">
        <h3 className="plasmo-text-xl plasmo-font-bold plasmo-text-gray-900">Activity</h3>
        <div className="plasmo-w-4 plasmo-h-4 plasmo-bg-green-400 plasmo-rounded-full plasmo-animate-pulse"></div>
      </div>
      
      <div className="plasmo-grid plasmo-grid-cols-3 plasmo-gap-8 plasmo-mb-6">
        <div className="plasmo-text-center">
          <div className="plasmo-text-3xl plasmo-font-bold plasmo-text-gray-900 plasmo-mb-1">{stats.totalScanned}</div>
          <div className="plasmo-text-sm plasmo-text-gray-600 plasmo-font-semibold">Total Scanned</div>
        </div>
        <div className="plasmo-text-center">
          <div className="plasmo-text-3xl plasmo-font-bold plasmo-text-green-600 plasmo-mb-1">{stats.safeProducts}</div>
          <div className="plasmo-text-sm plasmo-text-gray-600 plasmo-font-semibold">Safe</div>
        </div>
        <div className="plasmo-text-center">
          <div className="plasmo-text-3xl plasmo-font-bold plasmo-text-red-600 plasmo-mb-1">{stats.flaggedProducts}</div>
          <div className="plasmo-text-sm plasmo-text-gray-600 plasmo-font-semibold">Flagged</div>
        </div>
      </div>
      
      <div className="plasmo-text-sm plasmo-text-gray-500 plasmo-text-center plasmo-bg-gray-50 plasmo-rounded-lg plasmo-py-3 plasmo-px-4 plasmo-border plasmo-border-gray-200">
        Last scan: {formatLastScan(stats.lastScanTime)}
      </div>
    </div>
  )
}
