// The site builds its Redux store with redux-devtools-extension's
// `composeWithDevTools`, which picks up this global when it is defined.
// Defining it before the site's scripts run lets us wrap the root reducer.
const DEVTOOLS_COMPOSE = "__REDUX_DEVTOOLS_EXTENSION_COMPOSE__";

type Fn = (...args: any[]) => any;
type Enhancer = (createStore: Fn) => Fn;
type Compose = (...enhancers: Enhancer[]) => Enhancer;

export type StateTransform = <S>(state: S) => S;

const compose: Compose =
  (...enhancers) =>
  (createStore) =>
    enhancers.reduceRight((next, enhancer) => enhancer(next), createStore);

const transformEnhancer =
  (transform: StateTransform): Enhancer =>
  (createStore) =>
  (reducer: Fn, ...rest: unknown[]) =>
    createStore(
      (state: unknown, action: unknown) => transform(reducer(state, action)),
      ...rest
    );

// Runs `transform` on every state the site's store produces. Must be
// called before the site creates its store (document_start, MAIN world).
export const installStateTransform = (
  transform: StateTransform,
  win: Record<string, any> = window
) => {
  const previous: Fn | undefined = win[DEVTOOLS_COMPOSE];
  const enhancer = transformEnhancer(transform);
  const withTransform =
    (composeFn: Compose): Compose =>
    (...enhancers) =>
      composeFn(...enhancers, enhancer);

  // Mirrors composeWithDevTools: called either with enhancers, or with an
  // options object returning a compose function.
  win[DEVTOOLS_COMPOSE] = (...args: any[]) => {
    const [first] = args;
    if (first && typeof first === "object") {
      return withTransform(previous ? previous(first) : compose);
    }
    return withTransform(previous ?? compose)(...args);
  };
};
