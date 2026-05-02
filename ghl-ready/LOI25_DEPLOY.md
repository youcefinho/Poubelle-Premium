# Loi 25 — Guide de déploiement GHL

Ce document explique comment intégrer la conformité **Loi 25 du Québec** dans le site Poubelle Premium servi via GoHighLevel (slug `/accueil_index` et compagnie).

> **Statut :** branche `feat/loi25-compliance` • snapshot rollback : `audit-snapshot-2026-05-02`
> **Risque :** modéré sur le tracking (le Meta Pixel devient conditionnel). L'ordre des étapes ci-dessous **garantit zéro coupure de tracking** pour les visiteurs qui ont déjà consenti.

---

## 1. Ce qui a été fait dans le repo (lecture seule)

### Fichiers source autonomes créés
| Fichier | Rôle | Où coller dans GHL |
|---|---|---|
| `_loi25-header.html` | Source de vérité — Consent Mode v2 + Pixel conditionnel | Référence (ne pas coller, déjà intégré dans les 4 _*-header.html ci-dessous) |
| `_loi25-footer.html` | Source de vérité — banner consent inline (CSS + DOM + handlers) | Footer Tracking de chaque page (en addition de l'existant) |
| `5-confidentialite.html` | Page autonome Politique de confidentialité (FR/EN) | Custom Code Body d'une nouvelle page GHL `/confidentialite` |
| `6-mentions-legales.html` | Page autonome Mentions légales (FR/EN) | Custom Code Body d'une nouvelle page GHL `/mentions-legales` |

### Fichiers modifiés (chirurgical, additif au début + remplacement bloc Pixel)
| Fichier | Modification |
|---|---|
| `_accueil-header.html` | Ajout Consent Mode v2 default DENIED en tête + Pixel wrappé dans `window.ppLoadMetaPixel` + auto-load si consent stocké |
| `_avis-header.html` | Idem |
| `_soumission-header.html` | Idem |
| `_retour-header.html` | Idem |

### Fichiers NON modifiés (volontaire)
- Les 4 `_*-footer.html` existants : intacts. Le banner reste **uniquement** dans `_loi25-footer.html` (source unique, évite 4× duplication de 200 lignes).
- Le `dist/` : intact. Le user a confirmé que le focus est sur `ghl-ready/`.
- Les liens internes vers `/accueil_index` : intacts. C'est de la coexistence v1+v2 voulue (mémoire `feedback_migration_order_safety`).

---

## 2. Séquence de déploiement GHL (ORDRE OBLIGATOIRE)

⚠️ **Respecter l'ordre.** Si tu fais l'étape B avant l'étape A, les visiteurs perdent le Meta Pixel pendant l'intervalle de déploiement.

### Étape A — Coller le banner (Footer Tracking) — fait en PREMIER
Pour chaque page GHL (Accueil, Avis, Soumission, Retour) :

1. GHL → **Sites** → **Pages** → page concernée → **Settings** → **Custom Code** → **Footer Tracking**
2. Garder le contenu actuel **tel quel** (animations, Swiper, FAQ, switchLang, click handlers Meta, etc.)
3. **Coller à la suite** (en bas) le contenu intégral de `_loi25-footer.html`
4. Sauvegarder

À ce stade : le banner s'affiche au premier chargement. Mais comme le Header tracking n'est pas encore mis à jour, **le Pixel se charge toujours sans condition** → tracking actuel conservé. ✅ Aucune coupure.

### Étape B — Mettre à jour le Header Tracking — fait APRÈS l'étape A
Pour chaque page GHL :

1. GHL → page → **Settings** → **Custom Code** → **Header Tracking**
2. **Remplacer intégralement** le contenu actuel par le contenu de `_*-header.html` correspondant (le bon fichier selon la page)
3. Sauvegarder

À ce stade :
- Le Pixel ne se charge plus automatiquement.
- Si l'utilisateur avait **déjà accepté** lors d'une visite < 12 mois : le `localStorage.pp_consent_v1` est lu, `ppLoadMetaPixel()` est rappelé immédiatement, **tracking continu**.
- Si l'utilisateur n'avait pas encore consenti : le banner s'affiche, et le Pixel ne charge qu'après "Tout accepter" ou "Personnaliser → Marketing ON → Enregistrer".

### Étape C — Créer les pages légales
1. GHL → créer une nouvelle page nommée **"Confidentialité"**, slug `/confidentialite`
2. Headers/Footer/CSS slots : utiliser les mêmes que ceux d'une page existante (réutiliser `_accueil-*` ou `_avis-*` au choix — ainsi les modifs Loi 25 s'appliquent)
3. **Custom Code Body** : coller le contenu intégral de `5-confidentialite.html`
4. Idem pour `/mentions-legales` avec `6-mentions-legales.html`

### Étape D — Ajouter les liens dans le footer du site
Le banner pointe déjà vers `/confidentialite` via le bouton "En savoir plus". Mais pour être conforme, ajouter aussi des liens dans le footer visible du site :

Dans GHL, éditer le footer (composant Footer du builder, pas le slot Footer Tracking) → ajouter 2 liens :
- "Politique de confidentialité" → `/confidentialite`
- "Mentions légales" → `/mentions-legales`
- (optionnel) "Gérer mes cookies" → lien `<a href="#pp-consent-open" class="pp-consent-open">` (rouvre le banner)

---

## 3. Test de validation après déploiement

