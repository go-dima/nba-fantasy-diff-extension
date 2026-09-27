import { describe, expect, test } from "@jest/globals";
import { installStateTransform } from "./store";

type Action = { type: string };

// Minimal Redux createStore
const createStore = (reducer: (s: any, a: Action) => any, preloaded?: any, enhancer?: any): any => {
  if (enhancer) return enhancer(createStore)(reducer, preloaded);
  let state = reducer(preloaded, { type: "@@INIT" });
  return {
    getState: () => state,
    dispatch: (action: Action) => {
      state = reducer(state, action);
      return action;
    },
  };
};

const applyMiddleware = () => (next: any) => (reducer: any, preloaded: any) => ({
  ...next(reducer, preloaded),
  middleware: true,
});

const counter = (state = { count: 0 }, action: Action) =>
  action.type === "inc" ? { count: state.count + 1 } : state;

const tagged = <S>(state: S): S => ({ ...state, tagged: true });

// How the site builds its store: composeWithDevTools(applyMiddleware(thunk))
const siteStore = (win: Record<string, any>) =>
  createStore(counter, undefined, win.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__(applyMiddleware()));

describe("installStateTransform", () => {
  test("transforms every state of the site's store", () => {
    const win: Record<string, any> = {};
    installStateTransform(tagged, win);

    const store = siteStore(win);
    expect(store.middleware).toBe(true);
    expect(store.getState()).toEqual({ count: 0, tagged: true });

    store.dispatch({ type: "inc" });
    expect(store.getState()).toEqual({ count: 1, tagged: true });
  });

  test("chains to an existing Redux DevTools compose", () => {
    const calls: number[] = [];
    const devtoolsCompose = (...enhancers: any[]) => (cs: any) => {
      calls.push(enhancers.length);
      return enhancers.reduceRight((next, e) => e(next), cs);
    };
    const win: Record<string, any> = { __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: devtoolsCompose };
    installStateTransform(tagged, win);

    const store = siteStore(win);

    expect(calls).toEqual([2]);
    expect(store.getState().tagged).toBe(true);
  });

  test("supports the options-object form", () => {
    const win: Record<string, any> = {};
    installStateTransform(tagged, win);

    const composeFn = win.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({ name: "site" });
    const store = createStore(counter, undefined, composeFn(applyMiddleware()));

    expect(store.getState().tagged).toBe(true);
  });
});
