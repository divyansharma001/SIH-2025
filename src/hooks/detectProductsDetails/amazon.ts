import { sendToBackground } from "@plasmohq/messaging"

type ScrapedProduct = {
  productUrl: string
  title: string
  description: string
  price: string
  images: string[]
  meta: Record<string, string>
}

const safeSendToBackground = async (msg: any) => {
  try {
    console.log('[compliance] Trying Plasmo messaging...', msg)
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Background messaging timeout')), 3000) // Reduced to 3 seconds for faster testing
    })
    
    const responsePromise = sendToBackground(msg)
    
    return await Promise.race([responsePromise, timeoutPromise])
  } catch (err) {
    console.warn('[compliance] Plasmo messaging failed, falling back to chrome.runtime.sendMessage', err)
    if (chrome.runtime?.sendMessage) {
      return new Promise((resolve) => {
        try {
          console.log('[compliance] Using chrome.runtime.sendMessage fallback...', msg)
          
          const timeoutId = setTimeout(() => {
            console.error('[compliance] Fallback sendMessage timeout')
            resolve(null)
          }, 5000)
          
          chrome.runtime.sendMessage(msg, (resp) => {
            clearTimeout(timeoutId)
            if (chrome.runtime.lastError) {
              console.error('[compliance] Fallback sendMessage error:', chrome.runtime.lastError?.message)
              resolve(null)
            } else {
              console.log('[compliance] Fallback sendMessage success:', resp)
              resolve(resp)
            }
          })
        } catch (e) {
          console.warn('[compliance] fallback sendMessage failed', e)
          resolve(null)
        }
      })
    }
    return null
  }
}

const injectPdpComplianceWidgetNew = (result: any) => {
  console.log('[compliance] Starting widget injection with result:', result)
  
  const existingWidget = document.getElementById('compliance-widget-container')
  if (existingWidget) {
    console.log('[compliance] Removing existing widget')
    existingWidget.remove()
  }

  const widget = document.createElement('div')
  widget.id = 'compliance-widget-container'

  const complianceScore = result?.complianceScore || result?.overallScore || 0
  const overall = typeof complianceScore === 'string' ? parseFloat(complianceScore) : Number(complianceScore)
  const isCompliant = overall > 80
  const borderColor = isCompliant ? '#28a745' : '#dc3545'
  const bgColor = isCompliant ? '#f6fff8' : '#fff8f8'

  console.log('[compliance] Widget styling - score:', overall, 'compliant:', isCompliant)

  Object.assign(widget.style, {
    border: `2px solid ${borderColor}`,
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0',
    backgroundColor: bgColor,
    fontFamily: 'Arial, sans-serif',
    zIndex: '10000',
    position: 'relative'
  } as any)

  const header = document.createElement('div')
  header.style.display = 'flex'
  header.style.alignItems = 'center'
  header.style.gap = '12px'
  header.style.fontSize = '16px'
  header.style.fontWeight = '700'
  header.style.color = borderColor

  const emoji = document.createElement('span')
  emoji.textContent = isCompliant ? '✅' : '❌'
  emoji.style.fontSize = '24px'

  const textWrapper = document.createElement('div')
  const title = document.createElement('div')
  title.textContent = `Compliance Score: ${overall}%`
  const subtitle = document.createElement('div')
  subtitle.textContent = 'Verified by E-Commerce Guard'
  subtitle.style.fontSize = '12px'
  subtitle.style.fontWeight = '400'
  subtitle.style.color = '#555'

  textWrapper.appendChild(title)
  textWrapper.appendChild(subtitle)
  header.appendChild(emoji)
  header.appendChild(textWrapper)
  widget.appendChild(header)

  if (Array.isArray(result?.issues) && result.issues.length > 0) {
    const issuesSection = document.createElement('div')
    issuesSection.style.marginTop = '12px'
    
    const issuesTitle = document.createElement('div')
    issuesTitle.textContent = 'Issues Found:'
    issuesTitle.style.fontWeight = '600'
    issuesTitle.style.color = '#dc3545'
    issuesTitle.style.fontSize = '14px'
    issuesSection.appendChild(issuesTitle)
    
    const issuesList = document.createElement('ul')
    issuesList.style.margin = '6px 0 0 20px'
    issuesList.style.padding = '0'
    issuesList.style.color = '#333'
    issuesList.style.fontSize = '13px'
    result.issues.forEach((issue: any) => {
      const li = document.createElement('li')
      const issueText = typeof issue === 'string' ? issue : (issue.message || issue.text || issue.description || issue.suggestion || issue.field || 'Unknown issue')
      li.textContent = issueText
      li.style.marginBottom = '4px'
      issuesList.appendChild(li)
    })
    issuesSection.appendChild(issuesList)
    widget.appendChild(issuesSection)
  }

  if (Array.isArray(result?.recommendations) && result.recommendations.length > 0) {
    const recsSection = document.createElement('div')
    recsSection.style.marginTop = '12px'
    
    const recsTitle = document.createElement('div')
    recsTitle.textContent = 'Recommendations:'
    recsTitle.style.fontWeight = '600'
    recsTitle.style.color = '#28a745'
    recsTitle.style.fontSize = '14px'
    recsSection.appendChild(recsTitle)
    
    const ul = document.createElement('ul')
    ul.style.margin = '6px 0 0 20px'
    ul.style.padding = '0'
    ul.style.color = '#333'
    ul.style.fontSize = '13px'
    result.recommendations.forEach((r: string) => {
      const li = document.createElement('li')
      li.textContent = r
      li.style.marginBottom = '4px'
      ul.appendChild(li)
    })
    recsSection.appendChild(ul)
    widget.appendChild(recsSection)
  }

  console.log('[compliance] Looking for placement location...')
  
  const priceBlock = document.getElementById('corePrice_feature_div') || document.getElementById('price') || document.querySelector('#price')
  if (priceBlock && priceBlock instanceof HTMLElement) {
    console.log('[compliance] Placing widget at price block')
    priceBlock.prepend(widget)
    return
  }
  
  const titleEl = document.getElementById('productTitle')
  if (titleEl && titleEl.parentElement) {
    console.log('[compliance] Placing widget after title')
    titleEl.parentElement.appendChild(widget)
    return
  }
  
  const featureBullets = document.getElementById('feature-bullets')
  if (featureBullets) {
    console.log('[compliance] Placing widget before feature bullets')
    featureBullets.parentElement?.insertBefore(widget, featureBullets)
    return
  }
  
  console.log('[compliance] Placing widget in body as fallback')
  document.body.appendChild(widget)
}

