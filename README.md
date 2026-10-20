# The VEC Letters

A static gallery containing 20 letters and 141 original scans. No build step or external dependencies.

## Preview

Run `python3 -m http.server 4173 --bind 127.0.0.1` in this directory, then open `http://127.0.0.1:4173`.

## Editing

- Introductory copy: the `.intro` section in `index.html`.
- Styling and responsive layout: `css/gallery.css`.
- Letter dates, ordered images, and image labels: `js/gallery-data.js`.
- Gallery and viewer behavior: `js/gallery.js`.
- About and Contact: `about.html` and `contact.html`.

Gallery previews cycle once per second while hovered or focused and reset when leaving. Image arrows and keyboard left/right move within the current letter. Previous/Next letter changes letters and resets to the first image. Collection always returns to the gallery.

Inspect details loads the original scan at native resolution. Use the 90° left/right buttons to rotate the scan. Scroll or drag to explore it; Fit artwork or Escape returns to the fitted view. Original scans remain in `letters/`; smaller browsing images live in `previews/`.

The original numbered letter URLs redirect to their corresponding new viewer entries.

## Original version

The complete original site is preserved locally in `backups/original-2026-10-19/` (excluded from Git; the original source also remains in Git history). Open its `index.html` to view it. Original images in this backup are filesystem hard links to the unchanged originals, saving disk space; HTML, CSS, JavaScript, and other site files are separate copies. Do not edit scans in place if you want the backup images to remain identical; replace the file instead or first make an independent image copy.

`scripts/prepare-gallery.py` is the one-time migration used to preserve the old site, capture its image ordering, and generate previews. It refuses to overwrite the existing backup.
