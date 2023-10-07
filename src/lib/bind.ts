import { ReadonlySignal, Signal, computed, effect } from "@preact/signals-core";

export { signal, computed, effect } from "@preact/signals-core";

const noop = () => {};

let initializingElements: (() => void)[][] = [];
const currentElementEffects = () =>
  initializingElements[initializingElements.length - 1];

export function text(el: HTMLElement, callback: () => string) {
  if (!el) {
    console.error(`undefined element passed to 'bind:text'`);
    return noop;
  }
  const boundContent = computed(callback);
  currentElementEffects()?.push(
    effect(() => {
      el.textContent = boundContent.value;
    })
  );
}

export function watch(callback: () => void) {
  currentElementEffects()?.push(effect(callback));
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
  currentElementEffects()?.push(() =>
    window.removeEventListener("click", clickHandler)
  );
}

export function onCustomEvent<T>(
  event: string,
  handler: (event: CustomEvent<T>) => void
) {
  // @ts-ignore this works
  window.addEventListener(event, handler);
  currentElementEffects()?.push(() =>
    // @ts-ignore this works
    window.removeEventListener(event, handler)
  );
}

export function on<T extends keyof HTMLElementEventMap>(
  target: EventTarget,
  event: T,
  handler: (event: HTMLElementEventMap[T]) => void,
  options?: EventListenerOptions
) {
  if (!target) {
    console.error(`undefined element passed to 'bind:on:${event}'`);
    return noop;
  }
  // @ts-ignore this works
  target.addEventListener(event, handler, options);
  currentElementEffects()?.push(() =>
    // @ts-ignore this works
    target.removeEventListener(event, handler, options)
  );
}

export function show(el: HTMLElement, predicate: () => boolean) {
  if (!el) {
    console.error(`undefined element passed to 'bind:show'`);
    return noop;
  }
  const shouldShow = computed(predicate);
  currentElementEffects()?.push(
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

export function define(tagName: string, setup: (params: SetupParams) => void) {
  const component = class extends HTMLElement {
    cleanups: (() => void)[] = [];
    connectedCallback() {
      const refElements = Array.from(
        this.querySelectorAll<HTMLElement>("[data-ref]")
      );
      const refs = refElements.reduce((agg, val: HTMLElement) => {
        agg[val.dataset.ref!] = val;
        return agg;
      }, {} as Record<string, HTMLElement>) as unknown as Record<
        string,
        HTMLElement
      >;
      initializingElements.push(this.cleanups);
      setup({ refs: generateRefProxy(refs, tagName), el: this });
      initializingElements.pop();
    }
    disconnectedCallback() {
      this.cleanups.forEach((cleanup) => cleanup());
    }
  };
  customElements.define(tagName, component);
}
