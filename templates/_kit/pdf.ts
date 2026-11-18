/**
 * react-pdf hyphenates long words by default, so a poster's headline could print as "be- / tween Chan- / dlers Yard".
 * The print HTML and the image break at spaces; this makes the PDF do the same. Imported by the poster template only.
 */
try {
  const { Font } = await import("@react-pdf/renderer");
  Font.registerHyphenationCallback((word: string) => [word]);
} catch {
  // @react-pdf/renderer isn't installed, so no PDF is written in this process.
}

export {};
