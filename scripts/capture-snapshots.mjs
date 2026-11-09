import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const snapshotsDir = path.join(projectRoot, 'snapshots');
const artifactDir = 'C:\\Users\\KHB\\.gemini\\antigravity\\brain\\3fcb4d6a-9da5-4dda-8439-99344577efda';

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

// Ensure snapshots directory exists
if (!fs.existsSync(snapshotsDir)) {
  fs.mkdirSync(snapshotsDir, { recursive: true });
}

// Ensure artifact snapshots directory exists
const artifactSnapshotsDir = path.join(artifactDir, 'snapshots');
if (!fs.existsSync(artifactSnapshotsDir)) {
  fs.mkdirSync(artifactSnapshotsDir, { recursive: true });
}

const standardBag = [
  { clubId: 'f91237fb-9505-40de-8496-d19a5b024394', level: 9 }, // Extra Mile
  { clubId: '7caab84b-c86b-4bc6-8089-df90b67b2002', level: 10 }, // Sniper
  { clubId: '90378a37-95ac-4b0d-9e0b-bcd95427f169', level: 9 }, // Goliath
  { clubId: '0adb943e-7597-498a-9f43-301f0a9c1440', level: 9 }, // Thorn
  { clubId: '65d69246-f3f5-4b7a-95ac-8c4abd7a37e3', level: 8 }, // Endbringer
  { clubId: '07fd10d8-198c-4c9e-bfd0-cbef5647be70', level: 9 }, // Nirvana
  { clubId: 'e9f659b6-54e2-453d-9d50-a4199f66a58d', level: 9 }, // Malibu
];

const baseHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

const testCases = [
  {
    name: '01-desktop-dashboard',
    title: 'Desktop Dashboard (1280x800)',
    width: 1280,
    height: 800,
    actionScript: '',
  },
  {
    name: '02-mobile-dashboard',
    title: 'Mobile Dashboard (390x844)',
    width: 390,
    height: 844,
    actionScript: '',
  },
  {
    name: '03-mobile-nav-drawer',
    title: 'Mobile Navigation Drawer Open (390x844)',
    width: 390,
    height: 844,
    actionScript: `
      window.__runAction = function() {
        clickWhenReady(b => b.textContent.includes('Menu'));
      };
    `,
  },
  {
    name: '04-mobile-live-play-bag',
    title: 'Live Play Mode - Bag Charts (390x844 Single-Screen Fit)',
    width: 390,
    height: 844,
    actionScript: `
      window.__runAction = function() {
        clickWhenReady(b => b.textContent.trim() === 'Play' || b.textContent.trim().includes('Live Play'), () => {
          clickWhenReady(b => b.textContent.includes('My Bag') || b.textContent.includes('Bag'));
        });
      };
    `,
  },
  {
    name: '05-mobile-live-play-quick',
    title: 'Live Play Mode - Quick Chart Split View (390x844)',
    width: 390,
    height: 844,
    actionScript: `
      window.__runAction = function() {
        clickWhenReady(b => b.textContent.trim() === 'Play' || b.textContent.trim().includes('Live Play'), () => {
          clickWhenReady(b => b.textContent.includes('Universal'));
        });
      };
    `,
  },
  {
    name: '06-mobile-live-play-calc',
    title: 'Live Play Mode - Shot Calculator (390x844)',
    width: 390,
    height: 844,
    actionScript: `
      window.__runAction = function() {
        clickWhenReady(b => b.textContent.includes('Play'), () => {
          clickWhenReady(b => b.textContent.includes('Simulator'));
        });
      };
    `,
  },
  {
    name: '07-mobile-universal-modal',
    title: 'Mobile Universal Ring Chart Modal (390x844)',
    width: 390,
    height: 844,
    actionScript: `
      window.__runAction = function() {
        clickWhenReady(b => b.textContent.includes('Menu'), () => {
          clickWhenReady(b => b.textContent.includes('Universal'));
        });
      };
    `,
  },
  {
    name: '08-desktop-live-play-bag',
    title: 'Desktop Live Play Mode - Bag Charts (1280x800)',
    width: 1280,
    height: 800,
    actionScript: `
      window.__runAction = function() {
        clickWhenReady(b => b.textContent.includes('LIVE PLAY') || b.textContent.includes('Live Play'), () => {
          clickWhenReady(b => b.textContent.includes('Bag'));
        });
      };
    `,
  },
  {
    name: '09-mobile-tips-page',
    title: 'Mobile Pro Tips Page (390x844)',
    width: 390,
    height: 844,
    sourceHtml: 'golf-clash-tips.html',
    actionScript: '',
  },
  {
    name: '10-mobile-resources-page',
    title: 'Mobile Resources Page (390x844)',
    width: 390,
    height: 844,
    sourceHtml: 'golf-clash-resources.html',
    actionScript: '',
  },
];

