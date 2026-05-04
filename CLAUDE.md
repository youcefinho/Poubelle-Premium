# CLAUDE.md - Poubelle Premium (état projet)

**Lire EN PREMIER à chaque session.** Ce fichier est auto-chargé dans le contexte.

## Client

- **Poubelle Premium** — service nettoyage de bacs résidentiel et commercial
- **Zone** : Laval + Rive-Nord de Montréal (12 municipalités)
- **HQ** : Rosemère, J7A 3L3
- **Site live** : https://poubellepremium.ca/accueil_index
- **Sub-account GHL** : Poubelle Premium

## Stack technique

**Stack A** : GHL Custom Code (vanilla HTML/CSS) — voir `ULTRA_intralys_north_star.md`

- 4 pages × 4 slots GHL chacune (Custom Code Body / Header tracking / Footer tracking / CSS personnalisé)
- Workflow : ne toucher QUE `ghl-ready/`, ignorer `dist/`
- Slugs : `/accueil_index`, `/avis-clients`, `/soumission_1`, `/retour`

## Pages et fichiers ghl-ready

| Page | Custom Code | Header | Footer | CSS |
|---|---|---|---|---|
| Accueil | `1-accueil.html` | `_accueil-header.html` | `_accueil-footer.html` | `_accueil-css.css` |
| Avis | `2-avis-clients.html` | `_avis-header.html` | `_avis-footer.html` | `_avis-css.css` |
| Soumission | `3-soumission.html` | `_soumission-header.html` | `_soumission-footer.html` | `_soumission-css.css` |
| Retour | `4-retour.html` | `_retour-header.html` | `_retour-footer.html` | `_retour-css.css` |

## Tracking & CRM (TOUT EST CABLÉ)

### Pixel Meta + AAM (browser)
- **Pixel ID** : `986179510496466`
- **AAM** : via postMessage `set-sticky-contacts` (Plan B) + URL params via `window.__ppLeadParams` (Plan A)
- **7 champs** : em, ph, fn, ln, ct, zp, country
- **EMQ** browser projeté : 7-9/10
- **Code clé** :
  - `_soumission-header.html` (commit `be8c2a9`) : capture URL params + clean URL AVANT pixel PageView (Meta Terms compliance)
  - `_soumission-footer.html` (commit `6cbaa29`) : Plan A lit `window.__ppLeadParams` + Plan B postMessage + overlay merci
- **Tag rollback** : `pre-fix-meta-pii-2026-05-04`

### CAPI (server-side via GHL)
- **Workflow** : Trigger Form Submitted Sondage → Action Meta Conversion API
- **Connection Type** : INTEGRATION
- **Event Type** : **Funnel Event** (PAS Lead Event)
- **Custom Mapping** : OFF
- **Status** : Published
- **Dedup** : event_id partagé browser/CAPI via custom field GHL

### Meta Lead Form natif (parallèle)
- **Statut** : Configuré 2026-05-03 (Restreint + Manuel + 4 champs + custom field `source=meta_ads`)
- **Intégration** : FB → GHL native (PAS Zapier)
- **Workflow GHL** : "Lead Form Submitted" configuré
- **Champs obligatoires** : nom, email, téléphone, code postal

### Pourquoi 2 sources en parallèle
- Ad Set A → Site web `/soumission_1` (Pixel + CAPI, leads qualifiés intention forte)
- Ad Set B → Meta Lead Form natif (leads volume, conversion rate + élevé)
- Comparer CAC réel après 7-14 jours, garder ce qui performe

## Campagne Meta Ads (en lancement)

### Ciblage validé
- **Lieu** : Lorraine, Québec
- **Rayon** : 17 km (~730k pop atteinte, 84% efficace)
- **Âge** : 24 - 65+
- **Genre** : Tous
- **Langues** : Français (Canada) + Anglais (Canada)
- **Comportement** : Propriétaires de logement
- **Audience** : Advantage+ ON (Meta optimise auto)

### Couverture 17 km Lorraine
Toute MRC Thérèse-De Blainville (7 villes) + Saint-Eustache + Deux-Montagnes + Terrebonne + Mascouche + Laval (Auteuil, Vimont, Fabreville) + Mirabel sud.

### Configuration campagne
- **Objectif** : Prospects (Lead generation)
- **Budget optim.** : CBO Advantage Campaign Budget
- **Stratégie enchère** : Volume le plus élevé
- **Évènement conversion** : Pixel `Lead`
- **Optim. diffusion** : Conversions
- **Placements** : Advantage+
- **Aggregated Event Measurement (iOS)** : Priorité 1 = Lead

### Créatives
- Vidéo branded camion + numéro 438 799-4444 + URL site
- Format unique image / unique vidéo
- "Contenu multimédia flexible" ON par défaut
- Autres améliorations IA OFF (préserve branding bilingue FR/EN Québec)

## Décisions à NE JAMAIS oublier

1. **Les 2 forms sont déjà cablés** (site + Meta Lead Form) — ne pas refaire le setup
2. **Pas de Zapier**, tout natif (GHL Workflow + Meta CAPI direct)
3. **Pixel + CAPI = pour Ad Set A site web** uniquement
4. **Meta Lead Form natif = Ad Set B** (pas besoin Pixel/CAPI sur ce form, Meta tracke nativement)
5. **Funnel Event** dans CAPI workflow (PAS Lead Event qui requiert fb_lead_id Meta Lead Form)
6. **Slug correct** : `/soumission_1` (pas `/soumission` qui est pris par ancien funnel)
7. **Rachunki/MCP** : NE JAMAIS toucher MCP sans demande explicite Rochdi (règle #1)
8. **Pas d'estimations de temps** ("5 min", "1h", etc.) — solution complète, pas rapide
9. **Pas d'empilement de code** : modifier ou supprimer, jamais empiler
10. **Loi 25** : Consent Mode v2 default `denied` dans header, banner Loi 25 dans footer

## Mémoires ULTRA à lire (dans cet ordre)

1. `ULTRA_intralys_north_star.md` — méthodologie Intralys + decision tree stack + code propre
2. `ULTRA_intralys_v6_pipeline.md` — pipeline Guimont (Stack B, pas Poubelle Premium)
3. `ULTRA_intralys_meta_tracking.md` — Pixel + CAPI playbook complet
4. `ULTRA_intralys_ghl_pieges.md` — 17 réflexes Custom Code GHL
5. `ULTRA_intralys_nouveau_client.md` — checklist setup nouveau client A→Z

## Maintenance de ce fichier

**À mettre à jour** quand :
- Une décision majeure est prise (ciblage, créative, stack)
- Un setup change (Pixel ID, workflow, intégration)
- Un fichier critique est ajouté/supprimé
- Un piège est découvert/résolu

**Format** : court, scannable, marqueurs visuels (✅ ❌ ⚠️). Max ~300 lignes.

**Fait par** : Claude doit MAJ ce fichier à chaque changement notable, pas à la fin de session.
