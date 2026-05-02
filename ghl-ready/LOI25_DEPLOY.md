# Loi 25 — Guide de déploiement GHL

Ce document explique comment intégrer la conformité **Loi 25 du Québec** dans le site Poubelle Premium servi via GoHighLevel.

> **Statut :** branche `feat/loi25-compliance` • snapshot rollback : `audit-snapshot-2026-05-02`
> **Risque :** modéré sur le tracking. L'ordre des étapes ci-dessous **garantit zéro coupure de tracking** pour les visiteurs qui ont déjà consenti.

---

## 1. Ce qui a été fait dans le repo

Tout est intégré directement dans tes 4 paires de fichiers existants. **1 fichier = 1 slot GHL**, comme avant.

### Fichiers modifiés (additif pur — aucune ligne existante touchée)
| Fichier | Modification |
|---|---|
| `_accueil-header.html` | + Consent Mode v2 default DENIED en tête + Pixel wrappé dans `window.ppLoadMetaPixel` + auto-load si consent stocké |
| `_avis-header.html` | Idem |
| `_soumission-header.html` | Idem |
| `_retour-header.html` | Idem |
| `_accueil-footer.html` | + banner Loi 25 (CSS + DOM + handlers) ajouté à la fin |
| `_avis-footer.html` | Idem |
| `_soumission-footer.html` | Idem |
| `_retour-footer.html` | Idem |

### Pages nouvelles (à créer dans GHL)
| Fichier | Rôle |
|---|---|
| `5-confidentialite.html` | Politique de confidentialité (FR/EN) — Body de la nouvelle page `/confidentialite` |
| `6-mentions-legales.html` | Mentions légales (FR/EN) — Body de la nouvelle page `/mentions-legales` |

### Fichiers NON modifiés (volontaire)
- Le `dist/` (Cloudflare Pages) : intact. Focus sur GHL natif.
- Les liens internes vers `/accueil_index` : intacts. Coexistence v1+v2 voulue.

---

## 2. Séquence de déploiement GHL (ORDRE OBLIGATOIRE)

⚠️ **Respecter l'ordre.** Sinon les nouveaux visiteurs perdent le Meta Pixel pendant l'intervalle.

### Étape A — Footer Tracking (en PREMIER)
Pour chaque page GHL (Accueil, Avis, Soumission, Retour) :

1. GHL → **Sites** → **Pages** → page concernée → **Settings** → **Custom Code** → **Footer Tracking**
2. **Remplacer intégralement** le contenu actuel par le contenu du fichier `_*-footer.html` correspondant (animations + Swiper + FAQ + tracking events + banner Loi 25 — tout est dedans)
3. Sauvegarder

À ce stade : le banner s'affiche au premier chargement. Le Header tracking n'est pas encore mis à jour, donc **le Pixel se charge toujours sans condition** → tracking actuel conservé. ✅ Aucune coupure.

### Étape B — Header Tracking (APRÈS l'étape A)
Pour chaque page GHL :

1. GHL → page → **Settings** → **Custom Code** → **Header Tracking**
2. **Remplacer intégralement** le contenu actuel par le contenu du fichier `_*-header.html` correspondant
3. Sauvegarder

À ce stade :
- Le Pixel ne se charge plus automatiquement.
- Si l'utilisateur avait **déjà accepté** lors d'une visite < 12 mois (étape A déployée avant) : `localStorage.pp_consent_v1` est lu, `ppLoadMetaPixel()` est rappelé immédiatement, **tracking continu**.
- Si l'utilisateur n'avait pas encore consenti : le banner s'affiche, et le Pixel ne charge qu'après "Tout accepter" ou "Personnaliser → Marketing ON → Enregistrer".

### Étape C — Créer les pages légales
1. GHL → créer une nouvelle page nommée **"Confidentialité"**, slug `/confidentialite`
2. Headers/Footer/CSS slots : réutiliser ceux d'une page existante (par exemple les fichiers d'`_accueil-*` ou `_avis-*` — les modifs Loi 25 s'appliquent ainsi automatiquement)
3. **Custom Code Body** : coller le contenu intégral de `5-confidentialite.html`
4. Idem pour `/mentions-legales` avec `6-mentions-legales.html`

### Étape D — Liens dans le footer visible du site
Le banner pointe déjà vers `/confidentialite` via le lien "En savoir plus". Pour la conformité complète, ajouter aussi dans le footer visible du site (composant Footer du builder GHL, pas le slot Footer Tracking) :
- "Politique de confidentialité" → `/confidentialite`
- "Mentions légales" → `/mentions-legales`
- (optionnel) "Gérer mes cookies" → `<a href="#pp-consent-open" class="pp-consent-open">Gérer mes cookies</a>` (rouvre le banner)

---

## 3. Test de validation après déploiement

