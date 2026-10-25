# Datum brand

The family's brand is one mark, one wordmark and two colours. The app icons (`datum-plan-icon.svg` …) follow FAMILY §5 and keep their own accents; the Datum brand itself never uses an app colour, so it stays right however many apps the family has.

## The mark: "Continuum"

![Datum logo](datum-logo.svg)

Designed by Edgar Mendonca (original drawing: [`source/datum-continuum-original.svg`](source/datum-continuum-original.svg)); refined for exact geometry in session 4.

- **Idea:** a D drawn as one continuous line folded twice: an outer D wrapping an inner D. The **amber square** is the *datum*, the reference point where the line starts and every measurement is taken from.
- **Construction** (mark box 140 × 152 units): stroke **24**, gap **16**, both D's on **one centre** (64, 76) with true circular arcs: outer radii 76 / 52, inner radii 36 / 12. The datum square is **24 × 24** at the start of the inner line's lower arm (0, 88).
- **Wordmark:** "DATUM" in its own geometric letters (stroke 14, cap height 72), optically spaced. In the horizontal logo the mark is drawn at half size and the wordmark at 0.82, with a gap of 30 between them.
- Regenerate every file from the construction: `python3 brand/source/build-logo.py brand`.

## Files

| File | Use |
| --- | --- |
| `datum-logo.svg` | Horizontal logo (mark + wordmark), navy: README, documents, light backgrounds |
| `datum-logo-light.svg` | The same in light ink `#E6EDF5`, for dark backgrounds |
| `datum-mark.svg` / `datum-mark-light.svg` | The mark alone: avatars, small spaces, social images |
| `datum-icon.svg` | The mark on the family tile (FAMILY §5): favicon, app-style icon |
| `source/` | The original drawing and the generator |

On the website the mark and logo are components (`site/src/components/Mark.astro`, `Logo.astro`) drawn in `currentColor`, so they follow the theme; the datum square is always amber.

## Colours

| | Hex | Use |
| --- | --- | --- |
| Navy ink | `#0C1A2B` | The mark and wordmark on light backgrounds; text |
| Light ink | `#E6EDF5` | The mark and wordmark on dark backgrounds |
| Datum amber | `#F2B233` | The datum square only (and the family's amber marks in the apps) |
| Paper | `#F2F1EE` | Light background of the site |
| Night | `#0B1119` | Dark background of the site |

## Rules

- **Clear space:** at least one stroke width (the size of the datum square) on every side.
- **Minimum size:** the mark 16 px high; the horizontal logo 96 px wide.
- **Do:** use the files as they are; navy or light ink only; keep the square amber.
- **Don't:** recolour the D's in an app accent or a gradient; outline, shadow, rotate or stretch the mark; move or resize the datum square; set "DATUM" in another typeface next to the mark.
- **Type around the brand:** IBM Plex Sans for text and headings, IBM Plex Mono for labels and numbers (the apps' typefaces, FAMILY §4).
