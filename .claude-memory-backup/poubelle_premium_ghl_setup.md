---
name: Poubelle Premium - setup GHL multi-emplacements
description: Architecture du déploiement GHL pour Poubelle Premium — 4 pages × 4 emplacements GHL chacune
type: project
originSessionId: d4423436-38e4-47a1-a0f3-92ce4574c317
---
Le site Poubelle Premium est déployé sur GoHighLevel via 4 emplacements GHL natifs par page (PAS uniquement le bloc Custom Code). Raison : GHL injecte le bloc Custom Code via `innerHTML`, donc les `<script>` à l'intérieur ne s'exécutent pas toujours.

**Slugs réels du funnel** (URLs de production) :
- Accueil : `https://poubellepremium.ca/accueil_index` (PAS `/`)
- Avis : `https://poubellepremium.ca/avis-clients`
- Soumission : `https://poubellepremium.ca/soumission_1` (PAS `/soumission`, pris par l'ancien funnel non supprimé)
- Retour : `https://poubellepremium.ca/retour`

⚠️ Le `/` (root) du domaine pointe encore vers l'ANCIEN site (toujours en ligne). Donc tout lien interne vers la home utilise `/accueil_index`, jamais `/`.

**Matrice 4 pages × 4 emplacements** dans `ghl-ready/` :

| Page | Bloc Custom Code | Suivi d'en-tête | Suivi du pied de page | CSS personnalisé |
|---|---|---|---|---|
| Accueil | `1-accueil.html` | `_accueil-header.html` | `_accueil-footer.html` | `_accueil-css.css` |
| Avis | `2-avis-clients.html` | `_avis-header.html` | `_avis-footer.html` | `_avis-css.css` |
| Soumission | `3-soumission.html` | `_soumission-header.html` | `_soumission-footer.html` | `_soumission-css.css` |
| Retour | `4-retour.html` | `_retour-header.html` | `_retour-footer.html` | `_retour-css.css` |

**Why:** Le bloc Custom Code seul ne fait pas exécuter les scripts inline (compteur, AOS, FAQ, lang switcher) à cause de l'injection innerHTML. Les 3 emplacements natifs (Code de suivi en-tête/pied + CSS personnalisé) garantissent l'exécution car GHL les insère directement dans `<head>` ou avant `</body>`.

**How to apply:** Pour toute correction sur Poubelle Premium :
1. Si c'est juste du HTML/markup → modifier le fichier `<numero>-<page>.html` correspondant.
2. Si c'est un script qui doit tourner → l'ajouter dans `_<page>-footer.html` (sera exécuté nativement).
3. Si c'est du CSS critique (pré-paint) → `_<page>-css.css`.
4. Si c'est une lib externe (CDN) → `_<page>-header.html`.
5. Toujours mentionner au user QUEL fichier re-coller dans QUEL emplacement GHL après modification.
