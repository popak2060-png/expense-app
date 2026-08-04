const CACHE_NAME = "expense-app-v6";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./version.json"
];


/* نصب نسخه جدید */
self.addEventListener("install", event => {

    event.waitUntil(

        caches.open(CACHE_NAME).then(cache => {

            return cache.addAll(FILES_TO_CACHE);

        })

    );

});


/* فعال کردن نسخه جدید */
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


/* دریافت پیام بروزرسانی */
self.addEventListener("message", event => {

    if(event.data && event.data.type === "SKIP_WAITING"){

        self.skipWaiting();

    }

});


/* مدیریت درخواست فایل‌ها */
self.addEventListener("fetch", event => {

    event.respondWith(

        fetch(event.request)
            .then(response => {

                if(
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                ){

                    const clone = response.clone();

                    caches.open(CACHE_NAME).then(cache => {

                        cache.put(event.request, clone);

                    });

                }

                return response;

            })
            .catch(() => {

                return caches.match(event.request);

            })

    );

});
