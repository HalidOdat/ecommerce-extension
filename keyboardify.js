const ESCAPE_KEY_CODE = 27
const LETTERS = ['j', 'k', 'l', 'a', 's', 'd', 'f', 'g', 'h']

function permutationOfLength(n, L) {
    let result = ""
    // Sequence is of length L
    for (let i = 0; i < L; i++) {
        result += LETTERS[n % LETTERS.length].toUpperCase();
        n = parseInt(n / LETTERS.length);
    }
    return result
}

function isTextInput(ele){
    if (!ele) {
        return false;
    }

    let tagName = ele.tagName;
    if(tagName === "INPUT"){
        let validType = ['text', 'password', 'number', 'email', 'tel', 'url', 'search', 'date', 'datetime', 'datetime-local', 'time', 'month', 'week'];
        let eleType = ele.type;
        return validType.includes(eleType);
    }
    return tagName === 'TEXTAREA';
}

let links = []
let types = {}
let lettersPerLink = 0;

const keyboardify = () => {
    function isHidden(el) {
        var style = window.getComputedStyle(el);
        return (style.display === 'none')
    }

    let rawLinks = []
    for (let linkElement of document.getElementsByTagName('a')) {
        if (isHidden(linkElement)) {
            continue
        }

        rawLinks.push(linkElement)
    }

    console.log("rawLinks.length :", rawLinks.length)

    lettersPerLink = Math.ceil(Math.log10(rawLinks.length + 1));

    console.log("lettersPerLink :", lettersPerLink)

    let i = 0;
    for (let link of rawLinks) {
        console.log(link)

        let span = permutationOfLength(i, lettersPerLink);

        console.log("span: ", span)

        let element = document.createElement('sup')
        element.innerHTML = span
        element.setAttribute('style', 'color: red; background-color: yellow; display: inline; font-family: monospace, monospace; font-weight: bold; z-index: 1000000;')
        link.prepend(element)

        i++
        links.push({ link, span: element, index: i, text: span })
    }
}

let keysPressed = ""

const clearLinks = () => {
    keysPressed = ""

    for (let link of links) {
        link.span.remove()
    }
    links = []
}

