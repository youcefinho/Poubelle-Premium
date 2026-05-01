---
name: Poubelle Premium - bug Soumission header (RÉSOLU)
description: Bug header Soumission - 2 causes (style non fermée + slug pris par ancien funnel). Fix 2026-04-30 commits 2a8fd18, 4c38176, 167b589
type: project
originSessionId: d4423436-38e4-47a1-a0f3-92ce4574c317
---
**Bug initial** : Sur `https://poubellepremium.ca/soumission`, header simplifié (Logo + "Accueil" + "Faire nettoyer mes bacs") au lieu du header complet (Accueil + Services + Avis clients + FR/EN + Demander un devis).

**Diagnostic final** — DEUX causes superposées :

**Cause 1 (technique)** : balise `<style class="unihdr">` ligne 695 de `3-soumission.html` jamais fermée. Tout le HTML qui suivait (header, hero, formulaire) était avalé dans le `<style>` ouvert et ignoré comme du CSS invalide. → Fix: ajout `</style>` (commit `2a8fd18`). Bloc CSS anti-header-GHL devenu inutile retiré (commit `4c38176`).

**Cause 2 (configuration GHL)** : l'ancien funnel GHL (qui contient une page `accueil919563`) avait déjà publié une page sur le slug `/soumission`. Cette page captait l'URL et empêchait la nouvelle page Soumission du nouveau funnel de la prendre, peu importe combien de fois on collait notre Custom Code. → Contournement: passage du slug à `/soumission_1` partout (commit `167b589`, 32 occurrences dans 5 fichiers).

**État final côté code** :
- `ghl-ready/3-soumission.html` (1341 lignes) : structure équilibrée, marqueur `PP-SOUMISSION-V3-2026-04-30` ligne 1
- Tous les liens internes vers la page Soumission utilisent `/soumission_1`
- Slug officiel : `https://poubellepremium.ca/soumission_1`

**Étapes restantes côté utilisateur (GHL)** :
1. Dans le NOUVEAU funnel, ouvrir la page Soumission → Settings → changer le **Path** en `soumission_1` (sans slash)
2. Vider le bloc Custom Code et y coller la version V3 de `ghl-ready/3-soumission.html`
3. Vérifier que CSS personnalisé / Header Tracking / Footer Tracking contiennent bien les fichiers `_soumission-css.css` / `_soumission-header.html` / `_soumission-footer.html`
4. Save → Publish
5. Re-publier les autres pages (Accueil, Avis, Retour) car leurs liens internes vers Soumission ont aussi changé (32 occurrences mises à jour)
6. Test : `https://poubellepremium.ca/soumission_1` → Ctrl+F5 → Ctrl+U → chercher `PP-SOUMISSION-V3-2026-04-30`

**Approches testées avant identification (NE PAS RE-EXPLORER)** :
1. ❌ Patch JS `patchOldLinks` — ne corrige que les href, pas le rendu
2. ❌ DOM-rewrite du header GHL natif via footer-tracking — abandonné
3. ❌ Injection `<header id="pp-injected-header">` via JS — refusé par user
4. ❌ CSS agressif anti-header-GHL natif (commit `5a6a2a5`) — il n'y avait pas de header GHL natif à masquer

**Méthode de diagnostic clé** :
- `curl` direct de l'URL publique pour récupérer le HTML rendu (WebFetch résume trop)
- `grep -c` sur des marqueurs de notre code dans le rendu vs absent → permet de prouver que le Custom Code n'est pas du tout injecté
- Compter `<style>` vs `</style>` (et autres balises) entre les 4 pages → écart révèle balise non fermée
- Présence de chaînes inconnues dans le rendu (ex: `accueil919563`) qui ne sont nulle part dans la source → indice fort de "page servie par un autre funnel"

**Why:** Ce bug a coûté plusieurs heures parce qu'on cherchait dans une seule direction (conflit avec un header GHL natif au-dessus) alors qu'il y avait deux problèmes superposés. Garder cette mémoire pour la prochaine fois où "le code semble bon mais ne s'affiche pas".

**How to apply:** Pour tout futur bug "le HTML est dans la source mais ne se rend pas" : (1) curl la page publiée et grep nos marqueurs ; (2) compter les balises ouvrantes/fermantes ; (3) si des chaînes inconnues apparaissent dans le rendu, suspecter un conflit de slug avec un autre funnel/page GHL.
