#!/usr/bin/env python3
import os
import sys
import json
from PIL import Image

# Usage: resources/gen_assets_ios.py resources/icon.png ios/App/App/Assets.xcasset

# Configurazione delle icone – tutti i formati per iPhone e iPad, inclusi Spotlight
# Non è incluso alcun campo role: Xcode riconosce Spotlight dagli slot dedicati
ICON_SPECS = [
    # iPhone App Icons base
    {"idiom": "iphone", "size": "20x20",   "scale": "2x"},
    {"idiom": "iphone", "size": "20x20",   "scale": "3x"},
    {"idiom": "iphone", "size": "29x29",   "scale": "1x"},
    {"idiom": "iphone", "size": "29x29",   "scale": "2x"},
    {"idiom": "iphone", "size": "29x29",   "scale": "3x"},
    # Spotlight (40pt) per iPhone
    {"idiom": "iphone", "size": "40x40",   "scale": "2x"},
    {"idiom": "iphone", "size": "40x40",   "scale": "3x"},
    {"idiom": "iphone", "size": "60x60",   "scale": "2x"},
    {"idiom": "iphone", "size": "60x60",   "scale": "3x"},
    # iPad App Icons
    {"idiom": "ipad",   "size": "20x20",   "scale": "1x"},
    {"idiom": "ipad",   "size": "20x20",   "scale": "2x"},
    {"idiom": "ipad",   "size": "29x29",   "scale": "1x"},
    {"idiom": "ipad",   "size": "29x29",   "scale": "2x"},
    {"idiom": "ipad",   "size": "40x40",   "scale": "1x"},
    {"idiom": "ipad",   "size": "40x40",   "scale": "2x"},
    {"idiom": "ipad",   "size": "76x76",   "scale": "1x"},
    {"idiom": "ipad",   "size": "76x76",   "scale": "2x"},
    {"idiom": "ipad",   "size": "83.5x83.5","scale": "2x"},
    # App Store
    {"idiom": "ios-marketing", "size": "1024x1024", "scale": "1x"}
]

# Configurazione delle splash screen – dimensioni e orientamento
SPLASH_SPECS = [
    {"idiom": "iphone", "size": "320x480", "scale": "1x", "orientation": "portrait", "filename": "Splash-320x480.png"},
    {"idiom": "iphone", "size": "320x480", "scale": "2x", "orientation": "portrait", "filename": "Splash-640x960.png"},
    {"idiom": "iphone", "size": "320x480", "scale": "3x", "orientation": "portrait", "filename": "Splash-960x1440.png"},
    {"idiom": "ipad",   "size": "768x1024", "scale": "1x", "orientation": "portrait", "filename": "Splash-768x1024.png"},
    {"idiom": "ipad",   "size": "768x1024", "scale": "2x", "orientation": "portrait", "filename": "Splash-1536x2048.png"}
]

# Percentuale di riduzione dell'icona sul canvas splash
SHRINK_RATIO = 0.6  # 60% delle dimensioni minori della splash


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def make_icon_set(src_icon, dst_folder):
    folder = os.path.join(dst_folder, "AppIcon.appiconset")
    ensure_dir(folder)
    images = []
    base = Image.open(src_icon)
    for spec in ICON_SPECS:
        w_pt, h_pt = map(float, spec["size"].split("x"))
        scale_factor = int(spec["scale"].replace("x", ""))
        w_px = int(w_pt * scale_factor)
        h_px = int(h_pt * scale_factor)
        filename = f"AppIcon-{int(w_pt)}x{int(h_pt)}@{scale_factor}x.png"
        icon = base.resize((w_px, h_px), Image.LANCZOS)
        icon.save(os.path.join(folder, filename), format="PNG")
        # Crea entry con ordine: filename, idiom, scale, size
        entry = {
            "filename": filename,
            "idiom": spec["idiom"],
            "scale": spec["scale"],
            "size": spec["size"]
        }
        images.append(entry)
    info = {"version": 1, "author": "xcode"}
    with open(os.path.join(folder, "Contents.json"), "w") as f:
        json.dump({"images": images, "info": info}, f, indent=2)


def make_splash_set(src_icon, dst_folder):
    folder = os.path.join(dst_folder, "Splash.imageset")
    ensure_dir(folder)
    images = []
    base_icon = Image.open(src_icon).convert("RGBA")
    bg_color = base_icon.getpixel((0, 0))[:3]
    for spec in SPLASH_SPECS:
        w_pt, h_pt = map(float, spec["size"].split("x"))
        scale_factor = int(spec["scale"].replace("x", ""))
        w_px = int(w_pt * scale_factor)
        h_px = int(h_pt * scale_factor)
        filename = spec["filename"]
        canvas = Image.new("RGBA", (w_px, h_px), bg_color)
        # ridimensiona mantenendo proporzioni secondo SHRINK_RATIO
        icon_size = int(min(w_px, h_px) * SHRINK_RATIO)
        resized_icon = base_icon.resize((icon_size, icon_size), Image.LANCZOS)
        x = (w_px - icon_size) // 2
        y = (h_px - icon_size) // 2
        canvas.paste(resized_icon, (x, y), resized_icon)
        canvas.save(os.path.join(folder, filename), format="PNG")
        # Entry con ordine: filename, idiom, scale, size, orientation, extent
        entry = {
            "filename": filename,
            "idiom": spec["idiom"],
            "scale": spec["scale"],
            "size": spec["size"],
            "extent": "full-screen"
        }
        entry["orientation"] = spec.get("orientation")
        images.append(entry)
    info = {"version": 1, "author": "xcode"}
    with open(os.path.join(folder, "Contents.json"), "w") as f:
        json.dump({"images": images, "info": info}, f, indent=2)


def make_pwa_assets(src_icon, dst_folder):
    pwa_folder = os.path.join(dst_folder, "pwa")
    ensure_dir(pwa_folder)
    base_icon = Image.open(src_icon).convert("RGBA")

    # Icona 192x192
    resized_192 = base_icon.resize((192, 192), Image.LANCZOS)
    resized_192.save(os.path.join(pwa_folder, "icon-192x192.png"), format="PNG")

    # Splash screens vari
    splash_specs = [
        (640, 1136), (750, 1334), (828, 1792), (1125, 2436),
        (1242, 2688), (1536, 2048), (1668, 2224),
        (1668, 2388), (2048, 2732)
    ]

    bg_color = base_icon.getpixel((0, 0))[:3]
    for w, h in splash_specs:
        canvas = Image.new("RGBA", (w, h), bg_color)
        icon_size = int(min(w, h) * SHRINK_RATIO)
        resized_icon = base_icon.resize((icon_size, icon_size), Image.LANCZOS)
        x = (w - icon_size) // 2
        y = (h - icon_size) // 2
        canvas.paste(resized_icon, (x, y), resized_icon)
        filename = f"apple-splash-{w}x{h}.png"
        canvas.save(os.path.join(pwa_folder, filename), format="PNG")


def main():
    if len(sys.argv) not in (3, 4):
        print(f"Usage: {sys.argv[0]} <icon.png> [dummy] <output/Assets.xcassets>")
        sys.exit(1)
    src_icon = sys.argv[1]
    out_assets = sys.argv[3] if len(sys.argv) == 4 else sys.argv[2]
    ensure_dir(out_assets)
    make_icon_set(src_icon, out_assets)
    make_splash_set(src_icon, out_assets)
    make_pwa_assets(src_icon, out_assets)

    print("✅ Assets generati in", out_assets)

if __name__ == "__main__":
    main()