const scrapeImageUrlsNew = (): string[] => {
  const images: string[] = []
  const thumbnails = document.querySelectorAll<HTMLImageElement>('#altImages .a-button-thumbnail img, #altImages img')
  thumbnails.forEach(img => {
    try {
      let url = img.src || img.getAttribute('data-src') || ''
      url = url.replace(/US40/g, 'SL1500').replace(/AC_US40/g, 'AC_SL1500')
      if (url) images.push(url)
    } catch (e) { }
  })
  const mainImg = (document.querySelector('#imgTagWrapperId img') as HTMLImageElement) || (document.querySelector('img#landingImage') as HTMLImageElement)
  if (mainImg?.src) images.unshift(mainImg.src)
  return Array.from(new Set(images)).filter(Boolean)
}

const scrapeMetaDetailsNew = (): Record<string, string> => {
  const meta: Record<string, string> = {}
  const rows = document.querySelectorAll('#productDetails_detailBullets_sections1 tr, #detailBullets_feature_div li')
  rows.forEach(row => {
    const keyEl = row.querySelector('th, .a-text-bold')
    const valEl = row.querySelector('td, .a-list-item > span:last-child')
    if (keyEl && valEl) {
      const key = (keyEl.textContent || '').trim().toLowerCase().replace(/:/g, '')
      const value = (valEl.textContent || '').trim()
      if (key) meta[key] = value
      if (key.includes('brand')) meta['brand'] = value
      if (key.includes('manufacturer')) meta['manufacturer'] = value
    }
  })
  return meta
}

export const detectAndProcessAmazonProducts = async () => {
  try {
    try {
      if (window.top !== window.self) {
        console.log('[compliance] Running in iframe, skipping detection')
        return
      }
    } catch (e) {
      console.log('[compliance] Cannot access window.top, possibly sandboxed iframe, skipping')
      return
    }
    
    if (!document.getElementById('productTitle')) {
      console.log('[compliance] No product title found, not a product page')
      return
    }

    let currentUrl = 'unknown'
    try {
      currentUrl = window?.location?.href || 'unknown'
    } catch (urlError) {
      console.warn('[compliance] Cannot access window.location.href:', urlError)
    }

    const productData: ScrapedProduct = {
      productUrl: currentUrl,
      title: document.getElementById('productTitle')?.textContent?.trim() || '',
      description: Array.from(document.querySelectorAll('#feature-bullets .a-list-item')).map(el => (el.textContent || '').trim()).filter(Boolean).join('\n'),
      price: (document.querySelector('#corePrice_feature_div .a-offscreen')?.textContent || '').trim(),
      images: scrapeImageUrlsNew(),
      meta: scrapeMetaDetailsNew()
    }

    console.log('[compliance] Scraped product data:', productData)

    console.log('[compliance] Sending product to background script...')
    const response = await safeSendToBackground({ name: 'complianceChecker', body: { product: productData } })
    
    if (!response) {
      console.error('[compliance] No response from background')
      return
    }

    console.log('[compliance] Received compliance results:', response)
    
    try {
      let hostname = 'unknown'
      let currentUrl = 'unknown'
      
      try {
        hostname = window?.location?.hostname || 'unknown'
        currentUrl = window?.location?.href || 'unknown'
      } catch (urlError) {
        console.warn('[compliance] Cannot access window.location, using fallback:', urlError)
      }
      
      const storageKey = `compliance_${hostname}_${Date.now()}`
      const storageData = { 
        [storageKey]: { 
          product: productData, 
          result: response, 
          timestamp: Date.now(),
          url: currentUrl
        } 
      }
      
      console.log('[compliance] Data to store:', storageData)
      
      if (chrome?.storage?.local) {
        await chrome.storage.local.set(storageData)
        console.log('[compliance] Successfully stored compliance data')
        
        try {
          const stored = await chrome.storage.local.get([storageKey])
          console.log('[compliance] Verified stored data:', stored)
        } catch (verifyError) {
          console.warn('[compliance] Storage verification failed:', verifyError)
        }
      } else {
        console.warn('[compliance] chrome.storage not available, skipping storage')
      }
    } catch (e) { 
      console.error('[compliance] Storage failed with error:', e)
      console.log('[compliance] Continuing without storage - will still show widget')
    }

    console.log('[compliance] Injecting compliance widget...')
    injectPdpComplianceWidgetNew(response)
  } catch (e) {
    console.error('Error in detectAndProcessAmazonProducts:', e)
  }
}
