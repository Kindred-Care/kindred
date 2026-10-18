"""Pick the splash frame: the wordmark is drawn and the Log In button is not."""
import glob, shutil, sys, os
sys.path.insert(0, os.path.dirname(__file__))
import measure
best = None
for f in sorted(glob.glob(os.path.join(sys.argv[1], 'f*.png'))):
    w, h, px = measure.load(f)
    # wordmark band: dark ink across the middle of the screen somewhere between y 250 and 450 pt (x3)
    ink = any(measure.classify(px(x, y)) == 'ink' for y in range(900, 1300, 6) for x in range(300, 900, 6))
    button = any(measure.classify(px(x, y)) == 'button' for y in range(1300, 1700, 6) for x in range(450, 760, 6))
    if ink and not button:
        best = f
if not best:
    sys.exit('no splash frame found')
shutil.copy(best, sys.argv[2]); print('splash frame', os.path.basename(best))
