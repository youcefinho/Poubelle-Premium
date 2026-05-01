---
name: Poubelle Premium - architecture stable au 2026-05-01
description: Etat des 13 fichiers ghl-ready/ apres session 5, conventions a respecter pour ne pas regresser
type: project
originSessionId: 7b37ba76-5d35-49b1-9574-16256a263a0c
---
Snapshot architectural apres ~6h de debug sur 5 sessions. **Cet etat est stable** — tout marche en GHL : header sticky, animations au scroll, count-up, menu hamburger mobile, redirect /retour sur les CTA Google reviews, form GHL natif, traduction FR/EN.

## Les 13 fichiers de `ghl-ready/`

**4 pages HTML** (Custom Code emplacement principal de chaque page GHL) :
- `1-accueil.html` (~25K lignes) — Accueil. Hero avec stats, services, FAQ. **Slug GHL : `/accueil_index`** (pas `/`)
- `2-avis-clients.html` (~900 lignes) — Avis. **Seule page avec Tailwind CDN**. Star selector + iframe Google reviews widget. **Slug : `/avis-clients`**
- `3-soumission.html` (~900 lignes) — Soumission_1. Hero + iframe form GHL natif (formId `T4YujbkmtyJpE1tkejGE`). **Slug : `/soumission_1`** (le slug `/soumission` est pris par un funnel pre-existant)
- `4-retour.html` (~700 lignes) — Page de retour apres avoir ouvert Google reviews. Carousel Swiper. **Slug : `/retour`**

**4 CSS** (emplacement "CSS perso" de chaque page) :
- `_accueil-css.css` — lang FR/EN + header fixed full-width + button overrides + **système `.pp-anim`** (anims custom replacing AOS, voir leçon 9)
- `_avis-css.css`, `_retour-css.css`, `_soumission-css.css` — versions equivalent simplifiees

**4 headers** (emplacement "Code de suivi en-tete") :
- `_accueil-header.html` — charge AOS + Swiper + preconnects (Accueil seul utilise AOS, mais on l'a remplace par pp-anim au footer)
- `_avis-header.html`, `_retour-header.html`, `_soumission-header.html` — preconnects + bloc tracking commente (GTM/Meta Pixel/Google Ads a remplir)

**4 footers** (emplacement "Code de suivi pied de page") :
- `_accueil-footer.html` — initFaq, switchLang, restoreLang, initSwiper, smartScrollServices, **initPPAnim** (animations custom), **initCount** (count-up #pp-bacs), iframe-redirect detection
- `_avis-footer.html` — switchLang, restoreLang, patchOldLinks, **iframe + click-link detection** pour redirect /retour
- `_retour-footer.html` — switchLang, restoreLang, initReviewsSwiper, patchOldLinks
- `_soumission-footer.html` — switchLang, restoreLang, patchOldLinks, **iframe + click-link detection**

**1 fichier special** :
- `_soumission-avis-footer.html` — 2e bloc Custom Code (separe du principal) sur la page Soumission_1 contenant la section Avis + footer. Splittage necessaire car GHL natif ecrase si tout dans un bloc (voir lecon 3).

## Conventions critiques a NE PAS casser

### Animations (Accueil seulement, autres pages = no anim)
- Pas d'AOS. Le systeme est custom : `_accueil-footer.html` initPPAnim() tag `.c-column / .c-heading / .c-image / .c-button` avec `.pp-anim` + `.pp-anim-up/right/zoom`
- 3 SKIPS critiques : (1) elements deja dans viewport au load, (2) elements descendants d'un header, (3) elements qui CONTIENNENT un header
- CSS dans `_accueil-css.css` : `.pp-anim { opacity:0 !important; transition:... }`, `.pp-anim.pp-in { opacity:1 !important; transform:none !important }`

### Redirect /retour vers Google reviews
3 niveaux de detection dans les footers (Accueil/Avis/Soumission) :
1. **Mousedown sur l'iframe** msgsndr_reviews → set `lastIframeClick`
2. **Blur fenetre** + `document.activeElement.id === 'msgsndr_reviews'` → redirect (cas cross-origin click)
3. **Click delegue au document** sur tout `<a>` dont href contient google.com + Poubelle+Premium ou ludocid ou 0xaf3ef64ce9c08449 → setTimeout 250ms → redirect

Tous les CTA Google reviews (etoiles Avis, badge dashboard Accueil, hero `5/5 148+ avis`, boutons "Rediger un avis" sur Avis et Soumission, boutons internes du widget) sont couverts par AU MOINS un de ces 3 niveaux.

### Menu hamburger mobile
- Style applique via JS `style.cssText` avec `!important` au clic sur le bouton (pas via CSS) — necessaire sur Avis car Tailwind ecrase la specificite
- 1 seul listener par page, pas d'inline `onclick`

### Form GHL (Soumission = Sondage multi-step depuis 2026-05-01)
- Iframe natif **Sondage** : `https://api.leadconnectorhq.com/widget/survey/VvEwIFqbMCj3t1kUnB6g`
  (anciennement Form `T4YujbkmtyJpE1tkejGE` migre vers Sondage pour avoir le multi-step natif)
- Wrapper `.ghl-form-wrap` avec `overflow:hidden` (sans hauteur fixe, form_embed.js auto-resize)
- `form_embed.js` charge directement apres l'iframe (necessaire pour les boutons Suivant/Precedent)
- Auto-scroll : `_soumission-footer.html` ecoute les events postMessage + MutationObserver sur height pour scroller au top du sondage a chaque changement d'etape
- CSS interne du sondage : `_form-soumission-ghl.css` (a coller dans Sites > Sondages > Modifier > Avance)

### Form Retour (separe)
- Iframe natif Form `https://api.leadconnectorhq.com/widget/form/g5pvDJWBSQmPuMQ9hvTu` (3 champs, 1 etape)
- CSS interne : `_form-retour-ghl.css`

### Traduction FR/EN
- Span `.fr-text` / `.en-text` partout (et `.fr-block` / `.en-block` pour block elements)
- `localStorage.pp_lang` pour persister
- `body.lang-fr` / `body.lang-en` pour les regles CSS
- Default = FR au load via `restoreLang()` dans chaque footer

## Ne JAMAIS toucher
- `dist/` (deprecated, deploiement GHL uniquement, ignore par .gitignore)
- Les classes GHL natives `.fullSection`, `.c-section`, `.c-wrapper` — utilisees mais ne pas reutiliser dans nouveau code
- Le slug `/accueil_index` (pas `/`)
- Le `formId T4YujbkmtyJpE1tkejGE`