### Test 1 — Visiteur qui n'a jamais consenti
1. Naviguer en **navigation privée** sur `poubellepremium.ca/accueil_index`
2. ✅ Banner consent apparaît en bas-droite (desktop) ou plein bas (mobile)
3. ✅ Console F12 → Network → `fbevents.js` doit être **absent** (Pixel pas chargé)
4. Cliquer **"Tout accepter"**
5. ✅ Banner disparaît, bouton flottant 🍪 apparaît bas-gauche
6. ✅ Network : `fbevents.js` se charge, requête `tr?id=986179510496466&ev=PageView`
7. Recharger
8. ✅ Banner ne réapparaît pas (consent stocké), Pixel charge auto

### Test 2 — Visiteur qui refuse
1. Console : `localStorage.clear()`, recharger
2. ✅ Banner réapparaît
3. Cliquer **"Tout refuser"**
4. ✅ Network : `fbevents.js` toujours **absent**
5. ✅ Recharger : banner ne réapparaît plus (refus stocké 12 mois)

### Test 3 — Visiteur qui personnalise
1. `localStorage.clear()`, recharger
2. Cliquer **"Personnaliser"** → Activer **uniquement Marketing** → "Enregistrer"
3. ✅ Pixel se charge mais `analytics_storage` reste denied dans Consent Mode

### Test 4 — Bilingue
1. Toggle FR/EN dans la navbar → ✅ Banner et trigger flottant changent de langue
2. ✅ Pages `/confidentialite` et `/mentions-legales` aussi (sections `.fr-block` et `.en-block`)

### Test 5 — Lien "Gérer mes cookies"
1. Cliquer le bouton flottant 🍪 ou un lien `<a href="#pp-consent-open">`
2. ✅ Banner se rouvre avec choix actuels prérenseignés
3. Modifier, sauvegarder → ✅ Pixel se (dé)charge selon le choix au prochain reload

### Test 6 — Tracking events restent fonctionnels
Vérifier que les events `Contact`, `Lead`, `CompleteRegistration` continuent quand le Pixel est chargé :
1. Accepter le banner
2. Cliquer un lien `tel:` → ✅ event `Contact` envoyé (Network : `tr?id=...&ev=Contact`)
3. Soumettre le formulaire de devis → ✅ event `Lead` envoyé
4. Soumettre la page Retour → ✅ event `CompleteRegistration` envoyé

---

## 4. Rollback en cas de problème

### Rollback côté GHL (rapide)
Pour chaque page, restaurer dans Header Tracking le bloc Meta Pixel original :
```html
<!-- Meta Pixel Code -->
<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','986179510496466');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=986179510496466&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
```
Et retirer la section banner Loi 25 du Footer Tracking (chercher `<!-- ===== Loi 25 Banner Consent` et supprimer jusqu'à la fin).

### Rollback côté repo (git)
```bash
cd "Poubelle Premium"
git checkout main
git branch -D feat/loi25-compliance   # supprime la branche locale
# ou pour revenir au snapshot pré-audit :
git reset --hard audit-snapshot-2026-05-02
```

---

## 5. Impact attendu sur le tracking

### Visiteurs qui avaient déjà consenti (visite < 12 mois)
- **Aucun impact** : `localStorage.pp_consent_v1` lu au load, `ppLoadMetaPixel()` rappelé immédiatement.

### Visiteurs nouveaux ou sans consent valide
- Banner affiché → 3 issues :
  - ~70% acceptent (taux moyen industrie : 60–80%) → Pixel chargé, events `Contact`, `Lead`, `CompleteRegistration` continuent normalement
  - ~20% refusent → Pixel jamais chargé pour cette session
  - ~10% ignorent → banner reste affiché → pas de tracking jusqu'au choix

### Comparaison
- **Avant Loi 25** : 100% trackés (mais site illégal)
- **Après Loi 25** : ~70–80% trackés, conforme légalement
- **Mitigation** : Conversions API serveur-side (Meta CAPI) = capture dual-side, retrouve une partie des 20–30% perdus côté browser

---

## 6. Améliorations futures

- [ ] Conversions API Meta serveur-side (Cloudflare Worker → Meta Graph API)
- [ ] GA4 + Google Ads (placeholders `GTM-XXXXXXX`, `AW-XXXXX` toujours en commentaires) → activer quand IDs créés
- [ ] Microsoft Clarity (analytics anonyme conforme Loi 25 par défaut)
- [ ] Auto-générer `sitemap.xml` GHL pour inclure `/confidentialite` et `/mentions-legales`
- [ ] Vérifier banner sur Safari iOS en navigation privée (`localStorage` peut être bloqué)
- [ ] (Migration v1→v2) Quand l'ancien site GHL sera décommissionné, basculer le `/` du domaine sur `/accueil_index` et nettoyer les redirects 301

---

## 7. Crédits & contact

- **Conformité** : Loi 25 du Québec (LPRPSP), entrée en vigueur 2024
- **Référence CAI** : https://www.cai.gouv.qc.ca
- **Pixel ID** : 986179510496466 (Meta Business)
- **Domain Verification** : `7jm1m5hbiu8ua59wvj79278i5h0qyb`
- **Date d'intégration** : 2026-05-02
- **Branche** : `feat/loi25-compliance` (à merger dans `main` après validation déploiement GHL)
