# Regenerate: python3 brand/source/build-logo.py brand
# Datum "Continuum" mark, refined from the user's drawing: two concentric D's (stroke 24, gap 16, one centre),
# true circular arcs, the amber 24×24 datum square at the start of the inner line.
import sys
INK, AMB = "#0C1A2B", "#F2B233"
t, g = 24, 16
# Mark in its own box: left edge x=0, top y=0. Outer D: height 152 → outer radius 76; centre (cx, 76).
R1 = 76; r1 = R1 - t; R2 = r1 - g; r2 = R2 - t          # 76, 52, 36, 12
cx, cy = 64, 76                                          # arms run from x=0 to the centre, then arc
def dshape(R, r):
    # filled D ring: outer arm top from x=0, arc to bottom, back along the inner edge
    return (f"M0 {cy-R}H{cx}A{R} {R} 0 0 1 {cx} {cy+R}H0V{cy+r}H{cx}A{r} {r} 0 0 0 {cx} {cy-r}H0Z")
MARK = f'<path fill="{{ink}}" d="{dshape(R1, r1)}"/><path fill="{{ink}}" d="{dshape(R2, r2)}"/><path fill="{AMB}" d="M0 {cy+r2}h{t}v{t}H0z"/>'
MW, MH = cx + R1, 2 * R1                                 # 140 × 152
# Wordmark letters (the user's construction, stroke 14, cap height 72), optically spaced.
L = {
 "D": (64, "M0 0H28C51 0 64 13 64 36S51 72 28 72H0ZM14 13V59H27C42 59 50 51 50 36S42 13 27 13Z"),
 "A": (68, "M0 72L26 0H42L68 72H53L47 54H21L15 72ZM25 41H43L34 14Z"),
 "T": (62, "M0 0H62V13H38V72H24V13H0Z"),
 "U": (60, "M0 0H14V43C14 55 20 60 30 60S46 55 46 43V0H60V44C60 63 49 74 30 74S0 63 0 44Z"),
 "M": (76, "M0 72V0H17L38 43 59 0H76V72H62V24L43 62H33L14 24V72Z"),
}
KERN = {("D","A"): 10, ("A","T"): 6, ("T","U"): 16, ("U","M"): 16}   # gaps after each letter
def word(ink):
    x, out = 0, []
    seq = "DATUM"
    for i, ch in enumerate(seq):
        w, d = L[ch]
        out.append(f'<path transform="translate({x} 0)" fill="{ink}" fill-rule="evenodd" d="{d}"/>')
        x += w + (KERN.get((ch, seq[i+1]), 0) if i < 4 else 0)
    return "".join(out), x
def mark_svg(ink, pad=0):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-pad} {-pad} {MW+2*pad} {MH+2*pad}" width="{MW+2*pad}" height="{MH+2*pad}" role="img"><title>Datum</title>{MARK.format(ink=ink)}</svg>\n'
def lockup_svg(ink):
    w, ww = word(ink)
    s = 0.5                                              # mark at half size: 70 × 76
    mh = MH * s; wy = (mh - 72 * .82) / 2
    gap = 30
    W = MW * s + gap + ww * .82
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {mh:.0f}" width="{W:.0f}" height="{mh:.0f}" role="img"><title>Datum</title>'
            f'<g transform="scale({s})">{MARK.format(ink=ink)}</g><g transform="translate({MW*s+gap} {wy:.1f}) scale(.82)">{w}</g></svg>\n')
def icon_svg():
    s = 1.05; ox = (256 - MW * s) / 2 + 4; oy = (256 - MH * s) / 2
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img"><title>Datum</title>'
            '<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#E2E6EC"/></linearGradient></defs>'
            '<rect x="8" y="8" width="240" height="240" rx="56" fill="url(#bg)" stroke="#C9D0DA" stroke-width="4"/>'
            f'<g transform="translate({ox:.1f} {oy:.1f}) scale({s})">{MARK.format(ink=INK)}</g></svg>\n')
out = sys.argv[1] if len(sys.argv) > 1 else "."
open(f"{out}/datum-mark.svg","w").write(mark_svg(INK))
open(f"{out}/datum-mark-light.svg","w").write(mark_svg("#E6EDF5"))
open(f"{out}/datum-logo.svg","w").write(lockup_svg(INK))
open(f"{out}/datum-logo-light.svg","w").write(lockup_svg("#E6EDF5"))
open(f"{out}/datum-icon.svg","w").write(icon_svg())
# Paths for the site component (currentColor)
w, ww = word("currentColor")
open(f"{out}/parts.txt","w").write(f"MARK={MARK.format(ink='currentColor')}\nMW={MW} MH={MH}\nWORD={w}\nWW={ww}\n")
print("mark", MW, MH, "word", ww)
