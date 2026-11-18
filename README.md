# Peregrine: transit notices a tired planner, or an agent, can't get wrong

**Give it the facts of a closure. It draws the line, writes the headline, makes a poster for every affected stop, and
refuses the notice that would strand someone.**

![Five A4 posters for the Harbour line closure between Quayside and Millbrook, the YOU ARE HERE marker stepping down one line diagram from poster to poster; below, the rider email on a phone, the social card, and check's own output: the notice written, and the same closure without a replacement bus refused at values.change[0].bus](docs/hero.png)

- **It refuses what would strand riders.** A closure with no replacement bus, a stop that isn't on the line, no
  step-free way through, no last train: `check` names the field and the fix, and nothing is drawn.
- **Every affected stop gets its poster.** One PDF with a page per stop, worked out from the closure, each with what
  the change means *there* and its own YOU ARE HERE. Nobody can forget Chandlers Yard.
- **The template writes the words and draws the line.** The headline comes from the facts ("No trains between
  Quayside and Millbrook") and reads the same in the email, on the posters and on the card. The email's line is drawn
  in table cells, with no images, so it reads with images off.
- **Built for agents.** An agent reads `describe`, writes a values file and fixes what `check` says. CI rejects any
  notice a template didn't check.

Peregrine is made with [Hyper Elements](https://github.com/hyper-elements/hyper-elements) `template()`: three templates
(an `Email`, a `Document` and a `Canvas`) that share one notice contract, one network and one brand. Peregrine, the
trams and trains of Port Ellery, is fictional.

![Four notices, hard cuts: the Harbour line closure's five posters and card; the Moor line skipping Saltmarket, two posters; the Viaduct line's fewer evening trams, six posters; then the same closure without a bus, five empty outlines marked "not written" beside check's refusal](docs/peregrine.gif)

## A notice is only the facts

```json
{
  "notice": "PE-2701",
  "posted": "2026-12-14",
  "starts": "2027-01-09",
  "ends": "2027-01-11",
  "change": [{
    "type": "harbour.closure",
    "from": "Quayside",
    "to": "Millbrook",
    "bus": { "route": "1X", "everyMinutes": 10 },
    "stepFree": "Bus 1X is step-free, and so are Quayside, Saltmarket and Millbrook stations.",
    "lastTrainBefore": "22:10",
    "firstTrainAfter": "05:30"
  }],
  "extraMinutes": 20,
  "reason": "We're renewing the track and signals under Castle Street, so trains can run every six minutes from March."
}
```

No headline, no colours, no list of stops for posters: the templates decide those. The change is one of three kinds
on each of five lines (`harbour.closure`, `moor.skip`, `viaduct.reduced`…), named after what GTFS-Realtime calls them
(`NO_SERVICE`, `REDUCED_SERVICE`).

![The three cards side by side: "No trains between Quayside and Millbrook" with the closed stretch drawn hollow and bus 1X dashed beside it; "Trains skip Saltmarket" with a hollow tick and a 7 minute walk to Kiln Row; "Fewer trams after 21:00, every 20 minutes" with the evening's departures thinning out](docs/cards.png)

## What it refuses

Every row is a file in [`designs/_refused/`](designs/_refused) and a test: `check` says exactly this, at this field.

| The mistake | What `check` says |
|---|---|
| Saying what's closed, not what to do | `values.change[0].bus`: Replacement bus is required |
| Forgetting wheelchair users | `values.change[0].stepFree`: Step-free way through (which stop, bus or lift) is required |
| A stop on another line | `values.change[0].from`: From (a Harbour line stop): expected one of "Ellery Central", "Ropewalk", … not "Kiln Row" |
| "Mill brook" | `values.change[0].to`: To (a Harbour line stop): expected one of … not "Mill brook" |
| "10pm" | `values.change[0].lastTrainBefore`: Last train before (24-hour, like 23:40): doesn't match … |
| "This weekend", on a poster up for ten days | `values.starts`: First day of the works: expected a date as YYYY-MM-DD, not "this weekend" |
| Two changes in one notice | `values.change`: 2 blocks; this template takes exactly 1 |
| Ninety minutes "extra" | `values.extraMinutes`: Extra minutes to allow: expected an integer from 0 to 60, not 90 |
| Dates the wrong way round | The works end (2027-01-09) before they start (2027-01-11) |
| Posting it the Wednesday before | Posted 2027-01-06, 3 days before the works start on 2027-01-09: riders need at least 7 days' notice |
| "Skipping" the end of the line | High Moor is the end of the Moor line, so trains can't skip it: write it as a closure from Moorside to High Moor |
| "Fewer" trains that are more | A train every 12 minutes isn't fewer: the Airport line runs every 15 minutes |
| A poster that would run off the page | Too long for a poster: what to do and why run 1 line past the page. Shorten the step-free way through or the reason by about 36 characters |

The first eight are the fields' own types, refused with their path before anything is built. The last five need
several fields together, so the templates' `render()` throws them in a planner's words (`template/render`).
The email also requires, through `@hyper-elements/lint`, an unsubscribe link, link text, contrast, `lang` and preview
text, and links only to `peregrine.example`. And the headlines can't overflow: see below.

## What it makes

| Rider email | Stop poster (one of five) |
|---|---|
| <img src="docs/clients/apple-mail.iphone.png" width="360" alt="The rider email as Apple Mail on an iPhone draws it: the Harbour line band with the headline and dates, what to do instead in three numbered steps with the step-free way last, the last and first trains, the line drawn in table cells with the closed stretch hollow and bus 1X dashed beside it, why, and a Plan your journey button"> | <img src="docs/poster-saltmarket.png" width="420" alt="The Saltmarket poster: the Harbour line panel with No trains between Quayside and Millbrook and the dates; No trains at Saltmarket, bus 1X stops at Dock Street outside the Mission; what to do instead, last and first trains, why; and the whole line drawn on the right with YOU ARE HERE at Saltmarket"> |

The email is shown by Hyper Elements' email client emulator (`@hyper-elements/email-clients`), which models Apple
Mail, Gmail and classic Outlook: see [`docs/clients/`](docs/clients) for the others. It's an emulator, not an inbox.

## How Hyper Elements does the work

- **`template()` with typed fields** ([`templates/_kit/fields.ts`](templates/_kit/fields.ts)). The notice is
  `prop.text` with patterns (24-hour times, `PE-0000`), `prop.date`, `prop.number` with ranges, a required
  `prop.object` for the bus and `prop.blocks` taking exactly one change.
- **Block types generated from the network** ([`templates/_kit/network.ts`](templates/_kit/network.ts)). Each line
  gets its own `closure`, `skip` and `reduced` types, whose stops are a `prop.choice` of that line's stops. So a stop
  on another line is a typed error with a path, and `describe --json` gives an agent a schema with one stop list per
  line (`oneOf`, 15 entries): it can't even write the mistake.
- **Pages derived from the facts.** The poster template returns a `Document` with one `Document.Page` per affected stop
  (a closure's stretch, a skip's two stops, every stop of a reduced line). There's no field to forget.
- **The words are the template's** ([`templates/_kit/copy.ts`](templates/_kit/copy.ts)): headline, dates, steps, what
  the change means at each stop. The reason is the planner's one sentence, flagged for review with `guidance`.
- **Headlines that fit, proven.** The card uses `Heading fit` with `image/fit`, `image/glyph` and `image/overflow`
  required, measured by `renderImage`. `fit` is Canvas-only, so for the email and the posters
  [`test/headlines.test.ts`](test/headlines.test.ts) lists every line the network can produce (every stop pair,
  every time and interval, every status) and lays each out with `layoutImage()` in Atkinson Hyperlegible at its size:
  each must take one line in 90% of its measure. Rename a stop to "Castle Street Exchange" and CI fails, naming
  the line and the size.
- **The line drawn three ways from the same data.** Table cells in the email
  ([`email-diagram.tsx`](templates/_kit/email-diagram.tsx)), `Svg` under a `Layer` on the poster
  ([`poster-line.tsx`](templates/_kit/poster-line.tsx)) and on the card ([`card-strip.tsx`](templates/_kit/card-strip.tsx)).
  The same grammar everywhere: solid where trains run, hollow where they don't, the bus dashed beside it.
- **One brand** ([`templates/_kit/brand.ts`](templates/_kit/brand.ts)): `defineTheme`, Atkinson Hyperlegible Next and
  Mono (the Braille Institute's typefaces for low-vision readers, because a notice is read at a stop, in the rain, by
  everyone), one colour per notice, its line's, in three places only.
- **Values files and the CLI.** Notices are data (`designs/*/…values.json`), made with `design new`, changed with
  `design set` and rendered with `render`. CI runs `check templates/` (every template's example, in every format) and
  `check designs/ --require-template`.

## Run it

Node 22 (`.nvmrc`):

```bash
npm ci
```

```bash
npm run check
```

```bash
npm test
```

```bash
npm run render
```

`render` writes each notice's email (HTML and plain text), poster PDF and card PNG under `out/designs/`. The fonts come
from Google Fonts the first time and are cached. `npm test` runs the refusals, the headline measurements, contrast and
the outputs (5, 2 and 6 poster pages; every email under Gmail's 102 KB clip).

The pictures in `docs/` are made with `npm run hero`, `npm run gif`, `npm run previews` and `npx tsx scripts/docs.ts`
(these need Chromium for Playwright, `pdftoppm`, ffmpeg and ImageMagick).

## Make a notice

```bash
npx hyper-elements describe templates/stop-poster.tsx
```

Write `designs/pe-2704/brief.json` with the facts, then make the notice for each template. Each is checked before it's
written:

```bash
for t in notice-email stop-poster notice-card; do npx hyper-elements design new templates/$t.tsx -o designs/pe-2704/$t.values.json --values designs/pe-2704/brief.json; done
```

```bash
npx hyper-elements render designs/pe-2704/
```

For agents, [`AGENTS.md`](AGENTS.md) has the loop and a mapping from a GTFS-Realtime alert
([`examples/gtfs-alert.json`](examples/gtfs-alert.json)) to a brief.

**Not a transit operator?** Ferries, campus shuttles, stadium gates, a building's lifts, a utility's planned works: the
contract is the same (what's closed, what to do instead, when, how much longer). Swap
[`network.ts`](templates/_kit/network.ts) for your own and keep the rest.

## In the Hyper Elements gallery

[`gallery/`](gallery) holds each template as one file, in the shape of the gallery's own templates
(`apps/website/examples/templates/`): `export const meta`, and a default export that draws the template's example.
They're generated from `templates/` (`npm run gallery`), and `scripts/gallery-check.tsx` renders them as the site's
generator does: bundled alone with esbuild, rendered with the email client checks, the PDF and PNG written with the
fonts fetched from Google Fonts. The gallery copies leave out the two imports the site can't resolve: the email's
lint rules and the poster's hyphenation setting.

## Files

```text
templates/            the three templates, one root each
  _kit/               what they share: network, fields, words, brand, type sizes, and each output's drawing
designs/pe-270x/      three notices (closure, skip, fewer trams): brief.json and a values file per template
designs/_refused/     thirteen notices that must stay refused
test/                 refusals, headline measurements, words, contrast, outputs
gallery/              the templates as single files for the gallery
scripts/              rerecord (after a template change), hero, gif, previews, docs, gallery, gallery-check
examples/             a GTFS-Realtime alert an agent can make a notice from
```

## Notes from building it

Built on `@hyper-elements/react` 0.5.0 and `@hyper-elements/cli` 0.3.0, the first versions with `template()`. Things
we worked around, for the maintainers:

- `renderPdf` hyphenates text that wraps ("be- / tween"), unlike the print HTML and the image, so the poster template
  imports [`templates/_kit/pdf.ts`](templates/_kit/pdf.ts), which turns react-pdf's hyphenation off.
- A `LineBreak` in a Document adds a non-embedded Helvetica-Bold to the PDF, so the posters set each line of a
  headline as its own block.
- `check()` lists a field's guidance once per block type in the schema, so the step-free hint is in its label instead.
- The CLI's `preview` doesn't take values files, so `scripts/previews.tsx` uses `renderInEmailClients()` on the
  checked snapshot.

## License

MIT. Atkinson Hyperlegible Next and Mono are © the Braille Institute, under the SIL Open Font License, loaded from
Google Fonts.
