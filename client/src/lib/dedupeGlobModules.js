// Some folders (e.g. src/assets/gallery) contain both an original image and a
// "<name>_result.webp" companion (same photo, smaller format). A raw
// import.meta.glob(..., { eager: true }) over all extensions would return
// both as separate images. This collapses each pair down to one entry,
// preferring the .webp version when present, and keeps the original when no
// webp counterpart exists.
export function dedupeGlobModules(modules) {
  const byKey = new Map();
  for (const [path, mod] of Object.entries(modules)) {
    const filename = path.split('/').pop();
    const isWebp = /\.webp$/i.test(filename);
    // Filenames can contain dots outside the extension (e.g. WhatsApp's
    // "...00.17.17.jpeg"), so only strip the known "_result.webp" suffix as a
    // whole — don't re-run a generic "strip after last dot" on top of it, or
    // it eats into the base name.
    const key = /_result\.webp$/i.test(filename)
      ? filename.replace(/_result\.webp$/i, '')
      : filename.replace(/\.[^.]+$/, '');
    const existing = byKey.get(key);
    if (!existing || (isWebp && !existing.isWebp)) {
      byKey.set(key, { mod, isWebp });
    }
  }
  return Array.from(byKey.values()).map(({ mod }) => mod.default).filter(Boolean);
}
