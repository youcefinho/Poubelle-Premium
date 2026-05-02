# Meta CAPI Worker — Poubelle Premium

Worker Cloudflare qui reçoit les webhooks GHL et forward à Meta Conversions API.

> **Pourquoi ?** Quand un user refuse les cookies marketing, le Pixel browser ne se charge pas (Loi 25 ✓). Mais quand il soumet un formulaire (action explicite), on remonte la conversion à Meta serveur-side via CAPI. Récupère ~80% du tracking perdu, légalement.

---

## Architecture

```
User remplit form GHL
    ↓
GHL webhook (workflow "Send Webhook")
    ↓
POST https://poubelle-meta-capi.<compte>.workers.dev/
    ↓ (Authorization: Bearer SHARED_SECRET)
Worker hash email/phone (SHA-256)
    ↓
POST graph.facebook.com/v18.0/{PIXEL_ID}/events
    ↓ (access_token: EAA...)
Meta voit la conversion ✓
```

---

## Déploiement (10 minutes)

### Pré-requis
- Compte Cloudflare avec accès au compte qui héberge `poubelle-premium` Pages
- Token Meta CAPI (généré dans Business Manager → System Users → Generate Token)
- Bun installé (ou npm/npx)

### 1. Cloner ce dossier sur ton poste
```bash
cd "Poubelle Premium/meta-capi-worker"
```

### 2. Login Cloudflare
```bash
bunx wrangler login
```

### 3. Configurer les secrets
```bash
# Le token Meta CAPI (le coller quand demandé, sans guillemets)
bunx wrangler secret put META_ACCESS_TOKEN

# Une longue chaîne aléatoire pour sécuriser l'endpoint (générer avec : openssl rand -hex 32)
bunx wrangler secret put SHARED_SECRET

# OPTIONNEL : code de test pour debugger sans polluer la prod
# (le récupérer dans Meta Events Manager → Test Events → Test Event Code)
bunx wrangler secret put META_TEST_EVENT_CODE
```

### 4. Déployer
```bash
bunx wrangler deploy
```

Tu obtiens une URL du type :
```
https://poubelle-meta-capi.<ton-compte>.workers.dev
```

### 5. Vérifier que ça marche
Ouvre l'URL dans ton navigateur (GET) → tu dois voir un JSON :
```json
{
  "status": "ok",
  "service": "poubelle-meta-capi",
  "pixel_id": "986179510496466",
  "has_access_token": true,
  "has_shared_secret": true,
  "test_mode": false
}
```

---

## Configuration GHL (workflow webhook)

### Étape 1 — Aller dans le workflow d'un formulaire
1. GHL → **Automation** → **Workflows**
2. Choisis le workflow déclenché par "Form Submitted" (devis, soumission)
3. Si pas de workflow : créer un nouveau → Trigger = "Form Submitted" → choisir le formulaire

### Étape 2 — Ajouter une action "Send Webhook"
1. + Add Action → **Send Webhook** (ou **Webhook** dans certaines versions)
2. URL : `https://poubelle-meta-capi.<ton-compte>.workers.dev/`
3. Method : **POST**
4. Headers :
   - `Authorization` : `Bearer <ton SHARED_SECRET>` (le même que dans Cloudflare)
   - `Content-Type` : `application/json`
5. Body (JSON) — utiliser les variables GHL `{{contact.X}}` :
```json
{
  "event_name": "Lead",
  "event_id": "{{contact.id}}-{{event.timestamp}}",
  "event_source_url": "https://poubellepremium.ca/soumission",
  "email": "{{contact.email}}",
  "phone": "{{contact.phone}}",
  "first_name": "{{contact.first_name}}",
  "last_name": "{{contact.last_name}}",
  "city": "{{contact.city}}",
  "zip": "{{contact.postal_code}}",
  "user_agent": "{{contact.user_agent}}",
  "fbclid": "{{contact.fbclid}}",
  "fbp": "{{contact.fbp}}",
  "content_name": "Devis bacs",
  "content_category": "devis",
  "value": 0,
  "currency": "CAD"
}
```

