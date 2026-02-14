#!/usr/bin/env python3

import argparse
import json
import math
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Tuple

from PIL import Image


IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic"}


@dataclass(frozen=True)
class PhotoFeatures:
    ahash: int
    dhash: int
    subject_rgb: Tuple[float, float, float]


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"['\"]+", "", value)
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"(^-|-$)+", "", value)
    return value or "x"


def hamming(a: int, b: int) -> int:
    return bin(a ^ b).count("1")


def compute_ahash(path: Path, hash_size: int = 8) -> int:
    img = Image.open(path).convert("L").resize(
        (hash_size, hash_size), Image.Resampling.LANCZOS
    )
    pixels = list(img.getdata())
    avg = sum(pixels) / len(pixels)
    v = 0
    for p in pixels:
        v = (v << 1) | (1 if p > avg else 0)
    return v


def compute_dhash(path: Path, hash_size: int = 8) -> int:
    img = Image.open(path).convert("L").resize(
        (hash_size + 1, hash_size), Image.Resampling.LANCZOS
    )
    pixels = list(img.getdata())
    v = 0
    for row in range(hash_size):
        row_start = row * (hash_size + 1)
        for col in range(hash_size):
            left = pixels[row_start + col]
            right = pixels[row_start + col + 1]
            v = (v << 1) | (1 if left > right else 0)
    return v


def subject_average_rgb(
    path: Path, resize: int = 220, margin: int = 12, bg_threshold: float = 28.0
) -> Tuple[float, float, float]:
    img = Image.open(path).convert("RGB").resize(
        (resize, resize), Image.Resampling.LANCZOS
    )
    w, h = img.size
    px = img.load()

    border: List[Tuple[int, int, int]] = []
    for x in range(w):
        for y in range(margin):
            border.append(px[x, y])
            border.append(px[x, h - 1 - y])
    for y in range(h):
        for x in range(margin):
            border.append(px[x, y])
            border.append(px[w - 1 - x, y])

    br = sum(p[0] for p in border) / len(border)
    bg = sum(p[1] for p in border) / len(border)
    bb = sum(p[2] for p in border) / len(border)

    subject: List[Tuple[int, int, int]] = []
    for x in range(w):
        for y in range(h):
            r, g, b = px[x, y]
            d = math.sqrt((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2)
            if d > bg_threshold:
                subject.append((r, g, b))

    if len(subject) < w * h * 0.05:
        subject = [px[x, y] for x in range(w) for y in range(h)]

    r = sum(p[0] for p in subject) / len(subject)
    g = sum(p[1] for p in subject) / len(subject)
    b = sum(p[2] for p in subject) / len(subject)
    return (r, g, b)


def rgb_distance(a: Tuple[float, float, float], b: Tuple[float, float, float]) -> float:
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)


def rgb_to_hex(rgb: Tuple[float, float, float]) -> str:
    r, g, b = (max(0, min(255, int(round(c)))) for c in rgb)
    return f"#{r:02x}{g:02x}{b:02x}"


def guess_color_name(rgb: Tuple[float, float, float]) -> str:
    # Simple HSV heuristics without extra deps.
    r, g, b = [c / 255.0 for c in rgb]
    mx = max(r, g, b)
    mn = min(r, g, b)
    diff = mx - mn
    v = mx
    s = 0.0 if mx == 0 else diff / mx

    if diff == 0:
        h = 0.0
    elif mx == r:
        h = ((g - b) / diff) % 6
    elif mx == g:
        h = (b - r) / diff + 2
    else:
        h = (r - g) / diff + 4
    h = h * 60.0

    if v < 0.18:
        return "Noir"
    if s < 0.10 and v > 0.90:
        return "Blanc"
    if s < 0.14:
        return "Gris"

    # beige / brown-ish
    if 20 <= h < 70 and s < 0.35 and v > 0.60:
        return "Beige"
    if 20 <= h < 70 and v < 0.60:
        return "Marron"

    if h < 20 or h >= 340:
        return "Rouge"
    if 20 <= h < 45:
        return "Orange"
    if 45 <= h < 70:
        return "Jaune"
    if 70 <= h < 170:
        return "Vert"
    if 170 <= h < 255:
        return "Bleu"
    if 255 <= h < 290:
        return "Violet"
    if 290 <= h < 340:
        return "Rose"
    return "Couleur"


class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra


