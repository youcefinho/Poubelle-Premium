---
name: Poubelle Premium - points en attente (2026-05-01)
description: Reste a faire apres session 5 - audit, marketing, items bloques cote client
type: project
originSessionId: 7b37ba76-5d35-49b1-9574-16256a263a0c
---
Le site est **fonctionnellement complet et stable en GHL** au 2026-05-01 (commit f01da9b). Tout marche : header sticky, anims pp-anim au scroll, count-up, hamburger mobile, redirects /retour, form GHL natif, traduction FR/EN.

Ce qui reste :

## 1. Audit / cleanup des 13 fichiers (TERMINE 2026-05-01)
**Statut : fait, fichiers propres.** Commits de cleanup : `aba72be` (Accueil only).

Ce qui a ete retire :
- `_accueil-css.css` : regle `html.pp-no-aos [data-aos]` (classe jamais ajoutee nulle part)
- `_accueil-footer.html` : commentaire trompeur sur "AOS init" + variable inutilisee `_ppAosInitDone`

Ce qui a ete VERIFIE et NE peut PAS etre retire (par design GHL ou usage actif) :
- `cbutton-*` dans `_accueil-css.css` : 32 occurrences dans `1-accueil.html` -> utilisees
- AOS dans `_accueil-header.html` : 11 `data-aos` actifs dans le HTML -> utilise
- Duplications `switchLang` / `.fr-text` / `.header-nav` entre les 4 footers/CSS : imposees par GHL (chaque page = ses slots isoles, pas de partage possible)
- `_avis-css.css` lignes 106-115 (`body.lang-*`) : fix specifique parce que GHL n'ajoute pas `lang` au html sur Avis -> garder
- Scripts internes dans HTML body (switchLang, hamburger, AOS init lignes 25240+) : morts en GHL (innerHTML strip) mais servent au PREVIEW LOCAL -> garder

Avis / Soumission / Retour : **deja propres, rien a retirer**. Pas d'AOS, pas de cbutton-*, regles CSS specifiques toutes referencees.

**How to apply:** Si user demande encore un cleanup, dire que c'est deja fait. Le seul gain residuel possible (~70kB) serait de supprimer AOS completement de l'Accueil (1 seul `data-aos` actif), mais ca touche au HTML body et casse 1 anim mineure -> pas la peine sauf perf critique.

## 2. Marketing pipeline (a faire)
- **Meta Pixel** : creer le pixel sur business.facebook.com, remplacer `YOUR_PIXEL_ID` dans les 4 `_*-header.html` (lignes commentees)
- **Lookalike Audience** : creer apres collecte d'au moins 100 conversions
- **Google Ads + GTM** : creer comptes, remplacer `AW-XXXXX` et `GTM-XXXXXXX` dans les 4 headers
- **Lancement campagnes Ads** : apres tout le tracking en place

## 3. Items bloques cote client (en attente d'envoi)
- **Vraie photo "Aujourd'hui"** pour la timeline evolution — la cliente doit envoyer une vraie photo pour remplacer le stock GHL
- **Logo Comptant** pour remplacer Interac dans la section paiements
- **Google My Map version 2026** — la cliente avait promis une URL a jour
- **Texte "Bacs de Poubelles"** qui deborde sur une nouvelle ligne (besoin de voir le rendu pour decider du fix)
- **Footer "Liens utiles"** verification — la cliente voulait verifier
- **Duplicate "Nos services" en noir** a retirer — la cliente voulait verifier

## 4. Limitations GHL Forms basic plan (RESOLU 2026-05-01)
**Decision finale** : la cliente a recree le form Soumission en **1 seule etape** (au lieu de 4 originalement) pour contourner les 2 limitations basic plan.

Consequence : les 2 demandes audit deviennent non-applicables :
- ~~Auto-scroll entre etapes~~ : plus de "Suivant", donc rien a faire
- ~~Logique conditionnelle "Forfait personnalise"~~ : tout sur une page, visible directement

CSS de styling du form natif : `ghl-ready/_form-soumission-ghl.css` (a coller dans GHL Sites > Formulaires > Soumission > Avance > CSS personnalise).

**Si la cliente revient un jour vouloir multi-step :** lui dire de recreer le form en tant que **Sondage (Survey)** dans GHL : `Sites > Sondages > + Creer un sondage`. Les Sondages GHL supportent natif le multi-step et la logique conditionnelle (souvent meme sur plan basic). Le widget d'embed est similaire (iframe + form_embed.js), donc swap rapide dans `3-soumission.html`. CSS `_form-soumission-ghl.css` devrait fonctionner aussi. Confusion frequente : Forms (basic = 1 page) vs Surveys (multi-step natif).

**How to apply:** Quand Rochdi revient, demander : "tu veux attaquer l'audit cleanup ou le marketing pipeline ou autre chose ?". Lui rappeler que tout marche et que le cleanup est risque sans validation ligne par ligne.
