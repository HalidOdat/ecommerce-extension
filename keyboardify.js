/// Letters that are used for the links, taken from a home-row keys of QWERTY keyboard.
const LETTERS = ['j', 'k', 'l', 'a', 's', 'd', 'f', 'g', 'h']

/// CSS style of a link label
const LINK_LABEL_STYLE = 'color: red; background-color: yellow; display: inline; font-family: monospace, monospace; font-weight: bold; z-index: 1000000;';

/// Return a permutation the letters with length L and index of permutation n.
const permutationOfLength = (n, L) => {
    let result = ""
    for (let i = 0; i < L; i++) {
        result += LETTERS[n % LETTERS.length].toUpperCase();
        n = parseInt(n / LETTERS.length);
    }
    return result
}

/// Check if input html dom element is a text input type.
function isTextInput(ele) {
    if (!ele) {
        return false;
    }
    let tagName = ele.tagName;
    if (tagName === "INPUT") {
        let validType = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week'];
        let eleType = ele.type;
        return validType.includes(eleType);
    }
    return tagName === 'TEXTAREA';
}

/// Check if input html dom element is not visible in the viewport.
function isHidden(el) {
    var style = window.getComputedStyle(el);
    return (style.display === 'none')
}

let links = []
let lettersPerLink = 0;

/// Finds links and marks with label
const markLinks = () => {
    let rawLinks = []
    for (let linkElement of document.getElementsByTagName('a')) {
        // If it's hidden (not visable to the user), then skip.
        if (isHidden(linkElement)) {
            continue
        }

        rawLinks.push(linkElement)
    }

    // The number of letters per link is calculated with log(count + 1)
    lettersPerLink = Math.ceil(Math.log10(rawLinks.length + 1));

    console.log("rawLinks.length :", rawLinks.length)
    console.log("lettersPerLink  :", lettersPerLink)

    let i = 0;
    for (let link of rawLinks) {
        console.log(link)

        let span = permutationOfLength(i, lettersPerLink)

        console.log("span: ", span)

        let element = document.createElement('sup')
        element.innerHTML = span
        element.setAttribute('style', LINK_LABEL_STYLE)

        link.prepend(element)
        links.push({ link, span: element, text: span })

        i++
    }
}

let keysPressed = ""

/// Clears the captured key storces as well as removing the link labels.
const clearLinks = () => {
    keysPressed = ""

    for (let link of links) {
        link.span.remove()
    }
    links = []
}

window.addEventListener('keydown', event => {
    console.log(event)

    // Only allow enable normal mode keybindings if we are not in link mode
    // and the current selected element is not a text input (so we prevent typing)
    if (links.length === 0 && !isTextInput(document.activeElement)) {
        let propagateEvent = false;
        switch (event.key.toLowerCase()) {
            case 'a':
                markLinks()
                break

            case 'h':
                history.back()
                break

            case ';':
                history.forward()
                break

            case 'k':
                window.scrollBy({ top: -1000, behavior: 'smooth' })
                break

            case 'l':
                window.scrollBy({ top: 1000, behavior: 'smooth' })
                break

            default:
                propagateEvent = true;
                break;
        }

        // If we are in normal mode and an key action can be taken,
        // then don't propagate it!
        if (!propagateEvent) {
            event.stopImmediatePropagation()
            event.stopPropagation()
            event.preventDefault()
            return
        }
    }

    if (links.length == 0) {
        return;
    }

    if (event.key === 'Escape' || event.key === 'Esc') {
        clearLinks()
        return
    }

    if (!LETTERS.includes(event.key.toLowerCase())) {
        if (event.key.toLowerCase() === 'e') {
            clearLinks()
            return
        }

        console.log(`non-LETTER key pressed ${event.key}`)
        return
    }

    keysPressed += event.key.toUpperCase()
    console.log(`Adding key to keysPressed ${keysPressed}: key: ${event.key}`)

    if (keysPressed.length === lettersPerLink) {
        for (let link of links) {
            if (!link.span.hidden && link.text === keysPressed) {
                window.location.href = link.link.getAttribute('href');
                break;
            }
        }

        clearLinks()
    } else {
        for (let link of links) {
            if (!link.text.startsWith(keysPressed)) {
                link.span.hidden = true
            }

            link.span.innerHTML = link.text.substring(keysPressed.length)
        }
    }
})
