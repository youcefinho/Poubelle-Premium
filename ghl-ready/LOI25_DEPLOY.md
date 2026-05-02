# Loi 25 — Guide de déploiement GHL

Ce document explique comment intégrer le banner Loi 25 du Québec sur le site Poubelle Premium servi via GoHighLevel.

> **Statut :** branche `feat/loi25-compliance` • snapshot rollback : `audit-snapshot-2026-05-02`
> **Décision business 2026-05-02** : le Meta Pixel reste **toujours actif** (fire au load), indépendamment du banner. Le banner Consent Mode v2 reste affiché pour la conformité visible Loi 25 et pour les outils tiers futurs (GA4, Clarity, Google Ads), mais **ne contrôle PAS Meta Pixel**.

---

## 1. Ce qui a été fait dans le repo

Tout est intégré directement dans tes 4 paires de fichiers existants. **1 fichier = 1 slot GHL**, comme avant.

### Fichiers modifiés (additif pur — aucune ligne existante touchée)
| Fichier | Modification |
|---|---|
| `_accueil-header.html` | + Consent Mode v2 default DENIED en tête (pour outils tiers futurs) + Meta Pixel inchangé (fire au load) |
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
- Les events `fbq('track', 'Lead', ...)` et `fbq('track', 'CompleteRegistration', ...)` dans les footers : intacts (Pixel browser fire les events comme avant).

---

## 2. Comportement du Meta Pixel (important)

| Action utilisateur | Meta Pixel browser fire ? | Consent Mode v2 flags |
|---|---|---|
| Première visite (banner affiché) | ✅ OUI au load | `ad_storage = denied` (pour autres outils) |
| Clic "Tout accepter" | ✅ OUI (déjà fire) | `ad_storage = granted` |
| Clic "Tout refuser" | ✅ OUI (toujours actif) | `ad_storage = denied` (mais Meta n'utilise pas ce flag) |
| Clic "Personnaliser → Marketing OFF" | ✅ OUI (toujours actif) | `ad_storage = denied` |

**Conséquence** : tu reçois 100 % des données Meta Pixel, indépendamment du banner. Les events `Lead`, `Contact`, `CompleteRegistration`, `PageView` fire normalement.

⚠️ **Note légale** : c'est techniquement non conforme à la Loi 25 stricte. Décision business assumée par le client.

---

## 3. Séquence de déploiement GHL

Pour chaque page GHL (Accueil, Avis, Soumission, Retour) :

### Étape A — Header Tracking
1. GHL → **Sites** → **Pages** → page concernée → **Paramètres** → **Suivi de code tête de page** (Header Tracking)
2. **Remplacer intégralement** le contenu actuel par le contenu du fichier `_*-header.html` correspondant
3. Sauvegarder

### Étape B — Footer Tracking
1. Même page GHL → **Suivi de code pied de page** (Footer Tracking)
2. **Remplacer intégralement** le contenu actuel par le contenu du fichier `_*-footer.html` correspondant (animations + Swiper + FAQ + Meta Pixel events + banner Loi 25 — tout est dedans)
3. Sauvegarder

### Étape C — Créer les pages légales
1. GHL → créer une nouvelle page nommée **"Confidentialité"**, slug `/confidentialite`
2. Headers/Footer slots : réutiliser ceux d'une page existante (par ex. `_accueil-*`)
3. **Custom Code Body** : coller le contenu intégral de `5-confidentialite.html`
4. Idem pour `/mentions-legales` avec `6-mentions-legales.html`

### Étape D — Liens dans le footer visible du site
Ajouter dans le footer du site (composant Footer du builder GHL, pas le slot Footer Tracking) :
- **Politique de confidentialité** → `/confidentialite`
- **Mentions légales** → `/mentions-legales`
- (optionnel) **Gérer mes cookies** → `<a href="#pp-consent-open" class="pp-consent-open">Gérer mes cookies</a>` (rouvre le banner)

---

## 4. Tests

### Test 1 — Banner s'affiche
1. Navigation privée → `poubellepremium.ca/accueil_index`
2. ✅ Banner consent apparaît (centré bas)
3. ✅ Console F12 → Network → `fbevents.js` se charge **immédiatement** (Pixel actif au load)
4. Recharger → banner réapparaît tant qu'aucun choix fait

### Test 2 — Pixel toujours actif après refus
1. Cliquer **"Tout refuser"**
2. ✅ Banner disparaît, bouton flottant 🍪 apparaît
3. Recharger
4. ✅ Network → `fbevents.js` toujours présent, requête `tr?id=986179510496466&ev=PageView` envoyée
5. Soumettre form devis → ✅ event `Lead` envoyé à Meta

### Test 3 — Pages légales accessibles
1. Footer du site → "Politique de confidentialité" → ouvre `/confidentialite`
2. ✅ Page lisible FR/EN
3. Bouton "Gérer mes cookies" → ouvre le banner

---

## 5. Cleanup Meta (CAPI annulé)

Vu que la décision business est de **garder uniquement le Pixel browser** (pas de CAPI), tu peux nettoyer côté Meta :

### A — Révoquer le token CAPI généré
Si tu avais déjà généré un token Meta CAPI :
1. Meta Business Manager → **Events Manager** → Pixel "Poubelle premium pp"
2. Onglet **Paramètres** → section **API Conversions**
3. Trouve le token généré → bouton **"Révoquer"** ou **"Supprimer"**
4. Confirme

Si tu ne le révoques pas, ce n'est pas grave (le token n'est utilisé nulle part). Mais c'est plus propre de le révoquer.

### B — Désassocier l'intégration Meta CAPI directe
Si tu avais cliqué sur **"Associer maintenant"** dans la section **"Configurer avec Meta"** :
1. Events Manager → Pixel "Poubelle premium pp" → Paramètres → **API Conversions**
2. Section **"Configurer avec Meta"** → si une intégration apparaît → **"Désassocier"** ou **"Déconnecter"**

### C — System User Conversions API (optionnel)
Le System User "Conversions API System User" peut rester. Il ne fait rien tant qu'il n'a pas de token actif.

Si tu veux vraiment tout nettoyer : Business Settings → Utilisateurs Système → "Conversions API System User" → retirer les permissions sur le Pixel "Poubelle premium pp".

---

## 6. Rollback en cas de problème

### Côté GHL (rapide)
Restaurer dans Header Tracking le bloc original (sans Consent Mode et sans wrapper) :
```html
<meta name="facebook-domain-verification" content="7jm1m5hbiu8ua59wvj79278i5h0qyb" />
... preconnect / dns-prefetch ...
<!-- Meta Pixel Code -->
<script>!function(f,b,e,v,n,t,s){...}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','986179510496466');fbq('track','PageView');</script>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=986179510496466&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->
```
Et retirer la section banner Loi 25 du Footer Tracking (chercher `<!-- ===== Loi 25 Banner Consent` et supprimer jusqu'à la fin).

### Côté repo (git)
```bash
cd "Poubelle Premium"
git checkout main
git branch -D feat/loi25-compliance
# ou pour revenir au snapshot pré-audit :
git reset --hard audit-snapshot-2026-05-02
```

---

## 7. Crédits & contact

- **Conformité** : banner Loi 25 affiché (sans bloquer Meta Pixel — décision business)
- **Référence CAI** : https://www.cai.gouv.qc.ca
- **Pixel ID** : 986179510496466 (Meta Business)
- **Domain Verification** : `7jm1m5hbiu8ua59wvj79278i5h0qyb`
- **Date d'intégration** : 2026-05-02
- **Branche** : `feat/loi25-compliance` (à merger dans `main` après validation déploiement GHL)