### Test 1 — Visiteur qui n'a jamais consenti
1. Naviguer en **navigation privée** sur `poubellepremium.ca/accueil_index`
2. ✅ Banner consent doit apparaître en bas-droite (ou bas en mobile)
3. ✅ Cliquer **F12 → Network → fbevents.js** : doit être **absent** (Pixel pas encore chargé)
4. Cliquer **"Tout accepter"**
5. ✅ Banner disparaît, bouton flottant cookie 🍪 apparaît bas-gauche
6. ✅ Network : `fbevents.js` se charge, `tr?id=986179510496466&ev=PageView` est appelé
7. Recharger la page
8. ✅ Banner ne réapparaît pas (consent stocké), Pixel se charge automatiquement

### Test 2 — Visiteur qui refuse
1. Vider le localStorage : `localStorage.clear()` dans la console
2. Recharger
3. ✅ Banner réapparaît
4. Cliquer **"Tout refuser"**
5. ✅ Banner disparaît
6. ✅ Network : `fbevents.js` toujours **absent**
7. ✅ Recharger : banner ne réapparaît plus (refus stocké 12 mois), Pixel reste absent

### Test 3 — Visiteur qui personnalise
1. `localStorage.clear()`, recharger
2. Cliquer **"Personnaliser"**
3. ✅ Toggles "Mesure d'audience" et "Marketing" apparaissent (off par défaut)
4. Activer **uniquement Marketing**, cliquer **"Enregistrer mes choix"**
5. ✅ Pixel se charge, mais analytics_storage reste denied dans Consent Mode

### Test 4 — Bilingue
1. Toggle FR/EN dans la navbar du site
2. ✅ Banner et trigger flottant changent de langue
3. ✅ Pages `/confidentialite` et `/mentions-legales` aussi (sections `.fr-block` et `.en-block`)

### Test 5 — Lien "Gérer mes cookies"
1. Cliquer le bouton flottant 🍪 ou un lien `<a href="#pp-consent-open">`
2. ✅ Banner se rouvre avec les choix actuels prérenseignés
3. Modifier les choix, sauvegarder
4. ✅ Pixel se charge ou se "désinitialise" (au prochain reload, ne se chargera plus)

---

## 4. Rollback en cas de problème

### Rollback côté GHL (rapide)
Pour chaque page, copier-coller en arrière le **bloc Meta Pixel original** dans Header Tracking :
```html
<!-- Meta Pixel Code -->
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','986179510496466');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=986179510496466&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
```
Et retirer le bloc `_loi25-footer.html` du Footer Tracking.

### Rollback côté repo (git)
```bash
cd "Poubelle Premium"
git checkout main
git branch -D feat/loi25-compliance   # supprime la branche locale
# ou pour garder une trace mais revenir au snapshot pré-audit :
git reset --hard audit-snapshot-2026-05-02
```

---

## 5. Impact attendu sur le tracking

### Visiteurs qui avaient déjà consenti (visite < 12 mois)
- **Aucun impact** : `localStorage.pp_consent_v1` lu au load, `ppLoadMetaPixel()` rappelé immédiatement.
- Le `gtag('consent','update',...)` est aussi rappelé pour le Consent Mode v2.

### Visiteurs nouveaux ou sans consent valide
- Banner affiché → 3 issues possibles :
  - ~70% acceptent (industrie : taux moyen 60–80%) → Pixel chargé, événements `Lead`, `Contact`, `PageView` continuent normalement
  - ~20% refusent → Pixel jamais chargé pour cette session
  - ~10% ignorent → banner reste affiché jusqu'à un choix → pas de tracking jusque là

### Comparaison
- **Avant Loi 25** : 100% des visiteurs trackés (mais site illégal)
- **Après Loi 25** : ~70–80% des visiteurs trackés, conforme légalement
- **Mitigation** : ajouter Conversions API serveur-side (Meta CAPI) = capture dual-side, retrouve une partie des 20–30% perdus côté browser

---

## 6. Améliorations futures (non bloquantes)

- [ ] Conversions API Meta serveur-side (Cloudflare Worker → Meta Graph API) pour récupérer le tracking côté serveur
- [ ] GA4 + Google Ads (placeholders `GTM-XXXXXXX`, `AW-XXXXX` toujours en commentaires) → activer quand IDs créés
- [ ] Microsoft Clarity (analytics anonyme conforme Loi 25 par défaut)
- [ ] Ajouter Centris-style breadcrumb sur les pages légales pour SEO
- [ ] Tester banner sur Safari (iOS) — vérifier que `localStorage` n'est pas bloqué en navigation privée
- [ ] Auto-générer `sitemap.xml` GHL pour inclure les nouvelles pages `/confidentialite` et `/mentions-legales`
- [ ] (Migration v1→v2) Quand l'ancien site GHL sera décommissionné, basculer le `/` du domaine sur `/accueil_index` et nettoyer les redirects 301

---

## 7. Crédits & contact

- **Conformité** : Loi 25 du Québec (LPRPSP), entrée en vigueur 2024
- **Référence CAI** : https://www.cai.gouv.qc.ca
- **Pixel ID** : 986179510496466 (Meta Business)
- **Domain Verification** : `7jm1m5hbiu8ua59wvj79278i5h0qyb`
- **Date d'intégration** : 2026-05-02
- **Branche** : `feat/loi25-compliance` (à merger dans `main` après validation déploiement)
