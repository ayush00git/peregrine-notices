# How Peregrine uses Hyper Elements

The detail behind the README's short version, for anyone reading the code.

## The templates

- **`template()` with typed fields** ([`templates/_kit/fields.ts`](../templates/_kit/fields.ts)). The notice is
  `prop.text` with patterns (24-hour times, `PE-0000`), `prop.date`, `prop.number` with ranges, a required
  `prop.object` for the bus and `prop.blocks` taking exactly one change.
- **Block types generated from the network** ([`templates/_kit/network.ts`](../templates/_kit/network.ts)). Each line
  gets its own `closure`, `skip` and `reduced` types, whose stops are a `prop.choice` of that line's stops. So a stop
  on another line is a typed error with a path, and `describe --json` gives an agent a schema with one stop list per
  line (`oneOf`, 15 entries): it can't even write the mistake.
- **Pages derived from the facts.** The poster template returns a `Document` with one `Document.Page` per affected stop
  (a closure's stretch, a skip's two stops, every stop of a reduced line). There's no field to forget.
- **The words are the template's** ([`templates/_kit/copy.ts`](../templates/_kit/copy.ts)): headline, dates, steps,
  what the change means at each stop. The reason is the planner's one sentence, flagged for review with `guidance`.
- **Checks across fields.** What needs several fields together (dates the wrong way round, posted too late, a skip of
  a line's end, "fewer" trains that are more, a poster that would run off the page) is thrown from `render()` in a
  planner's words (`template/render`).
- **Rules over the result.** The email requires, through `@hyper-elements/lint`, an unsubscribe link, link text,
  contrast, `lang` and preview text, and links only to `peregrine.example`. The card requires `image/fit`,
  `image/glyph` and `image/overflow`; the posters `document/overflow` and `layout/overflow`.

## Headlines that fit, proven

The card uses `Heading fit`, measured by `renderImage`. `fit` is Canvas-only, so for the email and the posters
[`test/headlines.test.ts`](../test/headlines.test.ts) lists every line the network can produce (every stop pair, every
time and interval, every status) and lays each out with `layoutImage()` in Atkinson Hyperlegible at its size: each
must take one line in 90% of its measure. Rename a stop to "Castle Street Exchange" and CI fails, naming the line and
the size.

## One line, drawn three ways

Table cells in the email ([`email-diagram.tsx`](../templates/_kit/email-diagram.tsx)), `Svg` under a `Layer` on the
poster ([`poster-line.tsx`](../templates/_kit/poster-line.tsx)) and on the card
([`card-strip.tsx`](../templates/_kit/card-strip.tsx)). The same grammar everywhere: solid where trains run, hollow
where they don't, the bus dashed beside it.

## One brand

[`templates/_kit/brand.ts`](../templates/_kit/brand.ts): `defineTheme`, Atkinson Hyperlegible Next and Mono (the
Braille Institute's typefaces for low-vision readers, because a notice is read at a stop, in the rain, by everyone),
one colour per notice, its line's, in three places only.

## Values files, the CLI and CI

Notices are data (`designs/*/…values.json`), made with `design new`, changed with `design set` and rendered with
`render`. CI runs `check templates/` (every template's example, in every format), `check designs/ --require-template`,
the tests, the render, and the gallery check. After changing a template, `npm run rerecord` makes every notice again
from its brief.

## The gallery copies

[`gallery/`](../gallery) holds each template as one file, in the shape of the gallery's own templates
(`apps/website/examples/templates/`): `export const meta`, and a default export that draws the template's example.
They're generated from `templates/` (`npm run gallery`), and `scripts/gallery-check.tsx` renders them as the site's
generator does: bundled alone with esbuild, rendered with the email client checks, the PDF and PNG written with fonts
fetched from Google Fonts. They leave out the two imports the site can't resolve: the email's lint rules and the
poster's hyphenation setting.

## The pictures in docs/

`npm run hero`, `npm run gif`, `npm run previews` and `npx tsx scripts/docs.ts` (these need Chromium for Playwright,
`pdftoppm`, ffmpeg and ImageMagick). The email previews come from Hyper Elements' email client emulator
(`@hyper-elements/email-clients`): an emulator, not an inbox.

## Notes from building it

Built on `@hyper-elements/react` 0.5.0 and `@hyper-elements/cli` 0.3.0, the first versions with `template()`. Things
we worked around:

- `renderPdf` hyphenates text that wraps ("be- / tween"), unlike the print HTML and the image, so the poster template
  imports [`templates/_kit/pdf.ts`](../templates/_kit/pdf.ts), which turns react-pdf's hyphenation off.
- A `LineBreak` in a Document adds a non-embedded Helvetica-Bold to the PDF, so the posters set each line of a
  headline as its own block.
- `check()` lists a field's guidance once per block type in the schema, so the step-free hint is in its label instead.
- The CLI's `preview` doesn't take values files, so `scripts/previews.tsx` uses `renderInEmailClients()` on the
  checked snapshot.
