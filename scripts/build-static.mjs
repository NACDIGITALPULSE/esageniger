#!/usr/bin/env node
/**
 * Génère un dossier `dist-static/` 100 % statique, prêt à uploader sur Hostinger.
 *
 * Le build TanStack Start sort par défaut deux dossiers :
 *   - dist/client/  → assets navigateur (JS, CSS, images, favicon, _redirects)
 *   - dist/server/  → Worker Cloudflare (inutile sur hébergement mutualisé)
 *
 * Ce script :
 *   1. Copie tout `dist/client/` dans `dist-static/`
 *   2. Génère un `index.html` qui boote le SPA (pas besoin du Worker SSR)
 *   3. Copie `.htaccess` (depuis public/) pour le routage SPA Apache/Hostinger
 *
 * Lancement :  node scripts/build-static.mjs   (exécuté automatiquement après `bun run build`)
 */

import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.cwd());
const clientDir = join(root, "dist", "client");
const outDir = join(root, "dist-static");

if (!existsSync(clientDir)) {
  console.error("❌ dist/client introuvable — lance d'abord `bun run build`.");
  process.exit(1);
}

// 1. Repartir d'un dossier propre
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// 2. Copier tous les assets client
cpSync(clientDir, outDir, { recursive: true });

// 3. Trouver le bundle principal (main-*.js) et le CSS
const assetsDir = join(outDir, "assets");
const files = readdirSync(assetsDir);
const mainJs = files.find((f) => /^main-.*\.js$/.test(f));
const stylesCss = files.find((f) => /^styles-.*\.css$/.test(f));

if (!mainJs) {
  console.error("❌ Bundle main-*.js introuvable dans dist/client/assets/");
  process.exit(1);
}

// 4. Générer index.html (SPA shell)
const html = `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>ESAGE — École Supérieure d'Administration et de Gestion des Entreprises</title>
    <meta name="description" content="ESAGE forme les futurs cadres en administration, gestion, finance et marketing au Niger. BTS, Licence et Master." />
    <meta name="theme-color" content="#1e40af" />
    <meta property="og:title" content="ESAGE — École Supérieure d'Administration et de Gestion des Entreprises" />
    <meta property="og:description" content="ESAGE forme les futurs cadres en administration, gestion, finance et marketing au Niger. BTS, Licence et Master." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/jpeg" href="/favicon.jpg" />
    <link rel="apple-touch-icon" href="/favicon.jpg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@600;700;800&display=swap" />
${stylesCss ? `    <link rel="stylesheet" href="/assets/${stylesCss}" />\n` : ""}    <script type="module" src="/assets/${mainJs}"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`;
writeFileSync(join(outDir, "index.html"), html, "utf8");

// 5. S'assurer que .htaccess est bien copié (depuis public/)
const htaccessSrc = join(root, "public", ".htaccess");
if (existsSync(htaccessSrc) && !existsSync(join(outDir, ".htaccess"))) {
  cpSync(htaccessSrc, join(outDir, ".htaccess"));
}

// 6. Récap
const sizeMB = (n) => (n / 1024 / 1024).toFixed(2) + " MB";
let total = 0;
const walk = (d) => {
  for (const f of readdirSync(d, { withFileTypes: true })) {
    const p = join(d, f.name);
    if (f.isDirectory()) walk(p);
    else total += readFileSync(p).length;
  }
};
walk(outDir);

console.log(`\n✅ Build statique prêt : dist-static/  (${sizeMB(total)})`);
console.log("   → Uploadez tout le contenu de ce dossier dans public_html/ sur Hostinger.\n");
