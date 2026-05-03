#!/usr/bin/env node
/**
 * Génère un dossier `dist-static/` 100 % statique pour Hostinger.
 *
 * - Copie les assets navigateur depuis `dist/client/`
 * - Pré-rend chaque route en HTML via le worker SSR (`dist/server/index.js`)
 *   afin que le site s'affiche immédiatement sans JS et que `hydrateRoot`
 *   trouve bien le DOM attendu (le bundle TanStack utilise hydrateRoot,
 *   donc un index.html vide produit une page blanche en production).
 * - Copie `.htaccess` pour le routage SPA Apache (refresh sur sous-pages).
 */

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(process.cwd());
const clientDir = join(root, "dist", "client");
const serverEntry = join(root, "dist", "server", "index.js");
const outDir = join(root, "dist-static");

if (!existsSync(clientDir) || !existsSync(serverEntry)) {
  console.error("❌ dist/ introuvable — lance d'abord `vite build`.");
  process.exit(1);
}

// 1. Repartir d'un dossier propre + copier les assets client
if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
cpSync(clientDir, outDir, { recursive: true });

// 2. Charger le worker SSR
const worker = (await import(pathToFileURL(serverEntry).href)).default;
if (!worker?.fetch) {
  console.error("❌ Le worker SSR n'expose pas de fetch().");
  process.exit(1);
}

// 3. Lister les routes à pré-rendre (toutes les pages publiques)
const routes = [
  { url: "/", file: "index.html" },
  { url: "/a-propos", file: "a-propos.html" },
  { url: "/admissions", file: "admissions.html" },
  { url: "/contact", file: "contact.html" },
  { url: "/equipe", file: "equipe.html" },
  { url: "/faq", file: "faq.html" },
  { url: "/formations", file: "formations.html" },
  { url: "/frais", file: "frais.html" },
  { url: "/galerie", file: "galerie.html" },
];

const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };
let fallbackHtml = null;

for (const r of routes) {
  try {
    const req = new Request("https://esage.local" + r.url);
    const res = await worker.fetch(req, {}, ctx);
    const html = await res.text();
    if (res.status >= 400) throw new Error(`HTTP ${res.status}`);
    const dest = join(outDir, r.file);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, html, "utf8");
    if (r.url === "/") fallbackHtml = html;
    console.log(`  ✓ ${r.url.padEnd(14)} → ${r.file}  (${(html.length / 1024).toFixed(1)} KB)`);
  } catch (e) {
    console.error(`  ✗ ${r.url} : ${e.message}`);
  }
}

// 4. .htaccess (routage SPA Apache + cache + gzip)
const htaccessSrc = join(root, "public", ".htaccess");
if (existsSync(htaccessSrc)) {
  cpSync(htaccessSrc, join(outDir, ".htaccess"), { force: true });
}

// 5. Récap
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
