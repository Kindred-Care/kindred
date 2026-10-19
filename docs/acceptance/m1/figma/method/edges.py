"""Field and label edges (pt) for a Log In capture: field border box and label ink box per row."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import measure
path, scale = sys.argv[1], float(sys.argv[2])
w, h, px = measure.load(path)
bg = px(int(5 * scale), int(300 * scale))
def grey(c): return all(abs(v - 118) < 18 for v in c)
def dark(c): return max(c) < 160
out = []
for name, (y0, y1) in {'username': (320, 386), 'password': (386, 450)}.items():
    Y0, Y1 = int(y0 * scale), int(y1 * scale)
    # field: grey border pixels right of the label column
    pts = [(x, y) for y in range(Y0, Y1, 1) for x in range(int(160 * scale), w, 1) if grey(px(x, y))]
    fx0 = min(p[0] for p in pts); fx1 = max(p[0] for p in pts) + 1
    fy0 = min(p[1] for p in pts); fy1 = max(p[1] for p in pts) + 1
    lab = [(x, y) for y in range(Y0, Y1) for x in range(0, fx0 - 2) if dark(px(x, y))]
    lx0 = min(p[0] for p in lab); lx1 = max(p[0] for p in lab) + 1
    ly0 = min(p[1] for p in lab); ly1 = max(p[1] for p in lab) + 1
    f = lambda v: round(v / scale, 1)
    print(f'{name}: field x {f(fx0)}-{f(fx1)} y {f(fy0)}-{f(fy1)} (w {f(fx1 - fx0)}, h {f(fy1 - fy0)}); label ink x {f(lx0)}-{f(lx1)} y {f(ly0)}-{f(ly1)}')
