import { sendToBackground } from "@plasmohq/messaging";

export const detectZeptoProducts = async () => {
    try {
        const productElements = document.querySelectorAll(
            'div.product-card'
        );
        const products = Array.from(productElements).map((element) => {
            const titleElement = element.querySelector('h2 a span');
            const priceElement = element.querySelector('.a-price .a-offscreen');
            const imageElement = element.querySelector('img.s-image');
            const linkElement = element.querySelector('h2 a');

            return {
                title: titleElement?.innerText || "",
                price: priceElement?.innerText || "",
                image: imageElement?.src || "",
                link: linkElement?.href || ""
            };
        });

        await sendToBackground({
            name: "saveDetailsToDB",
            body: {
                products,
                platform: "zepto"
            }
        });

    } catch (error) {
        console.error("Error in detectZeptoProducts:", error);
    }
};
