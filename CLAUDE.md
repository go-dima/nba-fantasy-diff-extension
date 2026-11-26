# NBA Fantasy Extension

Chrome extension (MV3) enhancing nbafantasy.nba.com. `src/content.ts` runs
every feature on each DOM mutation; `src/page.ts` runs in the page's own JS
context at document_start.

## Architecture: site knowledge vs. features

The site changes its markup and API without notice. Keep everything that
depends on them in two places, so a site change is fixed there and nowhere
else.

- `src/locators/` — the only code that knows the site's DOM: selectors,
  structure, titles/labels the site renders, image URL patterns. Locators
  *find and describe*; they return elements plus parsed facts (team code,
  player code, texts). They never modify the page. Attributes the extension
  adds (`EXT_*_ATTR`) are declared here so locators can tell the site's
  elements from ours.
- `src/schedule/api.ts` — the only code that knows the site's API:
  endpoints, response shapes (only fields we use), text formats such as
  `news` ("<reason> expected back <date>") and naming such as "Gameweek N".
- `src/internals/` — knowledge of the site's JS state (used by `page.ts`).
- Feature folders (`FullWeek/`, `InjuryNews/`, `WeekGames/`, ...) — consume
  locators and the API and do all page modification (insert cells, set
  styles, tooltips). No selectors, no `querySelector` on site markup, no
  site strings or API formats.

When a feature needs something new from the page, add it to a locator (with
a test) and consume it; don't reach into the DOM from the feature.

## Tests

- Jest + jsdom: `npx jest`; types: `npx tsc --noEmit -p .`; build: `npm run build`.
- Site markup fixtures live in `src/locators/__fixtures__/`, captured from
  the real site (note the page and date in a header comment, hashed classes
  trimmed). Locator tests use them directly; feature tests reuse them.
- API fixtures live in `src/schedule/__fixtures__/`.