def iter_images(source: Path, ignore_prefixes: Iterable[Path]) -> List[Path]:
    ignores = [p.resolve() for p in ignore_prefixes]

    def is_ignored(path: Path) -> bool:
        try:
            resolved = path.resolve()
        except Exception:
            return True
        for ig in ignores:
            if str(resolved).startswith(str(ig) + "/") or resolved == ig:
                return True
        return False

    images: List[Path] = []
    for p in source.rglob("*"):
        if not p.is_file():
            continue
        if p.suffix.lower() not in IMAGE_EXTS:
            continue
        if is_ignored(p):
            continue
        images.append(p)
    return sorted(images, key=lambda p: str(p))


def build_product_clusters(
    images: List[Path], features: Dict[Path, PhotoFeatures], sim_threshold: int
) -> List[List[Path]]:
    uf = UnionFind(len(images))
    for i in range(len(images)):
        for j in range(i + 1, len(images)):
            a = features[images[i]]
            b = features[images[j]]
            d = hamming(a.ahash, b.ahash) + hamming(a.dhash, b.dhash)
            if d <= sim_threshold:
                uf.union(i, j)

    clusters: Dict[int, List[Path]] = {}
    for idx, path in enumerate(images):
        root = uf.find(idx)
        clusters.setdefault(root, []).append(path)

    return sorted(
        (sorted(c, key=lambda p: str(p)) for c in clusters.values()),
        key=lambda c: (-len(c), str(c[0])),
    )


def attach_small_clusters(
    clusters: List[List[Path]],
    features: Dict[Path, PhotoFeatures],
    min_size: int,
    attach_threshold: int,
    keep_unattached: bool,
) -> List[List[Path]]:
    big = [c for c in clusters if len(c) >= min_size]
    small = [c for c in clusters if len(c) < min_size]

    if not small:
        return big

    def distance(a: Path, b: Path) -> int:
        fa = features[a]
        fb = features[b]
        return hamming(fa.ahash, fb.ahash) + hamming(fa.dhash, fb.dhash)

    # Attach each image from small clusters to the nearest big cluster if close enough.
    for sc in small:
        for img in sc:
            best_cluster: Optional[List[Path]] = None
            best_distance = 10**9
            for bc in big:
                # Compare to a few representatives for speed (first 6).
                for rep in bc[:6]:
                    d = distance(img, rep)
                    if d < best_distance:
                        best_distance = d
                        best_cluster = bc

            if best_cluster is not None and best_distance <= attach_threshold:
                best_cluster.append(img)
            elif keep_unattached:
                big.append([img])

    return sorted(
        (sorted(c, key=lambda p: str(p)) for c in big),
        key=lambda c: (-len(c), str(c[0])),
    )


def split_variants_by_color(
    cluster: List[Path],
    features: Dict[Path, PhotoFeatures],
    color_threshold: float,
) -> List[List[Path]]:
    uf = UnionFind(len(cluster))
    rgbs = [features[p].subject_rgb for p in cluster]

    for i in range(len(cluster)):
        for j in range(i + 1, len(cluster)):
            if rgb_distance(rgbs[i], rgbs[j]) <= color_threshold:
                uf.union(i, j)

    parts: Dict[int, List[Path]] = {}
    for idx, path in enumerate(cluster):
        root = uf.find(idx)
        parts.setdefault(root, []).append(path)

    return sorted(
        (sorted(p, key=lambda x: str(x)) for p in parts.values()),
        key=lambda p: (-len(p), str(p[0])),
    )


