## ESAGE — École Supérieure d'Administration et de Gestion des Entreprises

A modern, professional, French-language marketing site for ESAGE (Niamey, Niger), built as a multi-page TanStack Start app with proper SEO per page. Conversion-focused: prominent CTAs, easy WhatsApp contact, and an application form that opens WhatsApp with a pre-filled message.

### Design direction

- Color palette: deep institutional blue (primary), white, soft light-blue surfaces, dark text. Subtle gradients and shadows; no flashy effects.
- Typography: clean modern sans-serif (Inter for body, Playfair or similar serif for select headings to convey academic gravitas — final pick during build).
- Layout: generous spacing, large hero, image-rich sections, rounded cards, subtle hover states.
- Mobile-first, fully responsive.
- Logo: uploaded ESAGE crest used in header, footer, and as favicon.

### Site structure (routes)

```text
/                    Accueil (homepage)
/a-propos            À propos
/formations          Filières (BTS / Licence / Master)
/admissions          Admissions + formulaire WhatsApp
/frais               Frais de scolarité
/equipe              Corps enseignant & direction
/galerie             Galerie photos
/contact             Contact + carte + WhatsApp
```

Shared header (sticky, logo + nav + "S'inscrire" CTA) and footer (contact info, quick links, social). Floating WhatsApp button on every page → +227 96 87 67 17.

### Page contents

**Accueil**
- Hero: logo, slogan "Travail – Rigueur – Succès", subtext "La réussite au bout de l'effort", two CTAs: "S'inscrire maintenant" → /admissions, "Découvrir nos formations" → /formations. Background uses a classroom/student photo with blue overlay.
- 3 strength cards: Formation professionnelle, Enseignants expérimentés, Diplômes reconnus.
- Aperçu des filières (BTS / Licence / Master) with link to /formations.
- Chiffres-clés (20+ ans d'expérience, 15+ filières, etc.).
- Témoignages d'étudiants (3 cards).
- CTA band: "Prêt à construire votre avenir ?" → admissions + WhatsApp.

**À propos**
- Mission, présentation, formation initiale + continue, séminaires & ateliers, renforcement des capacités. Image collage.

**Formations**
- Two clearly separated sections (BTS d'État, Licence & Master) with all filières from the brief as cards. Each card: title, short description, level badge, "Postuler" button → /admissions with program pre-selected.

**Admissions**
- Pièces à fournir (BTS vs Licence/Master) in two columns.
- "Formulaire d'inscription rapide" — Nom, Téléphone, Email, Filière (select with all programs), Message. Validation with Zod. Submit builds a pre-filled WhatsApp message and opens `https://wa.me/22796876717?text=...`.

**Frais de scolarité**
- Pricing table: BTS 350 000 FCFA, Licence 450 000 FCFA, Master 700 000 FCFA, inscription 10 000 FCFA. Note on paiement en 3 tranches. CTA to admissions.

**Équipe**
- Direction (Directrice, 20+ ans, ENAM), corps enseignant permanent & vacataire, professionnels en activité. Generic professional portraits.

**Galerie**
- Responsive grid of classroom/student/campus images with lightbox.

**Contact**
- Adresse, 3 numéros de téléphone, email, horaires. Embedded Google Map (iframe) of "2ème rond-point Wadata, route Filingué, Niamey". Big WhatsApp button + contact form (also opens WhatsApp).

### Conversion features

- Floating WhatsApp button (bottom-right) on all pages → +227 96 87 67 17 with pre-filled greeting.
- "S'inscrire" CTA in sticky header.
- CTA band repeated on home, formations, frais, équipe.
- Tel-links on all phone numbers, mailto on email.

### SEO

- Per-route `head()` metadata: unique French title, description, og:title, og:description.
- Semantic HTML, alt text in French on all images, sitemap-friendly route structure.

### Technical notes

- TanStack Start, file-based routes under `src/routes/`, each with own `head()`.
- Logo copied to `src/assets/esage-logo.jpg`, imported as ES module; also placed in `public/` for favicon.
- Imagery: high-quality stock photos of African students/classrooms via Unsplash URLs.
- Form validation with Zod; WhatsApp link built client-side using `encodeURIComponent` — no backend required.
- Tailwind theme tokens updated in `src/styles.css` to ESAGE blue palette.
- shadcn/ui components reused (Button, Card, Input, Select, Textarea, Dialog for gallery lightbox).
- All content in French.

### Out of scope (can add later)

- CMS-backed editing (currently content is in code; easy to migrate to Lovable Cloud later).
- Email delivery of applications (current flow is WhatsApp).
- Multilingual toggle.