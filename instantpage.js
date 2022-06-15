/*! instant.page v5.1.0 - (C) 2019-2020 Alexandre Dieulot - https://instant.page/license */
let mouseoverTimer;
let lastTouchTimestamp;
const prefetches = new Set();
const prefetchElement = document.createElement('link');
const isSupported =
  prefetchElement.relList &&
  prefetchElement.relList.supports &&
  prefetchElement.relList.supports('prefetch') &&
  window.IntersectionObserver &&
  'isIntersecting' in IntersectionObserverEntry.prototype;
const allowQueryString = false;
const allowExternalLinks = false;
const useWhitelist = false;
const mousedownShortcut = false;
const DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION = 1111;

let delayOnHover = 65;
let useMousedown = true;
let useMousedownOnly = false;
let useViewport = false;

if (isSupported) {
  const eventListenersOptions = {
    capture: true,
    passive: true,
  };

  if (!useMousedownOnly) {
    document.addEventListener(
      'touchstart',
      touchstartListener,
      eventListenersOptions
    );
  }

  if (!useMousedown) {
    document.addEventListener(
      'mouseover',
      mouseoverListener,
      eventListenersOptions
    );
  } else if (!mousedownShortcut) {
    document.addEventListener(
      'mousedown',
      mousedownListener,
      eventListenersOptions
    );
  }

  if (mousedownShortcut) {
    document.addEventListener(
      'mousedown',
      mousedownShortcutListener,
      eventListenersOptions
    );
  }

  if (useViewport) {
    let triggeringFunction;
    if (window.requestIdleCallback) {
      triggeringFunction = (callback) => {
        requestIdleCallback(callback, {
          timeout: 1500,
        });
      };
    } else {
      triggeringFunction = (callback) => {
        callback();
      };
    }

    triggeringFunction(() => {
      const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const linkElement = entry.target;
            intersectionObserver.unobserve(linkElement);
            preload(linkElement.href);
          }
        });
      });

      document.querySelectorAll('a').forEach((linkElement) => {
        if (isPreloadable(linkElement)) {
          intersectionObserver.observe(linkElement);
        }
      });
    });
  }
}

function touchstartListener(event) {
  /* Chrome on Android calls mouseover before touchcancel so `lastTouchTimestamp`
   * must be assigned on touchstart to be measured on mouseover. */
  lastTouchTimestamp = performance.now();

  const linkElement = event.target.closest('a');

  if (!isPreloadable(linkElement)) {
    return;
  }
  preload(linkElement.href);
}

function mouseoverListener(event) {
  if (
    performance.now() - lastTouchTimestamp <
    DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION
  ) {
    return;
  }

  const linkElement = event.target.closest('a');
  if (!isPreloadable(linkElement)) {
    return;
  }

  linkElement.addEventListener('mouseout', mouseoutListener, { passive: true });

  mouseoverTimer = setTimeout(() => {
    preload(linkElement.href);
    mouseoverTimer = undefined;
  }, delayOnHover);
}

function mousedownListener(event) {
  const linkElement = event.target.closest('a');

  if (!isPreloadable(linkElement)) {
    return;
  }

  preload(linkElement.href);
}

function mouseoutListener(event) {
  if (
    event.relatedTarget &&
    event.target.closest('a') == event.relatedTarget.closest('a')
  ) {
    return;
  }

  if (mouseoverTimer) {
    clearTimeout(mouseoverTimer);
    mouseoverTimer = undefined;
  }
}

function mousedownShortcutListener(event) {
  if (
    performance.now() - lastTouchTimestamp <
    DELAY_TO_NOT_BE_CONSIDERED_A_TOUCH_INITIATED_ACTION
  ) {
    return;
  }

  const linkElement = event.target.closest('a');

  if (event.which > 1 || event.metaKey || event.ctrlKey) {
    return;
  }

  if (!linkElement) {
    return;
  }

  linkElement.addEventListener(
    'click',
    function (event) {
      if (event.detail == 1337) {
        return;
      }

      event.preventDefault();
    },
    { capture: true, passive: false, once: true }
  );

  const customEvent = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: false,
    detail: 1337,
  });
  linkElement.dispatchEvent(customEvent);
}

function isPreloadable(linkElement, ignoreUrlCheck) {
  let href;
  if (!linkElement || !(href = linkElement.href)) {
    return false;
  }

  if (
    (!ignoreUrlCheck && prefetches.has(href)) ||
    href.charCodeAt(0) === 35 // #
  ) {
    return false;
  }

  const preloadLocation = new URL(href);
  if (
    !allowExternalLinks &&
    preloadLocation.origin !== location.origin &&
    !('instant' in linkElement.dataset)
  ) {
    return false;
  }

  if (
    preloadLocation.protocol !== 'http:' &&
    preloadLocation.protocol !== 'https:'
  ) {
    return false;
  }

  if (preloadLocation.protocol === 'http:' && location.protocol === 'https:') {
    return false;
  }
  if (
    !allowQueryString &&
    preloadLocation.search // &&
    // !('instant' in linkElement.dataset)
  ) {
    return false;
  }
  if (
    preloadLocation.hash &&
    preloadLocation.pathname + preloadLocation.search ===
      location.pathname + location.search
  ) {
    return false;
  }
  // if ('noInstant' in linkElement.dataset) return false;
  if (linkElement.getAttribute('download') !== null) {
    return false;
  }

  return true;
}

function preload(url) {
  if (prefetches.has(url)) {
    console.log('prefetch.exists', url, prefetches.size);
    return;
  }

  const prefetcher = document.createElement('link');
  prefetcher.rel = 'prefetch';
  prefetcher.href = url;
  document.head.appendChild(prefetcher);

  prefetches.add(url);
  console.log(`prefetch.add: ${url}`);
}
