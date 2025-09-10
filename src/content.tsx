import { useEffect } from "react"
import type { PlasmoCSConfig } from "plasmo"

import { detectAndProcessAmazonProducts } from "~hooks/detectProductsDetails/amazon"

export const config: PlasmoCSConfig = {
  matches: [
    "https://*.amazon.com/*",
    "https://*.amazon.in/*"
  ]
}

const ContentScript = () => {
  useEffect(() => {
    const setupDetection = async () => {
      try {
        const url = window.location.href
        if (url.includes("amazon.")) {
          await detectAndProcessAmazonProducts()
        }
      } catch (error) {
        console.error("Error in setupDetection:", error)
      }
    }

    setupDetection()

    const originalPushState = history.pushState
    history.pushState = function (...args) {
      const ret = originalPushState.apply(this, args as any)
      window.dispatchEvent(new Event("locationchange"))
      return ret
    }

    const onLocationChange = () => {
      setupDetection()
    }

    window.addEventListener("popstate", () => window.dispatchEvent(new Event("locationchange")))
    window.addEventListener("locationchange", onLocationChange)

    return () => {
      history.pushState = originalPushState
      window.removeEventListener("locationchange", onLocationChange)
    }
  }, [])

  return null
}

export default ContentScript