console.log(`Starting visual snapshot suite (${testCases.length} test cases)...`);

const results = [];

for (const tc of testCases) {
  const runnerFileName = `runner-${tc.name}.html`;
  const runnerFilePath = path.join(distDir, runnerFileName);
  const outPngName = `${tc.name}.png`;
  const outPngPath = path.join(snapshotsDir, outPngName);
  const artifactPngPath = path.join(artifactSnapshotsDir, outPngName);

  // Prepare custom HTML
  const rawHtml = tc.sourceHtml
    ? fs.readFileSync(path.join(distDir, tc.sourceHtml), 'utf8')
    : baseHtml;
  let customHtml = rawHtml
    .replaceAll('/assets/', './assets/')
    .replaceAll('/pwa-192x192.png', './pwa-192x192.png');

  // Insert bootstrap script before any other script tag
  const bootstrapScript = `
    <script>
      (function() {
        try {
          localStorage.setItem('gcwind.bag', JSON.stringify(${JSON.stringify(standardBag)}));
          localStorage.setItem('gcwind.settings', JSON.stringify({ elevation: 10, slider: 50, ballName: 'Basic', windStep: 0.5 }));
          localStorage.setItem('gcwind.theme', 'dark');
          document.documentElement.setAttribute('data-theme', 'dark');
        } catch (e) {}

        window.clickWhenReady = function(predicate, cb) {
          const start = Date.now();
          const timer = setInterval(() => {
            const el = Array.from(document.querySelectorAll('button, a, [role="button"]')).find(predicate);
            if (el) {
              clearInterval(timer);
              el.click();
              if (cb) setTimeout(cb, 250);
            } else if (Date.now() - start > 2500) {
              clearInterval(timer);
            }
          }, 60);
        };

        window.addEventListener('load', () => {
          setTimeout(() => {
            if (typeof window.__runAction === 'function') {
              window.__runAction();
            }
          }, 200);
        });
      })();
    </script>
    ${tc.actionScript ? `<script>${tc.actionScript}</script>` : ''}
  `;

  customHtml = customHtml.replace('<head>', `<head>${bootstrapScript}`);
  fs.writeFileSync(runnerFilePath, customHtml, 'utf8');

  // Run Chrome Headless
  const args = [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--allow-file-access-from-files',
    `--window-size=${tc.width},${tc.height}`,
    '--virtual-time-budget=4500',
    '--hide-scrollbars',
    `--screenshot=${outPngPath}`,
    `file:///${runnerFilePath.replace(/\\/g, '/')}`
  ];

  const startTime = Date.now();
  const run = spawnSync(CHROME_PATH, args);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  const exists = fs.existsSync(outPngPath);
  const size = exists ? fs.statSync(outPngPath).size : 0;

  // Clean up runner file
  try {
    fs.unlinkSync(runnerFilePath);
  } catch (e) {}

  if (exists && size > 1000) {
    // Copy to artifact directory for rendering in conversation
    fs.copyFileSync(outPngPath, artifactPngPath);
    console.log(`✓ [${elapsed}s] ${tc.title} -> ${outPngName} (${(size / 1024).toFixed(1)} KB)`);
    results.push({ ...tc, success: true, size, path: outPngPath, artifactPath: artifactPngPath });
  } else {
    console.error(`✗ [${elapsed}s] FAILED ${tc.title}: Output size ${size} bytes`);
    if (run.stderr) console.error(run.stderr.toString());
    results.push({ ...tc, success: false, size });
  }
}

console.log(`\nCompleted snapshot run: ${results.filter(r => r.success).length}/${results.length} succeeded.`);

