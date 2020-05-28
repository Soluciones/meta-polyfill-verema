import Bowser from 'bowser'

async function handleRequest(request) {
  const response = await fetch(request)

  const userAgent = request.headers.get('User-Agent') || ''

  const browser = Bowser.getParser(userAgent)

  const hasNativeSupportOnImages = browser.satisfies({
    chrome: '>76',
    firefox: '>75',
    edge: '>80',
    mobile: {
      chrome: '>80'
    }
  })

  const hasNativeSupportOnIframes = browser.satisfies({
    chrome: '>85',
    firefox: '>79'
  })

  const rewriter = new HTMLRewriter()
    .on('img', new ElementHandler(hasNativeSupportOnImages, 'lazyload-image'))
    .on('iframe', new ElementHandler(hasNativeSupportOnIframes, 'lazyload-iframe'))

  return rewriter.transform(response)
}

class ElementHandler {
  constructor (hasNativeSupport, customElement) {
    this.hasNativeSupport = hasNativeSupport
    this.customElement = customElement
  }

  element (element) {
    if (element.hasAttribute('src') && !element.hasAttribute('loading')) {
      if (this.hasNativeSupport) {
        element.setAttribute('loading', 'lazy')
      } else {
        element.setAttribute('data-src', element.getAttribute('src'))
        element.setAttribute('is', this.customElement)
        element.removeAttribute('src')
      }
    }
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
