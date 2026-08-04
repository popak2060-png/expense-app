const CACHE_NAME = "expense-app-v5";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json"
];


/* ---------- نصب Service Worker ---------- */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {

            return cache.addAll(FILES_TO_CACHE);

        })

    );

    // Service Worker جدید را سریع فعال کن
    self.skipWaiting();

});


/* ---------- فعال شدن نسخه جدید ---------- */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames
                    .filter(cacheName => cacheName !== CACHE_NAME)
                    .map(cacheName => caches.delete(cacheName))

            );

        }).then(() => {

            // کنترل تمام صفحات باز
            return self.clients.claim();

        })

    );

});

self.addEventListener("message", event => {

    if(event.data && event.data.type === "SKIP_WAITING"){

        self.skipWaiting();

    }

});


/* ---------- دریافت فایل‌ها ---------- */

self.addEventListener("fetch", event => {

    event.respondWith(

        fetch(event.request)

            .then(response => {

                // فقط پاسخ معتبر را ذخیره کن
                if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ) {

                    const responseClone = response.clone();

                    caches.open(CACHE_NAME).then(cache => {

                        cache.put(event.request, responseClone);

                    });

                }

                return response;

            })

            .catch(() => {

                // اگر اینترنت نبود، از Cache بخوان
                return caches.match(event.request);

            })

    );

});
