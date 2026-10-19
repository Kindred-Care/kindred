"""Side-by-side comparison: Figma frame | build capture (scaled to 1x) | 50% overlay, as one PNG.

usage: python compose.py <figma.png> <capture.png> <capture_scale> <out.png>
The overlay aligns both images at the top-left; for a 390 pt capture against the 402 pt frame, the
overlay is shifted right by 6 pt so centred elements line up (right-anchored ones then sit 6 pt left).
"""
import struct
import sys
import zlib
import os

sys.path.insert(0, os.path.dirname(__file__))
import measure


def to_rgb(path, scale):
    w, h, px = measure.load(path)
    s = int(scale)
    W, H = w // s, h // s
    img = []
    for y in range(H):
        row = []
        for x in range(W):
            acc = [0, 0, 0]
            for dy in range(s):
                for dx in range(s):
                    c = px(x * s + dx, y * s + dy)
                    acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]
            n = s * s
            row.append((acc[0] // n, acc[1] // n, acc[2] // n))
        img.append(row)
    return W, H, img


def write_png(path, W, H, img):
    raw = b''.join(b'\x00' + bytes(v for c in row for v in c) for row in img)
    def chunk(t, d):
        return struct.pack('>I', len(d)) + t + d + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    png = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', W, H, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')
    open(path, 'wb').write(png)


def main(figma, capture, scale, out):
    fw, fh, f = to_rgb(figma, 1)
    cw, ch, c = to_rgb(capture, float(scale))
    gap = 16
    shift = (fw - cw) // 2
    W = fw + gap + cw + gap + fw
    H = max(fh, ch)
    sep = (200, 200, 200)
    blank = (255, 255, 255)
    img = []
    for y in range(H):
        row = []
        row += f[y] if y < fh else [blank] * fw
        row += [sep] * gap
        row += c[y] if y < ch else [blank] * cw
        row += [sep] * gap
        for x in range(fw):
            a = f[y][x] if y < fh else blank
            cx = x - shift
            b = c[y][cx] if (y < ch and 0 <= cx < cw) else blank
            row.append(tuple((a[i] + b[i]) // 2 for i in range(3)))
        img.append(row)
    write_png(out, W, H, img)
    print('wrote', out, W, 'x', H)


if __name__ == '__main__':
    main(*sys.argv[1:5])
