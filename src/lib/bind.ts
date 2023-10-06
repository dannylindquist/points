import { computed, effect } from "@preact/signals-core";

export { signal, computed, effect } from "@preact/signals-core";

const noop = () => {};

class BoundElement extends HTMLHtmlElement {
  cleanups: (() => void)[] = [];
}

let initializingElements: BoundElement[] = [];
const currentElement = () =>
  initializingElements[initializingElements.length - 1];

export function text(el: HTMLElement, callback: () => string) {
  if (!el) {
    console.error(`undefined element passed to 'bind:text'`);
    return noop;
  }
  const boundContent = computed(callback);
  currentElement()?.cleanups.push(
    effect(() => {
      el.textContent = boundContent.value;
    })
  );
}

export function clickAway(el: HTMLElement, callback: () => void) {
  function clickHandler(event: MouseEvent) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    if (el.contains(event.target)) {
      return;
    }
    callback();
  }
  window.addEventListener("click", clickHandler);
  currentElement()?.cleanups.push(() =>
    window.removeEventListener("click", clickHandler)
  );
}

export function on(
  target: EventTarget,
  event: keyof HTMLElementEventMap | string,
  handler: () => {},
  options?: EventListenerOptions
) {
  if (!target) {
    console.error(`undefined element passed to 'bind:on:${event}'`);
    return noop;
  }
  target.addEventListener(event, handler, options);
  currentElement()?.cleanups.push(() =>
    target.removeEventListener(event, handler, options)
  );
}

export function show(el: HTMLElement, predicate: () => boolean) {
  if (!el) {
    console.error(`undefined element passed to 'bind:show'`);
    return noop;
  }
  const shouldShow = computed(predicate);
  currentElement()?.cleanups.push(
    effect(() => {
      if (!shouldShow.value) {
        el.style.display = "none";
      } else {
        el.style.display = "unset";
      }
    })
  );
}

type SetupParams = {
  el: HTMLElement;
  refs: Record<string, HTMLElement>;
};

function generateRefProxy(refs: Record<string, HTMLElement>, tagName: string) {
  return new Proxy(refs, {
    get(target, key) {
      if (!(key in target)) {
        console.warn(`'${String(key)}' doesn't exist as a ref in ${tagName}`);
      }
      return Reflect.get(target, key);
    },
  });
}

export function define(
  tagName: string,
  setup: (params: SetupParams) => (() => void)[] | undefined
) {
  const component = class extends BoundElement {
    constructor() {
      super();
    }
    connectedCallback() {
      const refs = Array.from(this.querySelectorAll("[data-ref]")).reduce(
        (agg, val: HTMLElement) => {
          agg[val.dataset.ref!] = val;
          return agg;
        },
        {} as Record<string, HTMLElement>
      ) as unknown as Record<string, HTMLElement>;
      initializingElements.push(this);
      setup({ refs: generateRefProxy(refs, tagName), el: this }) ?? [];
      initializingElements.pop();
    }
    disconnectedCallback() {
      this.cleanups.forEach((cleanup) => cleanup());
    }
  };
  customElements.define(tagName, component);
}
