# Writing a Peregrine notice (for coding agents)

You fill templates here; you never change them. A notice is a **values file**: data the templates check before
anything is drawn. The templates are in `templates/` (with their shared parts in `templates/_kit/`), the notices in
`designs/<notice id>/`. Run everything from the repository root after `npm ci`.

## The loop

1. **Read what the templates take.**
   `npx hyper-elements describe templates/stop-poster.tsx --json` lists every field, its kind, whether it's
   required, and a JSON Schema of the values (`valuesSchema`). The change is one block whose `type` names the line and
   the kind (`harbour.closure`, `moor.skip`, `viaduct.reduced`…); each type's stops are that line's own, so a stop on
   another line isn't in the schema at all.
2. **Write the brief**, `designs/<id>/brief.json`, with only the facts: the notice number, the dates, the change, the
   extra minutes and one plain sentence of why. Don't write headlines, colours or which stops get posters: the
   templates decide those.
3. **Make the notice for each template**, which checks it before writing anything:
   ```bash
   for t in notice-email notice-page stop-poster notice-card; do
     npx hyper-elements design new templates/$t.tsx -o designs/<id>/$t.values.json --values designs/<id>/brief.json
   done
   ```
4. **Fix what it says.** A refusal names the field (`values.change[0].bus`), and the message says what to change.
   Change one value with `design set` (it writes nothing if the template refuses it):
   ```bash
   npx hyper-elements design set designs/<id>/stop-poster.values.json 'change[0].bus={"route":"1X","everyMinutes":10}'
   ```
   Some refusals come from the templates' own checks of several fields together (`template/render … render threw:
   …`): the works ending before they start, a notice posted less than 7 days ahead, a skipped stop's alternative
   being the same stop.
5. **Check, then render.**
   ```bash
   npx hyper-elements check designs/<id>/ --require-template
   npx hyper-elements render designs/<id>/
   ```
   `review` lines are for a person (the reason sentence, the step-free sentence): say them in your summary, don't
   try to "fix" them.

Never edit `templates/` to get a notice through: a template that refuses a notice is the point. If the templates
can't say something true about a change (a closure with no replacement bus at all, say), report it.

## From a GTFS-Realtime alert

Operators often already have the facts as a GTFS-Realtime `Alert`. `examples/gtfs-alert.json` is the one behind
PE-2701; `designs/pe-2701/brief.json` is what an agent should make of it:

| GTFS-Realtime | Peregrine brief |
|---|---|
| `effect: NO_SERVICE` on a run of a route's stops | `change[0].type: "<route>.closure"`, `from` / `to` = the first and last informed stops |
| `effect: NO_SERVICE` on one stop | `"<route>.skip"`, `stop`, and `useInstead` (a neighbouring stop of the same line) |
| `effect: REDUCED_SERVICE` | `"<route>.reduced"`, `after`, `everyMinutes`, `lastTrain` |
| `active_period` (UTC) | `starts` / `ends` as dates (`YYYY-MM-DD`) |
| replacement bus, last/first service, journey time in `description_text` | `bus`, `lastTrainBefore` / `firstTrainAfter` (24-hour), `extraMinutes` |
| `description_text`'s why, in plain words | `reason`: one sentence, no jargon ("S&C" is "the track") |

Stop ids are the stop names in lower case with hyphens (`chandlers-yard` is "Chandlers Yard"); the network itself is
`templates/_kit/network.ts`.
