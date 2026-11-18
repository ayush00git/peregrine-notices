/**
 * gallery/*.tsx: each template as one file, the shape of the Hyper Elements gallery's own
 * (apps/website/examples/templates/): `export const meta`, a default export that renders the template's example,
 * and only @hyper-elements/react and React imported. The shared kit is inlined in dependency order.
 *
 * Left out of the gallery copies, because the gallery's generator can't resolve them: the email's lint rules
 * (@hyper-elements/lint) and the poster's hyphenation fix (@react-pdf/renderer). The templates in templates/ keep both.
 *
 *   npx tsx scripts/gallery.ts && npx tsx scripts/gallery-check.tsx
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");
const KIT = ["network.ts", "brand.ts", "type.ts", "fields.ts", "copy.ts"];

const GALLERY = [
  {
    slug: "peregrine-notice-email",
    template: "notice-email.tsx",
    kit: ["email-diagram.tsx"],
    format: undefined,
    meta: { title: "Peregrine service change email", description: "A rider alert for a line closure: the change on the line's colour, what to do instead, and the line drawn in table cells, so it shows with images off.", root: "Email" },
  },
  {
    slug: "peregrine-stop-posters",
    template: "stop-poster.tsx",
    kit: ["poster-fit.ts", "poster-line.tsx"],
    format: "a4",
    meta: { title: "Peregrine stop posters", description: "One A4 poster for every stop a closure touches, in one PDF: what it means at that stop, what to do instead, and the whole line with YOU ARE HERE.", root: "Document" },
  },
  {
    slug: "peregrine-notice-card",
    template: "notice-card.tsx",
    kit: ["card-strip.tsx"],
    format: "landscape",
    meta: { title: "Peregrine service change card", description: "A line closure as a social card, 1200 by 675: the headline on the line's colour, the dates, the time to allow, and the stretch drawn from the network.", root: "Canvas" },
  },
];

const IMPORT = /^import\s+([\s\S]*?)\s+from\s+"([^"]+)";\s*$|^import\s+"([^"]+)";\s*$/gm;

/** A module's imports from packages (name -> specifiers), and its body without imports or `export` keywords. */
function split(source: string) {
  const packages = new Map<string, Set<string>>();
  let body = source.replace(IMPORT, (_all, names: string | undefined, from: string | undefined, sideEffect: string | undefined) => {
    if (sideEffect || !from || from.startsWith(".")) return "";
    const set = packages.get(from) ?? new Set<string>();
    const typeOnly = /^type\s+/.test(names!);
    for (const name of names!.replace(/^type\s+/, "").replace(/[{}]/g, "").split(",").map((s) => s.trim()).filter(Boolean)) set.add(typeOnly && !name.startsWith("type ") ? `type ${name}` : name);
    packages.set(from, set);
    return "";
  });
  body = body.replace(/^export (?=(const|function|type|interface|async function)\b)/gm, "");
  return { packages, body: body.trim() };
}

mkdirSync(join(ROOT, "gallery"), { recursive: true });
for (const g of GALLERY) {
  const files = [...KIT.map((f) => join("templates", "_kit", f)), ...g.kit.map((f) => join("templates", "_kit", f)), join("templates", g.template)];
  const packages = new Map<string, Set<string>>();
  const parts: string[] = [];
  for (const file of files) {
    const { packages: own, body } = split(readFileSync(join(ROOT, file), "utf8"));
    for (const [from, names] of own) {
      if (from === "@hyper-elements/lint" || from === "@react-pdf/renderer") continue;
      const set = packages.get(from) ?? new Set<string>();
      for (const name of names) set.add(name);
      packages.set(from, set);
    }
    parts.push(`// ${file}\n${body}`);
  }
  let source = parts.join("\n\n");
  // The template is the default export of its own file; here it's T, and the default export draws its example.
  source = source.replace(/^export default template\(/m, "const T = template(");
  if (g.template === "notice-email.tsx") {
    // Without @hyper-elements/lint: the lint rules go, the links and root rules stay.
    source = source.replace(/\n\s*plugins: \{ lint: lint\(\{[^}]*\}\) \},/, "").replace(/\n\s*require: \{ lint: \[[^\]]*\](, core: \[[^\]]*\])? \},/, (m) => (m.includes("core:") ? m.replace(/lint: \[[^\]]*\], /, "") : ""));
  }
  if (/\blint\(/.test(source)) throw new Error(`${g.slug}: lint is still used`);
  const imports = [...packages]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([from, names]) => `import { ${[...names].sort((a, b) => a.replace(/^type /, "").localeCompare(b.replace(/^type /, ""))).join(", ")} } from "${from}";`)
    .join("\n");
  const head = `/**\n * ${g.meta.title}: generated from the peregrine-notices repository (templates/${g.template} and the kit it imports),\n * as one file for the Hyper Elements gallery. The template is T; this file's default export draws its example.\n */`;
  const meta = `export const meta = ${JSON.stringify(g.meta, null, 2).replace(/"(\w+)":/g, "$1:")};`;
  const tail = `/** The template's own example, drawn${g.format ? ` in its ${g.format} format` : ""}. */\nexport default function Example() {\n  return T.design(T.example${g.format ? `, { format: "${g.format}" }` : ""});\n}`;
  const out = `${head}\n${imports}\n\n${meta}\n\n${source}\n\n${tail}\n`;
  writeFileSync(join(ROOT, "gallery", `${g.slug}.tsx`), out);
  console.log(`gallery/${g.slug}.tsx: ${out.split("\n").length} lines`);
}
