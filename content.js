const init = async () => {
    const PAGES_URL = await browser.runtime.getURL('/pages.json')
    const PAGES = await fetch(PAGES_URL).then((resp) => resp.json())

    if (!PAGES.map((page) => page.host).includes(window.location.host)) {
        return
    }

    await browser.runtime.sendMessage({
        action: "content-info",
        host: window.location.host,
        html: document.documentElement.outerHTML,
    })
}
init().then()
