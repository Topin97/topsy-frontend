const CACHE_NAME = 'topsy-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
]

// Install — precache shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip API calls and non-GET
  if (request.method !== 'GET') return
  if (url.hostname.includes('api.topsy.es')) return
  if (url.hostname.includes('supabase.co')) return

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response.ok && response.type === 'basic') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then(cached => {
          if (cached) return cached
          // For navigation requests, return app shell
          if (request.mode === 'navigate') return caches.match('/index.html')
        })
      })
  )
})

// Push notifications (for future use)
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url ?? '/' },
  })
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(clients.openWindow(event.notification.data.url))
})