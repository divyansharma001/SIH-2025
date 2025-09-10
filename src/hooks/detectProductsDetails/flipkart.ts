import { sendToBackground } from "@plasmohq/messaging";

export const detectFlipkartProducts = async () => {
    try {
        const productElements = document.querySelectorAll(
            'div._2kHMtA, div._1AtVbE'
        );
        const products = Array.from(productElements).map((element) => {
            const titleElement = element.querySelector('a.s1Q9rs, a.IRpwTa');
            const priceElement = element.querySelector('div._30jeq3');
            const imageElement = element.querySelector('img._396cs4');
            const linkElement = element.querySelector('a.s1Q9rs, a.IRpwTa');

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
                platform: "flipkart"
            }
        });

    } catch (error) {
        console.error("Error in detectFlipkartProducts:", error);
    }
};
