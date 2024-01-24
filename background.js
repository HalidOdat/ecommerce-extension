const CONTEXT_MENU_ID = "product-selection"
browser.runtime.onInstalled.addListener(async () => {
    console.log("Installed")
    await browser.contextMenus.create({
        id: CONTEXT_MENU_ID,
        title: "Search Product...",
        contexts: ["selection"],
    })
})

const PAGES_URL = await browser.runtime.getURL('/pages.json')
const PAGES = await fetch(PAGES_URL).then((resp) => resp.json())

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

    let tab = await browser.tabs.create({
        url,
        active: false,
    })

    workerTabs.push(tab.id)
    products.push({
        host: page.host,
        url,
        product: undefined,
        loaded: false,
    })

    // This requires "tabHide":
    //
    // await browser.tabs.hide(tab.id)
}

const extractProduct = ({ host, html }) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");

    let title;
    let price;
    for (const page of PAGES) {
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

const init = (selection) => {
    workerTabs = []
    products = []

    for (const page of PAGES) {
        startWorkerTab(page, selection)
        browser.runtime.sendMessage({
            action: "background-popup",
            products,
        })
    }
}

await browser.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log(request)
    switch (request.action) {
        case "popup-request-info": {
            await browser.runtime.sendMessage({
                action: "background-popup",
                products,
            });
            if (request.hasOwnProperty("input")) {
                init(request.input.trim())
            }
            break;
        }
        case "content-info": {
            console.log(`Sender: ${sender.tab.id}, workerTabs: ${workerTabs}`)
            if (workerTabs.includes(sender.tab.id)) {
                await browser.tabs.remove(sender.tab.id)

                const product = extractProduct(request)

                let description = products.find((product) => product.host === request.host)
                description.product = product
                description.loaded = true

                console.log("Product: ", product);
                await browser.runtime.sendMessage({
                    action: "background-popup",
                    products,
                });
                break
            }
        }
    }
});

browser.contextMenus.onClicked.addListener(async (info) => {
    if (info.menuItemId !== CONTEXT_MENU_ID) {
        return;
    }

    browser.action.openPopup()
    init(info.selectionText)
});
