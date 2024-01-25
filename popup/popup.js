let input = document.getElementById("input")
input.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() == "enter") {
        chrome.runtime.sendMessage({
            action: "popup-request-info",
            input: input.value
        })
    }
})
input.focus()

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.runtime.sendMessage({
        action: "popup-request-info",
        tab: tabs[0],
    })
});

const render = (message) => {
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
            <td><a href="${url}" target="_blank">${host}</a></td>
            <td>${title}</td>
            <td>${price}</td>
        </tr>`

        count++
    }
}

chrome.storage.local.get('message', function (obj) {
    //Notify that we get the value.
    console.log('Value is ' + obj);

    if (obj?.message) {
        render(obj?.message)
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.action !== "background-popup") {
        return;
    }

    render(message)

    chrome.storage.local.set({ 'message': message }, function () {
        console.log('Settings saved');
    });
})
