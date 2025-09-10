import type { PlasmoMessaging } from "@plasmohq/messaging"
import axios from "axios"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
    const {products, platform} = req.body
    console.log("Received products:", products)
    console.log("Platform:", platform)

    try {
        console.log("msg before axios req", products)
        const response = await axios.post(
            `https://harassment-saver-extension.onrender.com/api/v1/moderation/detect-harassment`,
            {
                products,
                platform
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )

        // Update statistics
        await updateProductStats(products.length, response.data)

        res.send({
            data: response.data
        })
    } catch (error) {
        console.error("API Error:", error)
        res.send({
            error: error.response?.data?.message || "Detection failed"
        })
    }
}

const updateProductStats = async (scannedCount: number, analysisResult: any) => {
    try {
        // Get current stats
        const result = await chrome.storage.local.get(['productStats'])
        const currentStats = result.productStats || {
            totalScanned: 0,
            safeProducts: 0,
            flaggedProducts: 0,
            lastScanTime: null
        }

        // Update stats
        const updatedStats = {
            ...currentStats,
            totalScanned: currentStats.totalScanned + scannedCount,
            lastScanTime: new Date().toISOString()
        }

        // Analyze results to count safe vs flagged products
        if (analysisResult && analysisResult.products) {
            analysisResult.products.forEach((product: any) => {
                if (product.isSafe) {
                    updatedStats.safeProducts += 1
                } else {
                    updatedStats.flaggedProducts += 1
                }
            })
        } else {
            // If no detailed analysis, assume all are safe for now
            updatedStats.safeProducts += scannedCount
        }

        // Save updated stats
        await chrome.storage.local.set({ productStats: updatedStats })
    } catch (error) {
        console.error("Error updating product stats:", error)
    }
}

export default handler