def guess_category(path: Path) -> str:
    parts = [p.lower() for p in path.parts]
    if any(p in {"ensembles", "ensemble", "sets", "set"} for p in parts):
        return "SET"
    if any(p in {"hoodies", "hoodie"} for p in parts):
        return "HOODIE"
    return "HOODIE"


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Group photos into products (similarity) and variants (color), and copy them into public/."
    )
    parser.add_argument("--source", type=str, default="..", help="Source folder")
    parser.add_argument(
        "--dest",
        type=str,
        default="./public/products/imported",
        help="Destination folder (under the Next.js project)",
    )
    parser.add_argument(
        "--report",
        type=str,
        default="./import/photos-report.json",
        help="Report JSON output path",
    )
    parser.add_argument("--sim-th", type=int, default=18, help="Similarity threshold")
    parser.add_argument(
        "--color-th",
        type=float,
        default=45.0,
        help="Color clustering threshold (RGB distance)",
    )
    parser.add_argument(
        "--min-product-images",
        type=int,
        default=2,
        help="Minimum images to consider a product cluster",
    )
    parser.add_argument(
        "--attach-th",
        type=int,
        default=None,
        help="Attach small clusters if nearest distance <= attach-th (default sim-th + 2)",
    )
    parser.add_argument(
        "--keep-unattached-singletons",
        action="store_true",
        help="Keep single images as products when not attachable",
    )
    parser.add_argument(
        "--clean",
        action="store_true",
        help="Delete destination folder before copying",
    )
    parser.add_argument("--dry-run", action="store_true", help="No file copies")
    args = parser.parse_args()

    project_root = Path(__file__).resolve().parents[1]
    source = (project_root / args.source).resolve()
    dest = (project_root / args.dest).resolve()
    report_path = (project_root / args.report).resolve()

    ignore_prefixes = [
        project_root / ".next",
        project_root / "node_modules",
        project_root / "public",
        dest,
    ]

    images = iter_images(source, ignore_prefixes=ignore_prefixes)
    if not images:
        print("No images found.")
        return 0

    features: Dict[Path, PhotoFeatures] = {}
    for p in images:
        try:
            ah = compute_ahash(p)
            dh = compute_dhash(p)
            rgb = subject_average_rgb(p)
            features[p] = PhotoFeatures(ahash=ah, dhash=dh, subject_rgb=rgb)
        except Exception as e:
            print(f"Skip {p}: {e}")

    images = [p for p in images if p in features]
    product_clusters = build_product_clusters(images, features, sim_threshold=args.sim_th)
    attach_th = args.attach_th if args.attach_th is not None else args.sim_th + 2
    product_clusters = attach_small_clusters(
        product_clusters,
        features,
        min_size=args.min_product_images,
        attach_threshold=attach_th,
        keep_unattached=args.keep_unattached_singletons,
    )

    dest.mkdir(parents=True, exist_ok=True)
    report_path.parent.mkdir(parents=True, exist_ok=True)

    if args.clean and not args.dry_run and dest.exists():
        shutil.rmtree(dest)
        dest.mkdir(parents=True, exist_ok=True)

    products_out = []
    product_index = {"HOODIE": 0, "SET": 0}

    for cluster in product_clusters:
        categories = [guess_category(p.relative_to(source)) for p in cluster]
        category = max(set(categories), key=categories.count)

        product_index[category] += 1
        product_slug = f"import-{category.lower()}-{product_index[category]:02d}"

        variant_parts = split_variants_by_color(
            cluster, features, color_threshold=args.color_th
        )

        used_color_slugs: Dict[str, int] = {}
        used_color_names: Dict[str, int] = {}
        variants_out = []
        for part in variant_parts:
            avg_rgb = (
                sum(features[p].subject_rgb[0] for p in part) / len(part),
                sum(features[p].subject_rgb[1] for p in part) / len(part),
                sum(features[p].subject_rgb[2] for p in part) / len(part),
            )
            base_color_name = guess_color_name(avg_rgb)
            used_color_names[base_color_name] = used_color_names.get(base_color_name, 0) + 1
            color_name = (
                base_color_name
                if used_color_names[base_color_name] == 1
                else f"{base_color_name} {used_color_names[base_color_name]}"
            )
            color_hex = rgb_to_hex(avg_rgb)
            base_color_slug = slugify(base_color_name)
            used_color_slugs[base_color_slug] = used_color_slugs.get(base_color_slug, 0) + 1
            color_slug = (
                base_color_slug
                if used_color_slugs[base_color_slug] == 1
                else f"{base_color_slug}-{used_color_slugs[base_color_slug]}"
            )

            images_out = []
            for idx, src_path in enumerate(sorted(part, key=lambda p: str(p))):
                ext = src_path.suffix.lower()
                if ext == ".jpeg":
                    ext = ".jpg"
                if ext not in {".jpg", ".png", ".webp"}:
                    ext = ".jpg"

                dest_rel = Path(product_slug) / color_slug / f"{idx+1:02d}{ext}"
                dest_path = dest / dest_rel
                url = "/products/imported/" + str(dest_rel).replace("\\", "/")

                if not args.dry_run:
                    dest_path.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src_path, dest_path)

                images_out.append(
                    {
                        "source": str(src_path),
                        "dest": str(dest_path),
                        "url": url,
                    }
                )

            variants_out.append(
                {
                    "colorName": color_name,
                    "colorHex": color_hex,
                    "colorSlug": color_slug,
                    "images": images_out,
                }
            )

        products_out.append(
            {
                "slug": product_slug,
                "category": category,
                "sourceCount": len(cluster),
                "variants": variants_out,
            }
        )

    report = {
        "source": str(source),
        "dest": str(dest),
        "simThreshold": args.sim_th,
        "colorThreshold": args.color_th,
        "productCount": len(products_out),
        "products": products_out,
    }

    if not args.dry_run:
        report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(f"Wrote report: {report_path}")
    else:
        print(json.dumps(report, indent=2))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
