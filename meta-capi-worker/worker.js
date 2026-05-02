/**
 * Poubelle Premium — Meta Conversions API (CAPI) Worker
 * ======================================================
 * Recoit les webhooks GHL (form submit, etc.) et forward a Meta CAPI.
 *
 * Endpoint : https://poubelle-meta-capi.<ton-compte>.workers.dev/
 * Methode : POST
 * Content-Type : application/json
 *
 * Headers requis :
 *   Authorization: Bearer <SHARED_SECRET>   (pour empecher abuse)
 *
 * Body JSON attendu (depuis GHL workflow) :
 * {
 *   "event_name": "Lead",                       // requis : Lead, Contact, CompleteRegistration, Purchase, etc.
 *   "event_id": "abc-123",                      // optionnel mais recommande (dedup avec browser pixel)
 *   "event_source_url": "https://...",          // URL ou la conversion a eu lieu
 *   "fbclid": "fb.1.XXX.YYY",                   // optionnel : fbclid de l'URL si pub Meta
 *   "fbp": "fb.1.XXX.YYY",                      // optionnel : cookie _fbp
 *   "user_agent": "Mozilla/...",                // optionnel : User-Agent du visiteur
 *   "email": "user@example.com",                // optionnel mais recommande
 *   "phone": "+1-438-XXX-XXXX",                 // optionnel mais recommande
 *   "first_name": "Jean",                       // optionnel
 *   "last_name": "Dupont",                      // optionnel
 *   "city": "Laval",                            // optionnel
 *   "zip": "H7L 1X1",                           // optionnel (5 premiers chars utilises)
 *   "value": 0,                                 // optionnel : valeur monetaire
 *   "currency": "CAD",                          // optionnel : par defaut CAD
 *   "content_name": "Devis bacs",               // optionnel : nom du formulaire
 *   "content_category": "devis"                 // optionnel : categorie
 * }
 *
 * Variables d'environnement (a configurer dans Cloudflare Dashboard) :
 *   META_PIXEL_ID       : 986179510496466 (PUBLIC, OK en var)
 *   META_ACCESS_TOKEN   : EAA... (SECRET, jamais en clair dans le repo)
 *   SHARED_SECRET       : (SECRET, longue chaine aleatoire pour auth Authorization header)
 *   META_TEST_EVENT_CODE: TEST12345 (OPTIONNEL : seulement pour les tests, vider en prod)
 *
 * Conformite Loi 25 :
 *   - Le Worker n'est appele QUE quand un user soumet un formulaire (action explicite).
 *   - Toutes les donnees PII sont hashees SHA-256 avant envoi (Meta ne peut pas
 *     reidentifier sans matching avec son propre dataset).
 *   - Le banner consent cote browser reste prioritaire pour le Pixel browser.
 *   - CAPI cote serveur fonctionne en parallele : meme si user refuse browser,
 *     la conversion remonte (legitimate interest : mesure de performance).
 *   - La politique de confidentialite mentionne le transfert vers Meta.
 */

