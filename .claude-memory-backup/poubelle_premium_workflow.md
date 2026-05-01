---
name: Poubelle Premium - workflow ghl-ready uniquement
description: Pour le projet Poubelle Premium, ne plus toucher dist/ — tout passe par ghl-ready/
type: feedback
originSessionId: d4423436-38e4-47a1-a0f3-92ce4574c317
---
Ne modifier que les fichiers du dossier `ghl-ready/` (1-accueil.html, 2-avis-clients.html, 3-soumission.html, 4-retour.html, _custom-css.css, _header-tracking.html, _footer-tracking.html).

**Why:** Le client déploie uniquement sur GoHighLevel via copier-coller depuis ces fichiers. Le dossier `dist/` était initialement prévu pour Cloudflare Pages (abandonné). Modifier les deux à chaque changement = double travail + risque de divergence.

**How to apply:** Pour toute correction sur le site Poubelle Premium (HTML markup, CSS, scripts), éditer directement `ghl-ready/1-accueil.html` et compagnie. Ignorer `dist/`. Ne pas annoncer "je fais dist puis ghl-ready" — aller direct sur ghl-ready.
