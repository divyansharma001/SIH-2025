import { useEffect } from "react"
import type { PlasmoCSConfig } from "plasmo"

import { detectAmazonProducts } from "~hooks/detectProductsDetails/amazon"
import { detectFlipkartProducts } from "~hooks/detectProductsDetails/flipkart"
import { detectZeptoProducts } from "~hooks/detectProductsDetails/zepto"

export const config: PlasmoCSConfig = {
  matches: [
    "https://www.amazon.com/*",
    "https://www.flipkart.com/*",
    "https://www.zepto.com/*"
  ]
}

const ContentScript = () => {
  useEffect(() => {
    const setupDetection = async () => {
      try {
        const url = window.location.href

        if (url.includes("amazon.")) {
          detectAmazonProducts()
        } else if (url.includes("flipkart.com")) {
          detectFlipkartProducts()
        } else if (url.includes("zepto")) {
          detectZeptoProducts()
        }
      } catch (error) {
        console.error("Error in setupDetection:", error)
      }
    }

    setupDetection()
  }, [window.location.href])

  return null
}

export default ContentScript