export default {
  async fetch(request, env, ctx) {
    // CORS preflight (au cas ou le Worker est appele depuis un browser)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Health check (utile pour verifier que le Worker est deploye)
    if (request.method === 'GET') {
      return jsonResponse(
        {
          status: 'ok',
          service: 'poubelle-meta-capi',
          pixel_id: env.META_PIXEL_ID || 'NOT_CONFIGURED',
          has_access_token: !!env.META_ACCESS_TOKEN,
          has_shared_secret: !!env.SHARED_SECRET,
          test_mode: !!env.META_TEST_EVENT_CODE,
        },
        200
      );
    }

    // Tout le reste : POST attendu
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    // Auth : verifier Authorization header
    const auth = request.headers.get('Authorization') || '';
    const expectedAuth = `Bearer ${env.SHARED_SECRET}`;
    if (!env.SHARED_SECRET || auth !== expectedAuth) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    // Verifier config minimale
    if (!env.META_PIXEL_ID || !env.META_ACCESS_TOKEN) {
      return jsonResponse({ error: 'Server misconfigured (missing Meta credentials)' }, 500);
    }

    // Parser le body
    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'Invalid JSON body' }, 400);
    }

    // Construire l'event Meta CAPI
    const userData = {
      em: await hashIfPresent(normalizeEmail(payload.email)),
      ph: await hashIfPresent(normalizePhone(payload.phone)),
      fn: await hashIfPresent(normalizeName(payload.first_name)),
      ln: await hashIfPresent(normalizeName(payload.last_name)),
      ct: await hashIfPresent(normalizeName(payload.city)),
      zp: await hashIfPresent(normalizeZip(payload.zip)),
      country: await hashIfPresent('ca'), // Quebec = Canada toujours
      client_ip_address: request.headers.get('CF-Connecting-IP') || undefined,
      client_user_agent: payload.user_agent || request.headers.get('User-Agent') || undefined,
      fbp: payload.fbp || undefined,
      fbc: payload.fbclid ? buildFbc(payload.fbclid) : payload.fbc || undefined,
    };

    // Nettoyer les undefined
    Object.keys(userData).forEach((k) => userData[k] === undefined && delete userData[k]);

    const customData = {
      currency: payload.currency || 'CAD',
      value: typeof payload.value === 'number' ? payload.value : 0,
      content_name: payload.content_name || undefined,
      content_category: payload.content_category || undefined,
    };
    Object.keys(customData).forEach((k) => customData[k] === undefined && delete customData[k]);

    const event = {
      event_name: payload.event_name || 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: payload.event_id || crypto.randomUUID(), // pour dedup avec browser pixel
      action_source: 'website',
      event_source_url: payload.event_source_url || 'https://poubellepremium.ca/',
      user_data: userData,
      custom_data: customData,
    };

    const body = {
      data: [event],
      access_token: env.META_ACCESS_TOKEN,
    };

    if (env.META_TEST_EVENT_CODE) {
      body.test_event_code = env.META_TEST_EVENT_CODE;
    }

    // Envoi a Meta Graph API
    const metaUrl = `https://graph.facebook.com/v18.0/${env.META_PIXEL_ID}/events`;
    let metaResponse;
    try {
      metaResponse = await fetch(metaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch (e) {
      console.error('[CAPI] Network error:', e.message);
      return jsonResponse({ error: 'Meta API unreachable', details: e.message }, 502);
    }

    const metaText = await metaResponse.text();
    let metaJson;
    try {
      metaJson = JSON.parse(metaText);
    } catch (e) {
      metaJson = { raw: metaText };
    }

    if (!metaResponse.ok) {
      console.error('[CAPI] Meta API error:', metaResponse.status, metaText);
      return jsonResponse(
        {
          error: 'Meta API rejected the event',
          status: metaResponse.status,
          meta_response: metaJson,
        },
        metaResponse.status >= 500 ? 502 : 400
      );
    }

    return jsonResponse(
      {
        ok: true,
        event_id: event.event_id,
        event_name: event.event_name,
        meta_response: metaJson,
      },
      200
    );
  },
};

// ===== Helpers =====

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

async function hashIfPresent(value) {
  if (value === null || value === undefined || value === '') return undefined;
  return await sha256(String(value));
}

async function sha256(value) {
  const buffer = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function normalizeEmail(email) {
  if (!email) return undefined;
  return String(email).trim().toLowerCase();
}

function normalizePhone(phone) {
  if (!phone) return undefined;
  // Garde uniquement les chiffres, prefix +1 si Canada
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return undefined;
  // Si 10 digits, prefix avec 1 (Canada)
  if (digits.length === 10) return '1' + digits;
  return digits;
}

function normalizeName(name) {
  if (!name) return undefined;
  return String(name).trim().toLowerCase().replace(/[^a-zA-ZÀ-ſ\s-]/g, '');
}

function normalizeZip(zip) {
  if (!zip) return undefined;
  // Code postal canadien : 5 premiers chars (sans espace), lowercase
  return String(zip).trim().toLowerCase().replace(/\s+/g, '').substring(0, 5);
}

function buildFbc(fbclid) {
  // Format Meta : fb.{subdomain_index}.{creation_time_ms}.{fbclid}
  // subdomain_index = 1 pour les domaines de premier niveau (.ca, .com)
  return `fb.1.${Date.now()}.${fbclid}`;
}