> ⚠️ Les variables `{{contact.fbclid}}`, `{{contact.fbp}}`, `{{contact.user_agent}}` n'existent peut-être pas par défaut dans GHL. Si elles n'existent pas, on les capturera côté browser et on les passera via custom field. Voir section "Capture fbclid" plus bas.

### Étape 3 — Tester en mode debug
1. Dans Meta Events Manager → Test Events → copier le **Test Event Code**
2. Le configurer dans Cloudflare via `bunx wrangler secret put META_TEST_EVENT_CODE`
3. Redéployer : `bunx wrangler deploy`
4. Soumets un formulaire test
5. ✅ Tu dois voir l'event apparaître dans Meta Events Manager → Test Events en quelques secondes
6. **Une fois validé**, supprimer le test code : `bunx wrangler secret delete META_TEST_EVENT_CODE` puis redéployer

---

## Capture fbclid côté browser (pour attribution Meta Ads)

Si tu utilises Meta Ads, le browser doit capturer le `?fbclid=XXX` de l'URL au premier visit et l'envoyer avec le form.

### Snippet à ajouter dans `_*-footer.html` (j'enchaîne après si tu valides)
```js
// Capture fbclid au premier visit, persiste 90 jours en localStorage
(function() {
  try {
    var url = new URL(window.location.href);
    var fbclid = url.searchParams.get('fbclid');
    if (fbclid) {
      localStorage.setItem('pp_fbclid', fbclid);
      localStorage.setItem('pp_fbclid_date', String(Date.now()));
    }
  } catch(e) {}
})();
```

Puis dans le form GHL, ajouter un custom field hidden qui lit `localStorage.getItem('pp_fbclid')` au submit.

---

## Test local (sans déployer)

```bash
bunx wrangler dev
```

Puis dans un autre terminal :
```bash
# Health check
curl http://localhost:8787

# Test event
curl -X POST http://localhost:8787 \
  -H "Authorization: Bearer <ton SHARED_SECRET>" \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "Lead",
    "email": "test@example.com",
    "phone": "+14387994449",
    "value": 0,
    "currency": "CAD"
  }'
```

---

## Sécurité

- ✅ **Auth Bearer** : sans le `SHARED_SECRET` correct dans le header `Authorization`, le Worker rejette en 401
- ✅ **Hash SHA-256** : email, téléphone, nom, prénom, ville, code postal hashés avant envoi à Meta
- ✅ **Pas de logs PII** : le Worker ne stocke aucune donnée personnelle (pas de KV, pas de D1)
- ✅ **HTTPS forcé** : Cloudflare Workers servent uniquement en HTTPS
- ✅ **Rate limiting** : optionnel à ajouter via Cloudflare WAF si abuse détecté

---

## Conformité Loi 25

Le Worker respecte la Loi 25 du Québec :
- Le user a fait une **action explicite** (form submit) qui implique consentement business pour le traitement de sa demande
- Les données sont **hashées** avant transmission à Meta (Meta ne peut pas réidentifier sans matching)
- La finalité = **mesure de performance publicitaire** (intérêt légitime)
- C'est mentionné dans `/confidentialite` (politique de confidentialité)

Si tu veux strict-conforme : ajouter un check du consent avant d'envoyer à CAPI. Dans ce cas, GHL devrait passer le consent state dans le webhook (custom field), et le Worker filtrer.

---

## Maintenance

### Renouveler le token Meta
Les tokens System User n'expirent pas par défaut. Si Meta le révoque (sécurité), regénérer dans Business Manager et :
```bash
bunx wrangler secret put META_ACCESS_TOKEN
bunx wrangler deploy
```

### Voir les logs
```bash
bunx wrangler tail
```
Ou Dashboard Cloudflare → Workers → poubelle-meta-capi → Logs.

### Supprimer le Worker
```bash
bunx wrangler delete poubelle-meta-capi
```
