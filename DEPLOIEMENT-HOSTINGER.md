# 📦 Déploiement ESAGE sur Hostinger (hébergement mutualisé)

Ce site est un **site statique** (HTML / CSS / JS) prêt à être déployé sur un hébergement web mutualisé Hostinger via FTP ou le File Manager du panneau hPanel.

---

## 🛠️ 1. Générer les fichiers à uploader

Dans Lovable, cliquez sur **Publish** → cela crée la version de production.

Les fichiers à uploader sur Hostinger se trouveront dans le dossier `dist/` après build.

Si vous travaillez en local :
```bash
bun install
bun run build
```

Le dossier `dist/` est ensuite généré à la racine du projet.

---

## 🌐 2. Uploader sur Hostinger

### Option A — Via le File Manager (le plus simple)

1. Connectez-vous à **hPanel** sur https://hpanel.hostinger.com
2. Allez dans **Fichiers → Gestionnaire de fichiers**
3. Ouvrez le dossier **`public_html/`** (c'est la racine de votre site)
4. **Supprimez** tous les fichiers existants (sauf `.htaccess` si vous en avez un personnalisé)
5. **Uploadez** tout le contenu du dossier `dist/` (PAS le dossier lui-même, juste ce qu'il contient)
6. Vérifiez qu'à la racine de `public_html/` vous avez bien :
   - `index.html`
   - le dossier `assets/`
   - le fichier `_redirects`

### Option B — Via FTP (FileZilla, etc.)

1. Récupérez vos identifiants FTP dans hPanel → **Fichiers → Comptes FTP**
2. Connectez-vous avec FileZilla :
   - Hôte : `ftp.votredomaine.com`
   - Utilisateur / Mot de passe : ceux fournis par Hostinger
   - Port : 21
3. Naviguez vers `/public_html/` côté serveur
4. Glissez-déposez le contenu de `dist/` vers `public_html/`

---

## ⚙️ 3. Configurer le routage SPA (IMPORTANT)

Ce site est une **Single Page Application**. Pour que les pages comme `/formations` ou `/admissions` fonctionnent quand un visiteur les ouvre directement (ou recharge la page), créez un fichier **`.htaccess`** à la racine de `public_html/` avec ce contenu :

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Si la requête correspond à un fichier ou dossier existant, on le sert
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Sinon, on redirige tout vers index.html (routage SPA)
  RewriteRule ^ index.html [L]
</IfModule>

# Compression Gzip pour accélérer le site
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css text/javascript application/javascript application/json image/svg+xml
</IfModule>

# Cache des assets statiques (1 an)
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

**Sans ce fichier .htaccess, les visiteurs auront des erreurs 404 en rechargeant les pages internes.**

---

## ✏️ 4. Modifier le contenu du site

Toutes les données sont dans des fichiers TypeScript éditables :

| Contenu | Fichier à modifier |
|---|---|
| Filières (BTS, Licence, Master) | `src/data/programs.ts` |
| Frais de scolarité | `src/data/tuition.ts` |
| Équipe / Direction | `src/data/team.ts` |
| Galerie photos | `src/data/gallery.ts` |
| FAQ (questions/réponses) | `src/data/faq.ts` |
| Adresse, téléphone, email, WhatsApp | `src/lib/contact.ts` |

Après modification, il faut **rebuild** le site (`bun run build`) puis re-uploader le contenu de `dist/` sur Hostinger.

Les **images** se trouvent dans `src/assets/` — remplacez-les en gardant les mêmes noms de fichiers pour ne rien casser.

---

## 📝 5. Comment fonctionne le formulaire d'inscription

Sans serveur, le formulaire d'inscription :

1. **Génère un reçu PDF** téléchargé automatiquement sur l'appareil du candidat
2. **Ouvre WhatsApp** dans un nouvel onglet avec un message pré-rempli contenant toutes les informations du candidat
3. Le candidat n'a plus qu'à **envoyer le message** sur WhatsApp pour vous transmettre sa candidature
4. Pensez à demander au candidat d'envoyer aussi son reçu PDF en pièce jointe sur WhatsApp

**Avantage** : aucun serveur, aucune base de données, aucun coût récurrent. Toutes les inscriptions arrivent sur votre WhatsApp **+227 90 41 63 61**.

Pour changer le numéro WhatsApp destinataire, modifiez `src/lib/contact.ts`.

---

## 🆘 Problèmes courants

**Erreur 404 quand je recharge une page interne** → Vous avez oublié de créer le fichier `.htaccess` (étape 3).

**Les images ne s'affichent pas** → Vérifiez que le dossier `assets/` a bien été uploadé entièrement.

**Le site est lent** → Activez la compression Gzip (déjà incluse dans le `.htaccess` ci-dessus) et activez le CDN de Hostinger dans hPanel.

**Je veux ajouter Google Analytics** → Ajoutez le tag dans `src/routes/__root.tsx` dans la section `<head>`.

---

## 📞 Contact ESAGE

- **Adresse** : 2ème rond-point Wadata, route Filingué (vers Jangorzo), Niamey
- **Téléphone / WhatsApp** : +227 90 41 63 61
- **Email** : esageniger@hotmail.com
