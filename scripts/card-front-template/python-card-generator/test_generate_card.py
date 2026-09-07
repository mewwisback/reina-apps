import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from PIL import Image

ROOT = Path(__file__).resolve().parent

class CardTests(unittest.TestCase):
    def run_card(self, changes=None):
        config = json.loads((ROOT / 'examples/haku.json').read_text())
        config['artwork'] = str(ROOT / 'examples/haku.jpg')
        config.update(changes or {})
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        path = Path(folder.name)
        (path / 'card.json').write_text(json.dumps(config))
        result = subprocess.run([sys.executable, str(ROOT / 'generate_card.py'), '--config', str(path / 'card.json'), '--output', str(path / 'card.png')], capture_output=True, text=True)
        return result, path / 'card.png'

    def test_footer_glyphs_inside_inner_frame_safe_region(self):
        from unittest.mock import patch
        from PIL import ImageDraw
        import generate_card
        config = generate_card.validate(json.loads((ROOT / 'examples/haku.json').read_text()), ROOT / 'examples')
        original = ImageDraw.ImageDraw.text
        bounds = []

        def record(draw, xy, text, *args, **kwargs):
            if text == 'R E I N A':
                bounds.append(draw.textbbox(xy, text, font=kwargs['font'], anchor=kwargs['anchor']))
            return original(draw, xy, text, *args, **kwargs)

        with patch.object(ImageDraw.ImageDraw, 'text', record):
            generate_card.render(config)
        self.assertEqual(len(bounds), 1)
        left, top, right, bottom = (value / generate_card.SCALE for value in bounds[0])
        self.assertGreaterEqual(left, 57)
        self.assertLessEqual(right, 693)
        self.assertGreaterEqual(top, 1001)  # 4px below stats panel
        self.assertLessEqual(bottom, 1014)  # 4px inside inner frame at y=1018

    def test_five_roster_assets_match_manifest(self):
        import hashlib
        import generate_card
        manifest = json.loads((ROOT / 'roster-manifest.json').read_text())
        self.assertEqual({h['id'] for h in manifest['heroes']}, {'haku', 'rei', 'sora', 'koma', 'yui'})
        self.assertEqual(manifest['review_status'], 'PROPOSED_VISUAL_ROSTER_METADATA')
        for hero in manifest['heroes']:
            with self.subTest(hero=hero['id']):
                path = ROOT / hero['config']
                config = json.loads(path.read_text())
                for field in ('role', 'rarity', 'atk', 'def'):
                    self.assertEqual(config[field], hero[field])
                self.assertEqual(config['effect_title'], 'ROSTER PROFILE')
                self.assertEqual(config['effect'], hero['profile'])
                self.assertIsNone(hero['combat_id'])
                art = path.parent / config['artwork']
                self.assertEqual(hashlib.sha256(art.read_bytes()).hexdigest(), hero['artwork_sha256'])
                rendered = generate_card.render(generate_card.validate(config, path.parent))
                with Image.open(ROOT / hero['output']) as output:
                    self.assertEqual(output.size, (750, 1050))
                    self.assertEqual(output.mode, 'RGBA')
                    self.assertEqual(output.tobytes(), rendered.tobytes())
        back = manifest['card_back']
        self.assertEqual(hashlib.sha256((ROOT / back['path']).read_bytes()).hexdigest(), back['sha256'])

    def test_haku_render(self):
        result, output = self.run_card()
        self.assertEqual(result.returncode, 0, result.stderr)
        with Image.open(output) as image:
            self.assertEqual(image.size, (750, 1050))
            self.assertEqual(image.mode, 'RGBA')

    def test_invalid_fields_fail_cleanly(self):
        for changes, message in [({'atk': -1}, 'atk'), ({'def': True}, 'def'), ({'type': ''}, 'type'), ({'name': 4}, 'name'), ({'crop_focus': [1.5, 0]}, 'crop_focus'), ({'artwork': 'missing.jpg'}, 'artwork'), ({'typo': 1}, 'Unknown')]:
            with self.subTest(changes=changes):
                result, output = self.run_card(changes)
                self.assertEqual(result.returncode, 2)
                self.assertIn(message, result.stderr)
                self.assertNotIn('Traceback', result.stderr)
                self.assertFalse(output.exists())

    def test_overflow_rejected(self):
        result, output = self.run_card({'effect': 'Long effect text. ' * 150})
        self.assertEqual(result.returncode, 2)
        self.assertIn('effect', result.stderr)
        self.assertNotIn('Traceback', result.stderr)
        self.assertFalse(output.exists())

    def test_every_field_editable(self):
        from PIL import ImageChops
        result, original = self.run_card()
        self.assertEqual(result.returncode, 0, result.stderr)
        for key, value in {'name': 'EDIT TEST', 'type': 'SPELL', 'role': 'MAGE', 'rarity': 'COMMON', 'effect_title': 'NEW EFFECT', 'effect': 'First sentence.\nSecond sentence.', 'atk': 123, 'def': 456, 'crop_focus': [0.5, 0.9]}.items():
            with self.subTest(key=key):
                result, output = self.run_card({key: value})
                self.assertEqual(result.returncode, 0, result.stderr)
                with Image.open(original) as a, Image.open(output) as b:
                    self.assertIsNotNone(ImageChops.difference(a.convert('RGB'), b.convert('RGB')).getbbox())
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        art = Path(folder.name) / 'new.png'
        Image.new('RGB', (100, 100), 'blue').save(art)
        result, output = self.run_card({'artwork': str(art), 'role': ''})
        self.assertEqual(result.returncode, 0, result.stderr)
        with Image.open(output) as image:
            self.assertEqual(image.getpixel((375, 400))[:3], (0, 0, 255))

    def test_output_refuses_non_png(self):
        folder = tempfile.TemporaryDirectory()
        self.addCleanup(folder.cleanup)
        result = subprocess.run([sys.executable, str(ROOT / 'generate_card.py'), '--config', str(ROOT / 'examples/haku.json'), '--output', str(Path(folder.name) / 'not-png.jpg')], capture_output=True, text=True)
        self.assertEqual(result.returncode, 2)
        self.assertIn('.png', result.stderr)

if __name__ == '__main__':
    unittest.main()
