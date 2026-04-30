# Poubelle Premium — site statique

Site statique du client **Poubelle Premium** (https://poubellepremium.ca/) — service de nettoyage de bacs B2C, Laval / Rive-Nord de Montréal.

## Structure

- `dist/` — **dossier déployé sur Cloudflare Pages**. Contient les 4 pages HTML, `_redirects`, `_headers`.
- 4 fichiers `.html` à la racine — **backup brut** (export GHL initial, avant nettoyage). Ne pas modifier, ne pas servir.

## Pages

| Route                | Fichier             | Rôle                           |
|----------------------|---------------------|--------------------------------|
| `/`                  | `index.html`        | Homepage                       |
| `/page-avis`         | `page-avis.html`    | Avis Google (iframe GHL)       |
| `/soumission`        | `soumission.html`   | Formulaire devis (iframe GHL)  |
| `/retour`            | `retour.html`       | Page feedback post-service     |

## Stack

- **Hébergement** : Cloudflare Pages (projet `poubelle-premium`)
- **DNS** : GoDaddy (registrar) → records pointant vers Cloudflare Pages
- **Forms / iframes** : GoHighLevel (compte `Q4K7xsLSm5SH7e2GyuSi`)
- **Assets** : tous CDN externes (Tailwind CDN, Google Fonts, FontAwesome kit, Swiper, leadconnectorhq, filesafe.space)

## Dev local

```bash
cd dist
python -m http.server 8787
# http://localhost:8787
```

## Déploiement

```bash
bunx wrangler pages deploy dist --project-name=poubelle-premium --branch=main
```

## Redirects (legacy GHL → nouveau site)

Voir `dist/_redirects`. Map les anciennes URLs GHL (`/accueil6709844`, `/quote-bin-cleaning`, `/blog-poubelle-premium`, `/blog`, `/post/*`) vers `/` ou `/soumission` en 301 pour préserver le SEO.
