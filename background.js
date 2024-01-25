const CONTEXT_MENU_ID = "product-selection"
chrome.runtime.onInstalled.addListener(() => {
    console.log("Installed")
    chrome.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: "Search Product...",
        contexts: ["selection"],
    })
})

const PAGES_URL = chrome.runtime.getURL('/pages.json')

let workerTabs = []
let products = []

const startWorkerTab = async (page, name) => {
    const { search, searchReplace, suffix } = page;

    let component = encodeURIComponent(name.trim())
    if (searchReplace) {
        component = component.replaceAll(searchReplace[0], searchReplace[1]);
    }
    let url = `${search}${component}`
    if (suffix) {
        url += suffix
    }

    chrome.tabs.create({
        url,
        active: false,
    }, (tab) => {
        workerTabs.push(tab.id)
        products.push({
            host: page.host,
            url,
            product: undefined,
            loaded: false,
        })

        // This requires "tabHide" permission (only available on firefox :( )):
        //
        // await browser.tabs.hide(tab.id)
    })
}

const extractProduct = (pages, { host, html }) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");

    let title;
    let price;
    for (const page of pages) {
        if (page.host != host) {
            continue;
        }

        title = dom.documentElement.querySelector(page.title)?.innerText
        price = dom.documentElement.querySelector(page.price)?.innerText
    }

    if (!(title && price)) {
        return undefined
    }

    return { title: title.trim(), price }
}

const init = (pages, selection) => {
    workerTabs = []
    products = []

    for (const page of pages) {
        startWorkerTab(page, selection)
        chrome.runtime.sendMessage({
            action: "background-popup",
            products,
        })
    }
}

fetch(PAGES_URL)
    .then((resp) => resp.json())
    .then((pages) => {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            console.log(request)
            switch (request.action) {
                case "popup-request-info": {
                    sendResponse({
                        action: "background-popup",
                        products,
                    });
                    if (request.hasOwnProperty("input")) {
                        init(pages, request.input.trim())
                    }
                    break;
                }
                case "content-info": {
                    console.log(`Sender: ${sender.tab.id}, workerTabs: ${workerTabs}`)
                    if (workerTabs.includes(sender.tab.id)) {
                        chrome.tabs.remove(sender.tab.id)

                        const product = extractProduct(pages, request)

                        let description = products.find((product) => product.host === request.host)
                        description.product = product
                        description.loaded = true

                        console.log("Product: ", product);
                        chrome.runtime.sendMessage({
                            action: "background-popup",
                            products,
                        });
                        break
                    }
                }
            }
        });

        chrome.contextMenus.onClicked.addListener((info) => {
            if (info.menuItemId !== CONTEXT_MENU_ID) {
                return;
            }

            if (typeof (browser) === "object") {
                // On firefox, it expects 0 aguments otherwise throws
                chrome.browserAction.openPopup()
            } else {
                // On chrome, it expects 1 function aguments otherwise throws
                chrome.browserAction.openPopup(() => { })
            }
            init(pages, info.selectionText)
        });
    })
