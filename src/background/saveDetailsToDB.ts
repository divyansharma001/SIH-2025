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

export default handler