window.addEventListener('keydown', event => {
    console.log(event);
    if (links.length === 0 && !isTextInput(document.activeElement)) {
        if (event.key === 'a') {
            keyboardify()
            return;
        } else if (event.key === 'h') {
            history.back()
            return
        } else if (event.key === ';') {
            history.forward()
            return
        } else if (event.key === 'k') {
            smoothScroll({
                'scrollableDomEle': window,
                'direction': 'bottom',
                'duration': 300,
                'easingPreset': 'easeInCubic',
                'scrollAmount': 3000
              });
            return
        } else if (event.key === 'l') {
            smoothScroll({
                'scrollableDomEle': window,
                'direction': 'top',
                'duration': 300,
                'easingPreset': 'easeInCubic',
                'scrollAmount': 3000
              });
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
        console.log(`non-LETTER key pressed ${event.key}`)
        return
    }

    keysPressed += event.key.toUpperCase()
    console.log(`Adding key to keysPressed ${keysPressed}: key: ${event.key}`)

    if (keysPressed.length === lettersPerLink) {
        for (let link of links) {
            if (!link.span.hidden && link.text === keysPressed) {
                window.location.href = link.link.getAttribute('href');
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


// ------------------- Smooth scrolling -------------------------

// LICENCE MIT
//
// https://github.com/tarun-dugar/easy-scroll

const B1 = (t) => {
    return Math.pow(t, 3);
  };
  
  const B2 = (t) => {
    return 3 * t * t * (1 - t);
  };
  
  const B3 = (t) => {
    return 3 * t * Math.pow((1 - t), 2);
  };
  
  const B4 = (t) => {
    return Math.pow((1 - t), 3);
  };
  
  /* explanation:
  http://13thparallel.com/archive/bezier-curves/
  http://greweb.me/2012/02/bezier-curve-based-easing-functions-from-concept-to-implementation/
  */
  const getScrollTo = ({ percentTimeElapsed, x1, y1, x2, y2 }) => {
    return 1 - (x1 * B1(percentTimeElapsed) + y1 * B2(percentTimeElapsed) + x2 * B3(percentTimeElapsed) + y2 * B4(percentTimeElapsed));
  };

const EASINGS = {
    // no easing, no acceleration
    linear(t) { return t },
    // accelerating from zero velocity
    easeInQuad(t) { return t * t },
    // decelerating to zero velocity
    easeOutQuad(t) { return t * (2 - t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t },
    // accelerating from zero velocity 
    easeInCubic(t) { return t * t * t },
    // decelerating to zero velocity 
    easeOutCubic(t) { return (--t) * t * t + 1 },
    // acceleration until halfway, then deceleration 
    easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1 },
    // accelerating from zero velocity 
    easeInQuart(t) { return t * t * t * t },
    // decelerating to zero velocity 
    easeOutQuart(t) { return 1 - (--t) * t * t * t },
    // acceleration until halfway, then deceleration
    easeInOutQuart(t) { return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t },
    // accelerating from zero velocity
    easeInQuint(t) { return t * t * t * t * t },
    // decelerating to zero velocity
    easeOutQuint(t) { return 1 + (--t) * t * t * t * t },
    // acceleration until halfway, then deceleration 
    easeInOutQuint(t) { return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t }
  }

const getProgress = ({
    easingPreset, 
    cubicBezierPoints,
    duration,
    runTime
  }) => {
    const percentTimeElapsed = runTime / duration;
  
    if (EASINGS.hasOwnProperty(easingPreset)) {
      return EASINGS[easingPreset](percentTimeElapsed);
    } else if (
      cubicBezierPoints
      && !isNaN(cubicBezierPoints.x1) 
      && !isNaN(cubicBezierPoints.y1) 
      && !isNaN(cubicBezierPoints.x2) 
      && !isNaN(cubicBezierPoints.y2)
      && cubicBezierPoints.x1 >= 0
      && cubicBezierPoints.x2 >= 0) {
      return getScrollTo({
        percentTimeElapsed,
        'x1': cubicBezierPoints.x1,
        'x2': cubicBezierPoints.x2,
        'y1': cubicBezierPoints.y1,
        'y2': cubicBezierPoints.y2
      });    
    } else {
      console.error('Please enter a valid easing value');
    }
    return false;
  }
  
  const getTotalScroll = ({
    isWindow,
    scrollableDomEle,
    elementLengthProp,
    initialScrollPosition,
    isHorizontalDirection,
    scrollLengthProp,
    direction
  }) => {
    let totalScroll;
    
    if (isWindow) {
      const documentElement = document.documentElement;
      totalScroll = isHorizontalDirection ? documentElement.offsetWidth : documentElement.offsetHeight;
    } else {
      totalScroll = scrollableDomEle[scrollLengthProp] - scrollableDomEle[elementLengthProp];
    }
    return ['left', 'top'].includes(direction) ? initialScrollPosition :totalScroll - initialScrollPosition;
  }
  
  const smoothScroll = ({
    scrollableDomEle,
    onAnimationCompleteCallback,
    direction,
    onRefUpdateCallback,
    duration,
    cubicBezierPoints,
    easingPreset,
    scrollAmount
  }) => {
  
    let startTime               = null,
        scrollDirectionProp     = null,
        scrollLengthProp        = null,
        elementLengthProp       = null,
        isWindow                = scrollableDomEle === window,
        isHorizontalDirection   = ['left', 'right'].indexOf(direction) > -1,
        isToBottomOrToRight     = ['right', 'bottom'].indexOf(direction) > -1;
  
  
    if (isHorizontalDirection) {
      scrollDirectionProp = isWindow ? 'scrollX' : 'scrollLeft';
      elementLengthProp = isWindow ? 'innerWidth' : 'clientWidth';
      scrollLengthProp = 'scrollWidth';
    } else {
      scrollDirectionProp = isWindow ? 'scrollY' : 'scrollTop';
      elementLengthProp = isWindow ? 'innerHeight' : 'clientHeight';
      scrollLengthProp = 'scrollHeight';
    }
  
    const initialScrollPosition = scrollableDomEle[scrollDirectionProp];
    let totalScroll = getTotalScroll({
      isWindow,
      scrollableDomEle,
      elementLengthProp,
      initialScrollPosition,
      isHorizontalDirection,
      scrollLengthProp,
      direction
    });
  
    if (!isNaN(scrollAmount) && scrollAmount < totalScroll) {
      totalScroll = scrollAmount;
    }
  
    const scrollOnNextTick = (timestamp) => {
      const runTime = timestamp - startTime;
      const progress = getProgress({
        easingPreset, 
        cubicBezierPoints,
        runTime,
        duration
      });
  
      if (!isNaN(progress)) {
        const scrollAmt = progress * totalScroll;
        const scrollToForThisTick = (
          isToBottomOrToRight ? 
          scrollAmt + initialScrollPosition : 
          initialScrollPosition - scrollAmt
        );
  
        if (runTime < duration) {
          if (isWindow) {
            const xScrollTo = isHorizontalDirection ? scrollToForThisTick : 0;
            const yScrollTo = isHorizontalDirection ? 0 : scrollToForThisTick;
            window.scrollTo(xScrollTo, yScrollTo);
          } else {
            scrollableDomEle[scrollDirectionProp] = scrollToForThisTick;        
          }
          if (onRefUpdateCallback) {
            onRefUpdateCallback(requestAnimationFrame(scrollOnNextTick));
          } else {
            requestAnimationFrame(scrollOnNextTick);
          }
        } else {
          // Ensure 100% scroll completion
          const scrollAmt = totalScroll;
          const scrollToForFinalTick = (
            isToBottomOrToRight ? 
            scrollAmt + initialScrollPosition : 
            initialScrollPosition - scrollAmt
          );
          if (isWindow) {
            const xScrollTo = isHorizontalDirection ? scrollToForFinalTick : 0;
            const yScrollTo = isHorizontalDirection ? 0 : scrollToForFinalTick;
            window.scrollTo(xScrollTo, yScrollTo);
          } else {
            scrollableDomEle[scrollDirectionProp] = scrollToForFinalTick;        
          }
          // Run callback
          if (onAnimationCompleteCallback)
            onAnimationCompleteCallback();
        }
      }
    }
  
  
    requestAnimationFrame((timestamp) => {
      startTime = timestamp;
      scrollOnNextTick(timestamp);
    });
  }