const PAGES_URL = chrome.runtime.getURL('/pages.json')

fetch(PAGES_URL)
    .then((resp) => resp.json())
    .then((pages) => {
        if (!pages.map((page) => page.host).includes(window.location.host)) {
            return
        }

        chrome.runtime.sendMessage({
            action: "content-info",
            host: window.location.host,
            html: document.documentElement.outerHTML,
        })
    })
