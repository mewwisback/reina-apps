#!/usr/bin/env python3
"""Offline Reina card renderer. Requires only Pillow and Python 3.9+."""
import argparse
import json
import os
from pathlib import Path
import sys
import tempfile

from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
SCALE = 2


def font(size, bold=False):
    return ImageFont.truetype(str(ROOT / 'fonts' / ('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf')), size * SCALE)


def fitted_text(draw, text, xy, width, size, minimum, fill, bold=False, anchor='lt'):
    for point_size in range(size, minimum - 1, -1):
        face = font(point_size, bold)
        if draw.textlength(text, font=face) <= width * SCALE:
            draw.text(tuple(v * SCALE for v in xy), text, font=face, fill=fill, anchor=anchor)
            return
    raise ValueError(f'Text does not fit: {text[:60]!r}. Shorten this field.')


def effect_lines(text, face, width):
    lines = []
    for paragraph in text.split('\n'):
        line = ''
        for word in paragraph.split():
            if face.getlength(word) > width:
                return None
            candidate = (line + ' ' + word).strip()
            if face.getlength(candidate) > width:
                lines.append(line)
                line = word
            else:
                line = candidate
        lines.append(line)
    return lines


def render(config):
    with Image.open(config['artwork']) as source:
        art = ImageOps.exif_transpose(source).convert('RGBA')
    width, height = art.size
    ratio = max(666 / width, 564 / height)
    crop_width, crop_height = 666 / ratio, 564 / ratio
    fx, fy = config.get('crop_focus', [0.5, 0.5])
    left = max(0, min(width - crop_width, fx * width - crop_width / 2))
    top = max(0, min(height - crop_height, fy * height - crop_height / 2))
    art = art.resize((1332, 1128), Image.Resampling.LANCZOS, box=(left, top, left + crop_width, top + crop_height))
    card = Image.new('RGBA', (1500, 2100))
    card.paste(art, (84, 304))
    with Image.open(ROOT / 'assets/frame-clean.png') as frame:
        card.alpha_composite(frame.convert('RGBA'))
    draw = ImageDraw.Draw(card)
    role = config.get('role', '')
    subtitle = config['type'] + (' / ' + role if role else '')
    fitted_text(draw, subtitle, (62, 61), 550, 14, 12, '#c3919c')
    fitted_text(draw, config['name'], (59, 87), 555, 39, 24, '#f5f1e8', True)
    # Cover the original short rarity divider; labels may be wider than EPIC.
    draw.rectangle((110, 1486, 1380, 1540), fill='#171118')
    fitted_text(draw, config['rarity'], (62, 751), 620, 14, 12, '#e8b45c')
    fitted_text(draw, config['effect_title'], (62, 788), 626, 24, 18, '#f5f1e8', True)
    for size in range(20, 15, -1):
        face = font(size)
        lines = effect_lines(config['effect'], face, 626 * SCALE)
        line_height = (size + 5) * SCALE
        if lines is not None and len(lines) * line_height <= 78 * SCALE:
            for index, line in enumerate(lines):
                draw.text((124, 1652 + index * line_height), line, font=face, fill='#d1c1c4', anchor='lt')
            break
    else:
        raise ValueError('effect does not fit at minimum 16px. Shorten effect text (up to 3 short lines).')
    fitted_text(draw, 'ATK', (64, 958), 80, 15, 15, '#dd7b87')
    fitted_text(draw, str(config['atk']), (330, 949), 180, 34, 24, '#f5f1e8', True, 'rt')
    fitted_text(draw, 'DEF', (398, 958), 80, 15, 15, '#b7b0c3')
    fitted_text(draw, str(config['def']), (685, 949), 180, 34, 24, '#f5f1e8', True, 'rt')
    fitted_text(draw, 'R E I N A', (375, 1003), 200, 12, 12, '#b07783', anchor='mt')
    return card.resize((750, 1050), Image.Resampling.LANCZOS)


def validate(config, directory):
    if not isinstance(config, dict):
        raise ValueError('Config must be a JSON object.')
    fields = {'name', 'type', 'role', 'rarity', 'effect_title', 'effect', 'atk', 'def', 'artwork', 'crop_focus'}
    unknown = set(config) - fields
    if unknown:
        raise ValueError(f'Unknown fields: {", ".join(sorted(unknown))}')
    for key in ('name', 'type', 'rarity', 'effect_title', 'effect', 'artwork', 'role'):
        value = config.get(key, '' if key == 'role' else None)
        if not isinstance(value, str) or (key != 'role' and not value.strip()):
            raise ValueError(f'{key} must be a nonempty string (role may be empty).')
        if any(ord(c) < 32 and not (key == 'effect' and c == '\n') for c in value):
            raise ValueError(f'{key} contains unsupported control characters.')
        if len(value) > (4000 if key in ('effect', 'artwork') else 100):
            raise ValueError(f'{key} is too long; shorten this field.')
        config[key] = value.strip()
    for key in ('atk', 'def'):
        value = config.get(key)
        if type(value) is not int or not 0 <= value <= 999999:
            raise ValueError(f'{key} must be an integer from 0 to 999999.')
    focus = config.get('crop_focus', [0.5, 0.5])
    if not isinstance(focus, list) or len(focus) != 2 or any(type(v) not in (int, float) or not 0 <= v <= 1 for v in focus):
        raise ValueError('crop_focus must be [x, y], finite numbers from 0 to 1.')
    artwork = (directory / config['artwork']).resolve()
    if not artwork.is_file():
        raise ValueError(f'artwork file not found: {artwork}')
    config['artwork'] = str(artwork)
    return config


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', required=True, type=Path, help='UTF-8 JSON card file')
    parser.add_argument('--output', required=True, type=Path, help='PNG destination')
    args = parser.parse_args()
    try:
        if args.output.suffix.lower() != '.png':
            raise ValueError('output must have a .png extension.')
        config = json.loads(args.config.read_text(encoding='utf-8'))
        config = validate(config, args.config.resolve().parent)
        output = args.output.resolve()
        protected = [args.config.resolve(), Path(config['artwork']), Path(__file__).resolve()]
        protected += list((ROOT / 'assets').iterdir()) + list((ROOT / 'fonts').iterdir())
        if output in protected:
            raise ValueError('output must not overwrite config, artwork, script, fonts or frame assets.')
        card = render(config)
        output.parent.mkdir(parents=True, exist_ok=True)
        temporary = None
        try:
            with tempfile.NamedTemporaryFile(dir=output.parent, suffix='.png', delete=False) as handle:
                temporary = Path(handle.name)
            card.save(temporary, format='PNG')
            os.replace(temporary, output)
        finally:
            if temporary is not None:
                temporary.unlink(missing_ok=True)
    except (ValueError, OSError, KeyError, Image.DecompressionBombError) as exc:
        parser.exit(2, f'Error: {exc}\n')
    print(f'Saved {args.output.resolve()} (750x1050 PNG)')


if __name__ == '__main__':
    main()
