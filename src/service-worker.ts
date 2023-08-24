/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core'
import { ExpirationPlugin } from 'workbox-expiration'
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'

declare const self: ServiceWorkerGlobalScope
const extRegex = new RegExp('/[^/?]+\\.[^/]+$')

clientsClaim()
precacheAndRoute(self.__WB_MANIFEST)

registerRoute(({ request, url }: { request: Request, url: URL }) => {

  const skip = request.mode !== 'navigate' ||
    url.pathname.startsWith('/_') ||
    url.pathname.match(extRegex)

  if (skip)
    return false

  return true

}, createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html'))

registerRoute(({ url }) => {

  return url.origin === self.location.origin && 
    url.pathname.endsWith('.png')

}, new StaleWhileRevalidate({ cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  })
)

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})