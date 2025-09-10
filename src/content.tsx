import { useEffect } from "react"
import type { PlasmoCSConfig } from "plasmo"
import { detectAndProcessAmazonProducts } from "~hooks/detectProductsDetails/amazon"


export const config: PlasmoCSConfig = {
  matches: [
    "https://*.amazon.com/*",
    "https://*.amazon.in/*"
  ],
  all_frames: false
}

const ContentScript = () => {
  const setupDetection = async () => {
    try {
      console.log("[compliance] Content script running detection on:", window.location.href)
      await detectAndProcessAmazonProducts()
    } catch (error) {
      console.error("Error during product detection:", error)
    }
  }

  useEffect(() => {
    setupDetection()

    const messageListener = (message: any, sender: any, sendResponse: any) => {
      if (message.action === "rescan") {
        console.log("[compliance] Rescan requested from popup")
        setupDetection()
        sendResponse({ status: "scan_initiated" })
      }
      return true 
    }
    chrome.runtime.onMessage.addListener(messageListener)

    const onLocationChange = () => {
      setTimeout(setupDetection, 500)
    }

    const originalPushState = history.pushState
    history.pushState = function (...args) {
      originalPushState.apply(this, args)
      window.dispatchEvent(new Event("locationchange"))
    }
    window.addEventListener("popstate", () => window.dispatchEvent(new Event("locationchange")))
    window.addEventListener("locationchange", onLocationChange)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
      history.pushState = originalPushState
      window.removeEventListener("locationchange", onLocationChange)
    }
  }, [])

  return null
}

export default ContentScript
