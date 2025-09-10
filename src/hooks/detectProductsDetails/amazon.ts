import { sendToBackground } from "@plasmohq/messaging";

const injectComplianceBadge = (element: HTMLElement, isCompliant: boolean, reasons: string[]) => {
  if (element.querySelector('.compliance-badge-container')) {
    return;
  }

  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'compliance-badge-container';
  badgeContainer.style.position = 'absolute';
  badgeContainer.style.top = '10px';
  badgeContainer.style.left = '10px';
  badgeContainer.style.zIndex = '1000';

  const badge = document.createElement('span');
  badge.textContent = isCompliant ? '✅ Compliant' : '❌ Non-Compliant';
  badge.style.padding = '4px 8px';
  badge.style.borderRadius = '4px';
  badge.style.color = 'white';
  badge.style.fontSize = '12px';
  badge.style.fontWeight = 'bold';
  badge.style.backgroundColor = isCompliant ? '#28a745' : '#dc3545';
  badge.title = reasons.join('\n'); 

  badgeContainer.appendChild(badge);

  const parent = element.querySelector('div.s-product-image-container, div.a-section > img');
  if (parent && (parent.parentElement as HTMLElement).style.position !== 'relative') {
    (parent.parentElement as HTMLElement).style.position = 'relative';
  }

  element.prepend(badgeContainer);
};

export const detectAndProcessAmazonProducts = async () => {
  try {
    const productElements = document.querySelectorAll('div.s-main-slot div.s-result-item');

    console.log('[compliance] Found product elements count:', productElements.length);

    if (productElements.length === 0) {
      console.log("No products found on this page.");
      return;
    }

    const products = Array.from(productElements).map((element, index) => {
      const titleElement = element.querySelector('h2 a span');
      const priceElement = element.querySelector('.a-price .a-offscreen');
      const imageElement = element.querySelector('img.s-image');
      const linkElement = element.querySelector('h2 a');

      const uniqueId = linkElement?.getAttribute('href') || `product-${Math.random()}`;
      (element as HTMLElement).dataset.productId = uniqueId;

      const product = {
        title: titleElement?.textContent?.trim() || "",
        price: priceElement?.textContent?.trim() || "",
        image: imageElement?.getAttribute('src') || "",
        link: uniqueId
      };

      console.log(`[compliance][extract] product #${index}`, { productId: uniqueId, ...product });

      return product;
    });

    console.log('[compliance] Sending products to background:', products.length, 'items');

    const response = await (sendToBackground as any)({
      name: "complianceChecker",
      body: {
        products
      }
    });

    console.log("[compliance] Received compliance results in content script:", response);

    if (response?.results) {
      response.results.forEach((result: any) => {
        console.log('[compliance][result]', result);
        const elementToUpdate = document.querySelector(`[data-product-id="${result.link}"]`) as HTMLElement;
        if (elementToUpdate) {
          console.log('[compliance] Injecting badge for', result.link, 'isCompliant:', result.isCompliant);
          injectComplianceBadge(elementToUpdate, result.isCompliant, result.reasons || []);
        } else {
          console.log('[compliance] Could not find element DOM for', result.link);
        }
      });
    }

  } catch (error) {
    console.error("Error in detectAndProcessAmazonProducts:", error);
  }
};
