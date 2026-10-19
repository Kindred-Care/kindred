"""Measure element boxes in a Kindred screen capture (Figma export or downscaled device capture).

usage: python measure.py <png> [scale]
scale: device pixels per point (1 for a 1x Figma export, 3 for a 480 dpi capture).
Reports, in points: ink row-bands (text lines and controls) with their x extent, the button fill box and
field border boxes.
"""
import struct
import sys
import zlib


def load(path):
    d = open(path, 'rb').read()
    i = 8
    idat = b''
    while i < len(d):
        l = struct.unpack('>I', d[i:i + 4])[0]
        t = d[i + 4:i + 8]
        c = d[i + 8:i + 8 + l]
        if t == b'IHDR':
            w, h, bd, ct = struct.unpack('>IIBB', c[:10])
        if t == b'IDAT':
            idat += c
        i += 12 + l
    raw = zlib.decompress(idat)
    bpp = {6: 4, 2: 3, 0: 1, 4: 2}[ct]
    stride = w * bpp
    rows = []
    prev = bytearray(stride)
    for r in range(h):
        f = raw[r * (stride + 1)]
        line = bytearray(raw[r * (stride + 1) + 1:(r + 1) * (stride + 1)])
        for k in range(stride):
            a = line[k - bpp] if k >= bpp else 0
            b = prev[k]
            cc = prev[k - bpp] if k >= bpp else 0
            if f == 1:
                line[k] = (line[k] + a) & 255
            elif f == 2:
                line[k] = (line[k] + b) & 255
            elif f == 3:
                line[k] = (line[k] + ((a + b) >> 1)) & 255
            elif f == 4:
                p = a + b - cc
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - cc)
                line[k] = (line[k] + (a if pa <= pb and pa <= pc else (b if pb <= pc else cc))) & 255
        rows.append(bytes(line))
        prev = line

    def px(x, y):
        o = x * bpp
        r = rows[y]
        return (r[o], r[o + 1], r[o + 2]) if bpp >= 3 else (r[o],) * 3

    return w, h, px


def classify(c):
    r, g, b = c
    if abs(r - 0xA9) < 30 and abs(g - 0x4F) < 30 and abs(b - 0x32) < 30 and r > g + 40:
        return 'button'
    if max(r, g, b) < 150 and abs(r - g) < 20 and abs(g - b) < 20:
        return 'ink'
    if 100 <= r <= 200 and abs(r - g) < 12 and abs(g - b) < 12:
        return 'grey'
    return None


def main(path, scale=1.0, top=0, bottom=None):
    w, h, px = load(path)
    bottom = bottom or h
    step = 1
    bands = []
    cur = None
    for y in range(top, bottom, step):
        xs = [x for x in range(0, w, 1) if classify(px(x, y)) in ('ink', 'button', 'grey')]
        if xs:
            if cur and y - cur[1] <= 1:
                cur[1] = y
                cur[2] = min(cur[2], xs[0])
                cur[3] = max(cur[3], xs[-1])
            else:
                cur = [y, y, xs[0], xs[-1]]
                bands.append(cur)
    print(f'{path}: {w}x{h}px at {scale} px/pt -> {w / scale:.1f} x {h / scale:.1f} pt')
    for y0, y1, x0, x1 in bands:
        kinds = {}
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                k = classify(px(x, y))
                if k:
                    kinds[k] = kinds.get(k, 0) + 1
        print(f'  y {y0 / scale:7.1f}-{(y1 + 1) / scale:7.1f} (h {(y1 - y0 + 1) / scale:5.1f})  '
              f'x {x0 / scale:6.1f}-{(x1 + 1) / scale:6.1f} (w {(x1 - x0 + 1) / scale:5.1f})  {kinds}')


if __name__ == '__main__':
    main(sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 1.0)
