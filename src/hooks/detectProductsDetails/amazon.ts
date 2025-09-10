import { sendToBackground } from "@plasmohq/messaging";

const extractASINFromLink = (link: string) => {
  const m = link.match(/\/(dp|gp\/product)\/([A-Z0-9]{10})/i) || link.match(/([A-Z0-9]{10})/i);
  return m ? m[2] || m[1] : null;
};

const safeSendToBackground = async (msg: any) => {
  try {
    return await (sendToBackground as any)(msg);
  } catch (err) {
    console.warn('[compliance] sendToBackground failed, falling back to chrome.runtime.sendMessage', err);
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      return new Promise((resolve) => {
        try {
          chrome.runtime.sendMessage(msg, (resp) => {
            if (chrome.runtime.lastError) {
              console.warn('[compliance] chrome.runtime.lastError', chrome.runtime.lastError);
              resolve(null);
            } else {
              resolve(resp);
            }
          });
        } catch (e) {
          console.warn('[compliance] fallback sendMessage failed', e);
          resolve(null);
        }
      });
    }

    return null;
  }
};

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
    if (window.top !== window.self) {
      console.log('[compliance] running inside an iframe - skipping detection');
      return;
    }

    const productElements = document.querySelectorAll('div.s-main-slot div.s-result-item');

    console.log('[compliance] Found product elements count:', productElements.length);

    let products: any[] = [];

    if (productElements.length === 0) {
      const titleEl = document.getElementById('productTitle') || document.querySelector('#title') || document.querySelector('[data-testid="product-title"]');
      if (titleEl) {
        const title = (titleEl.textContent || '').trim();
        const priceEl = document.querySelector('#priceblock_ourprice, #priceblock_dealprice, .a-price .a-offscreen, #tp_price_block_total_price_ww');
        const imageEl = document.querySelector('#imgTagWrapperId img, #landingImage, img[data-old-hires]');
        const link = window.location.href;
        const asin = extractASINFromLink(link) || (document.querySelector('[data-asin]') as HTMLElement)?.getAttribute('data-asin') || '';

        const product = {
          title,
          price: (priceEl?.textContent || '').trim(),
          image: (imageEl as HTMLImageElement)?.getAttribute('src') || '',
          link,
          asin
        };

        products.push(product);
        console.log('[compliance][extract][pdp]', product);
      } else {
        console.log('No products found on this page. Will observe for dynamic changes.');
      }
    } else {
      products = Array.from(productElements).map((element, index) => {
        const titleElement = element.querySelector('h2 a span') || element.querySelector('h2 span');
        const priceElement = element.querySelector('.a-price .a-offscreen') || element.querySelector('.a-color-price');
        const imageElement = element.querySelector('img.s-image') || element.querySelector('img[data-image-latency]');
        const linkElement = element.querySelector('h2 a') as HTMLAnchorElement | null;

        const href = linkElement?.getAttribute('href') || '';
        const asin = (element as HTMLElement).getAttribute('data-asin') || extractASINFromLink(href) || href || `product-${Math.random()}`;
        (element as HTMLElement).dataset.productId = asin;

        const product = {
          title: titleElement?.textContent?.trim() || "",
          price: priceElement?.textContent?.trim() || "",
          image: imageElement?.getAttribute('src') || "",
          link: href,
          asin
        };

        console.log(`[compliance][extract] product #${index}`, { productId: asin, ...product });

        return product;
      });
    }

    if (!products || products.length === 0) {
      const mainSlot = document.querySelector('div.s-main-slot');
      if (mainSlot) {
        let attempts = 0;
        const obs = new MutationObserver((mutations) => {
          attempts++;
          if (attempts > 8) {
            obs.disconnect();
            return;
          }
          const newItems = document.querySelectorAll('div.s-main-slot div.s-result-item');
          if (newItems.length > 0) {
            obs.disconnect();
            detectAndProcessAmazonProducts();
          }
        });
        obs.observe(mainSlot, { childList: true, subtree: true });
      }

      console.log('[compliance] no products to send to background');
      return;
    }

    console.log('[compliance] Sending products to background:', products.length, 'items');

    const response = await safeSendToBackground({
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
