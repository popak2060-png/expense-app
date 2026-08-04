const CACHE_NAME = "expense-app-v6";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./version.json"
];


/* ---------- نصب ---------- */

self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {

            return cache.addAll(FILES_TO_CACHE);

        })

    );

    self.skipWaiting();

});


/* ---------- فعال شدن ---------- */

self.addEventListener("activate", event => {

    event.waitUntil(

        caches.keys().then(cacheNames => {

            return Promise.all(

                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))

            );

        }).then(() => {

            return self.clients.claim();

        })

    );

});


/* ---------- پیام بروزرسانی ---------- */

self.addEventListener("message", event => {

    if(event.data && event.data.type === "SKIP_WAITING"){

        self.skipWaiting();

    }

});


/* ---------- دریافت فایل ---------- */

self.addEventListener("fetch", event => {

    const url = new URL(event.request.url);

    // فایل‌های اصلی برنامه همیشه از شبکه دریافت شوند
    if(
        url.pathname.endsWith("/app.js") ||
        url.pathname.endsWith("/index.html") ||
        url.pathname.endsWith("/style.css") ||
        url.pathname.endsWith("/version.json")
    ){

        event.respondWith(

            fetch(event.request, {
                cache: "no-store"
            }).then(response => {

                return response;

            }).catch(() => {

                return caches.match(event.request);

            })

        );

        return;

    }


    // سایر فایل‌ها
    event.respondWith(

        caches.match(event.request).then(response => {

            return response || fetch(event.request);

        })

    );

});
