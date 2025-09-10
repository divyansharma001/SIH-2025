import { useEffect } from "react"
import type { PlasmoCSConfig } from "plasmo"


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
  console.log('[compliance] content script loaded', window.location.href)
        const url = window.location.href
        if (url.includes("amazon.")) {
          const mod = await import("~hooks/detectProductsDetails/amazon")
          await mod.detectAndProcessAmazonProducts()
        }
      } catch (error) {
        console.error("Error in setupDetection:", error)
      }
    }

    setupDetection()

    const messageListener = (message: any, sender: any, sendResponse: any) => {
      if (message?.action === "rescan") {
        console.log("[compliance] Rescan requested from popup")
        setupDetection()
        sendResponse({ status: "scan_started" })
      }
      return true
    }
    chrome.runtime.onMessage.addListener(messageListener)

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
  chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  return null
}

export default ContentScript
