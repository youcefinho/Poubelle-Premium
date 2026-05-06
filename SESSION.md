# SESSION.md — Poubelle Premium (handoff Claude Code ↔ Antigravity)

Journal partage entre les 2 IAs qui collaborent sur ce projet.
Format : voir skill `session-handoff-intralys`.

---

## 2026-05-05 / 2026-05-06 [Claude Code]

### ✅ Realisations (15 commits, c2b28ac..6a0c8a4)

1. **Slug racine domaine** : decouverte que `/` ne peut pas etre attribue a un slug de funnel GHL (reserved path). Solution officielle = Settings > Domains > Manage Domain > Edit > Default Page = funnel/page Accueil. Aucun changement code requis.
2. **Form Retour** : refonte 1-seul-champ feedback (`_form-retour-ghl.css` : textarea 140px min-height, italique placeholder). Retire `<div class="hero-overlay"></div>` de `4-retour.html`.
3. **Section "Nos services" Accueil** : retire eyebrow `<p>Nos services</p>` (etait noir car CSS battait l'inline orange) + `.service-description-premium` passe `justify-content: center` -> `flex-start` pour aligner les 2 h2 oranges avec haut photo gauche.
4. **Carte Renaud** : `mid=1VQT2wX_h7AsBIjyrgk_gLSJ98aCTCco` -> `mid=1zhdhrNhMn7RKZaeDGhyL9bPuQMwihvc&ehbc=2E312F` dans `1-accueil.html:16910`.
5. **Footer modern bg blanc** : `.footer-modern { #f9f9f9 -> #ffffff !important }` sur 4 pages.
6. **Bande grise "Pourquoi choisir"** : `var(--color-lxs55nfl: #f9f9f9)` redefinie a `#ffffff` dans HTML inline (5 occurrences) + section Modes de paiement bg force `#ffffff`. Defense-in-depth dans CSS slot redefinissant la var au niveau `:root`.
7. **Stats "Nos chiffres"** : passe de 30px gris a **80px orange #F48716** dans le `<style>` inline GHL natif (lignes 5526, 5724, 5854 de `1-accueil.html`). Cause : la cascade CSS slot ne battait pas l'inline GHL. Plus icones 140px desktop / 64px mobile + flex column 600px min-height pour aligner avec carte Maps a droite.
8. **Notre mission bande grise** : `#section-loKB4HoZ-r { bg #f8f9fa }` dans `_accueil-css.css:267`. Force `#ffffff !important`.
9. **Reviews iframe size** : initialement 350px, essais 800/1500, 550/1100 (cassait 3-cols), retour a 700/1300 OK 3-cols. Final : iframe interne 700/1300 + wrapper `max-height: 600/850` + `overflow: hidden` pour clip espace blanc apres pagination.
10. **`.pp-avis-section` bg blanc** : `#f9f9f9` -> `#ffffff !important` sur 3 fichiers (`_accueil-css.css:601`, `_soumission-avis-footer.html`, `3-soumission.html:226`).
11. **FAQ trait orange parasit** : `#section-eNgJo7g04tC .heading-_EB9Ic3Uoy h2::after` (decoratif `position:absolute; left:0; width:50px; bg:#F48716`) restait visible quand titre hors champ. Force `display:none + content:none`.
12. **Reviews mobile clip aggressif** : `.ghl-review-wrapper-2 { max-height: 1050 -> 850 }` pour reduire l'espace blanc entre pagination iframe et bouton "Donner mon avis".

### 🔍 Points d'attention pour Antigravity

- **GHL widget reviews `#msgsndr_reviews`** : cross-origin, on ne peut pas styler son interieur. Le widget bascule en mono-colonne en dessous de ~700px iframe height. Si tu modifies cette section, ne descend PAS sous 700px desktop.
- **Stats Accueil agrandies** : si tu retravailles `Nos chiffres`, sache que 80px est direct dans inline GHL (3 selecteurs `.image-feature-XIV7NGseBa/.zIZLW70ekM/.CVqfXg1csT .featureHeadline h2`). Le CSS slot `_accueil-css.css` a aussi un override 5rem !important en backup.
- **Variable GHL `--color-lxs55nfl`** : redefinie a `#ffffff` dans HTML (5 endroits) + CSS slot. Si Antigravity regen un fichier HTML, le CSS slot prend le relais. Anti bande grise #f9f9f9 sur sections natives.
- **Slug `/accueil_index` reste actif** : 64 occurrences dans le code pointent vers ce path. Le root `/` du domaine est gere par Domain Settings (Default Page), pas par slug. Ne pas chercher a tout swapper en `/`.
- **Reviews wrapper `max-height` clip** : iframe interne 700/1300 mais wrapper visible 600/850. Si pagination du widget GHL passe sous le clip (changement nb de pages), elle peut etre cachee. Ajuster `max-height` si signale.

### 📋 Prochaine etape suggeree

- **Pour Rochdi** : recoller `_accueil-css.css` + `1-accueil.html` + autres slots impactes (cf chaque commit pour la liste precise).
- **Pour Antigravity** : tout est en CSS/HTML statique, pas de logique métier. Focus sur la migration React/Cloudflare future (cf memoire `intralys_stack_react_cloudflare.md`) plutot que sur des tweaks visuels deja figes.
- **Pas de tag safety cette session** : 15 commits incrementaux, rollback ciblé via `git revert <sha>` plutot que reset.

### Diff

`c2b28ac..6a0c8a4` (15 commits)

---

## 2026-05-02 21:30 [Claude Code]

### ✅ Realisations

12 commits pousses sur `feat/loi25-compliance` (de 779b794 a 9a4a6ae) :

1. **CTA rename global** : 16 strings "Demander un devis"/"Request a quote" → "Faire nettoyer mes bacs"/"Get my bins cleaned" sur les 4 pages
2. **Force-white v1+v2+v3** sur sections : retire toutes les bandes beige/grises observees sur mobile/cross-browser
   - v1 : body + .fullSection + .c-section + sections custom
   - v2 : + html, hl_page-preview, hl_page-preview--content, main
   - v3 : + .bg.fill-width-height, .c-row, .c-column, .c-wrapper, .inner
3. **Suppression beige A LA SOURCE** : retire les bg #f8f6f1 / #f9f9f9 directement (au lieu d'overrider) sur #section-EvolutionPremium, .mission-section-enhanced, .secondary-services-section, .evolution-upgrade-section
4. **Review gating** (DEMANDE CLIENT, RISQUES EXPLIQUES) : 5★ rating → Google reviews, 1-4★ → /retour. Memoire `poubelle_premium_review_gating_decision.md`
5. **Redirects vers /avis-clients top** : tous les CTA "Donner mon avis" landent en haut de la page Avis (pas au milieu via anchor #star-selector)
6. **Suppression JS legacy auto-redirect /retour** dans 3 footers : c'etait l'ancien systeme qui redirigeait apres click sur widget GHL bleu, devenu obsolete avec le rating gate propre
7. **Section AvisClients2 transparent** + retrait du h2 "Avis de nos clients" (texte noir intrusif)
8. **Fix virgule hero FR** : `<span>etincelants<svg/>,</span>` au lieu de `<span>etincelants<svg/></span>,` (la virgule orphelinait sur mobile)
9. **Force visibilite "Notre mission"** : `opacity:1, visibility:visible` !important pour neutraliser AOS qui buguait sur mobile (titre invisible)

### 🔍 Points d'attention pour Antigravity

- **Le client veut TOUT en blanc** (pas de rythme beige/blanc design). Decision tracee. Si tu veux remettre des bgs beige, coordonner avec Rochdi.
- **Review gating actif** : 5★→Google / 1-4★→/retour. Risques Google Policy + LPC art. 219 expliques au client, decision client. Voir memoire claude `poubelle_premium_review_gating_decision.md`.
- **Animation AOS desactivee sur .mission-title-premium** : si tu retravailles le titre Mission, sache qu'on a force opacity:1 pour fixer un bug d'invisibilite mobile. Si tu touches, tester sur tlph.
- **Bug widget GHL bleu "Rediger un avis"** : c'est dans l'iframe `msgsndr_reviews` (cross-origin), on ne peut pas le modifier. A desactiver cote GHL admin (Reputation → Widgets settings).

### 📋 Prochaine etape suggeree

- **Pour Rochdi** : coller les 12 slots GHL (cf liste dans `poubelle_premium_pending.md`)
- **Pour Antigravity** : si tu reviens sur ce projet, verifier les 4 sections custom dont on a retire le bg beige (mission, evolution, secondary-services, evolution-upgrade) — l'apparence visuelle a change
- **Mission 2 Meta Pixel CAPI** : reportee a une session dediee (pixel actif `986179510496466`)

### Diff

`779b794..9a4a6ae` (12 commits + 9 tags safety)

Tags safety crees :
`pre-body-bg-fix`, `pre-cta-rename`, `pre-review-gating`, `pre-force-white-bg`,
`pre-force-white-v2`, `pre-force-white-v3`, `pre-remove-beige-source`,
`pre-avis-cleanup`, `pre-remove-auto-redirect-retour`

Pour rollback complet de la session : `git reset --hard pre-body-bg-fix && git push --force-with-lease origin feat/loi25-compliance`

---
