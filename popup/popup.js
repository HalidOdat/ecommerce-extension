// Issue: https://stackoverflow.com/questions/52047483/chrome-extension-activate-and-execute-background-js-on-click-from-popup-js
//
// Initialize background page
chrome.runtime.getBackgroundPage(function (backgroundPage) {
    console = backgroundPage.console;
})

await browser.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    let tab = tabs[0];

    await browser.runtime.sendMessage({
        action: "popup-request-info",
        tab,
    })
});

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "background-popup") {
        document.getElementById("output").innerHTML = ""

        let count = 1
        for (const { host, url, loaded, product } of message.products) {
            let title = "loading..."
            let price = "loading..."
            if (loaded) {
                if (product) {
                    title = product.title
                    price = product.price
                } else {
                    title = "N\\A"
                    price = "N\\A"
                }
            }

            document.getElementById("output").innerHTML += `<tr>
                <th scope="row">${count}</th>
                <td><a href="${url}">${host}</a></td>
                <td>${title}</td>
                <td>${price}</td>
            </tr>`

            count++
        }
    }
})
