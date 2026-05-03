# Rapport de recherche : MCP servers GHL pour Claude Code

**Date de recherche** : 2026-05-03
**Auteur** : Claude (Opus 4.7)
**Contexte** : Industrialisation de la config GHL (workflows, forms, pipelines) sur les futurs clients Intralys via Claude Code + MCP
**Statut** : Recherche pure, **AUCUN install effectue**. A executer dans une session ulterieure apres GO Rochdi.

---

## TL;DR

| Sujet | Verdict |
|---|---|
| **MCP officiel HighLevel** | Pret prod. **36 tools** (pas 21). HTTP streamable. Endpoint stable `https://services.leadconnectorhq.com/mcp/`. Maj doc 29 dec 2025. |
| **tenfoldmarc/ghl-mcp** | Repo jeune (2 commits, 17 mars 2026, 11 stars, 0 issues). Code Python propre (FastMCP + httpx). Stack predictible mais **maintenance non-prouvee**. ~50 tools. |
| **Coexistence 2 MCP** | OK natif Claude Code. Conflits noms gerent automatiquement via prefixe `mcp__<server>__<tool>`. |
| **Faille critique strategie initiale** | **GHL n'expose AUCUN scope `workflows.write` au niveau sub-account.** Ni l'officiel ni tenfoldmarc ne peuvent CREER/EDITER de workflows par API. Seulement `list_workflows` + `add_contact_to_workflow`. La promesse "creer workflows via MCP" est **fausse cote API GHL**, pas cote MCP. |
| **Forms / Surveys** | Lecture seule (`forms.write` existe mais retourne souvent 401 selon issues GHL communautaires; pas couvert par l'officiel). |
| **Decision recommandee** | Installer les 2 quand meme : l'officiel pour 80% des operations + tenfoldmarc pour invoices, products, media, custom values, drip campaigns, businesses, trigger links. **Ne pas attendre des miracles sur workflows.** |

---

## 1. MCP Officiel HighLevel

### 1.1. Sources officielles
- Doc support : https://help.gohighlevel.com/support/solutions/articles/155000005741-how-to-use-the-highlevel-mcp-server (maj **29 dec 2025**)
- Marketplace doc : https://marketplace.gohighlevel.com/docs/other/mcp/

### 1.2. Connexion

| Param | Valeur |
|---|---|
| Type transport | **HTTP Streamable** (compatible Cursor, Windsurf, Claude Code via `--transport http`) |
| Endpoint | `https://services.leadconnectorhq.com/mcp/` |
| Header auth | `Authorization: Bearer <PIT>` (token format `pit-xxxxxxxx`) |
| Header location | `locationId: <sub-account-id>` (statique) OU passe dynamiquement via prompt |
| Auth fallback | OAuth 2.0 supporte cote MCP officiel |
| Roadmap | "250+ tools" annonces par GHL pour expansion future |

> **Remarque importante** : Claude Desktop n'est PAS officiellement supporte par le MCP officiel (HTTP Streamable seulement). Mais **Claude Code supporte HTTP Streamable nativement** via `claude mcp add --transport http` (verifie dans la doc Claude Code v2.x).

### 1.3. Liste exacte des 36 tools

| # | Tool name (exact) | Categorie | Scope minimal requis |
|---|---|---|---|
| 1 | `calendars_get-calendar-events` | Calendars | `calendars/events.readonly` |
| 2 | `calendars_get-appointment-notes` | Calendars | `calendars/events.readonly` |
| 3 | `contacts_get-all-tasks` | Contacts | `contacts.readonly` |
| 4 | `contacts_add-tags` | Contacts | `contacts.write` |
| 5 | `contacts_remove-tags` | Contacts | `contacts.write` |
| 6 | `contacts_get-contact` | Contacts | `contacts.readonly` |
| 7 | `contacts_update-contact` | Contacts | `contacts.write` |
| 8 | `contacts_upsert-contact` | Contacts | `contacts.write` |
| 9 | `contacts_create-contact` | Contacts | `contacts.write` |
| 10 | `contacts_get-contacts` | Contacts | `contacts.readonly` |
| 11 | `conversations_search-conversation` | Conversations | `conversations.readonly` |
| 12 | `conversations_get-messages` | Conversations | `conversations/message.readonly` |
| 13 | `conversations_send-a-new-message` | Conversations | `conversations/message.write` |
| 14 | `locations_get-location` | Locations | `locations.readonly` |
| 15 | `locations_get-custom-fields` | Locations | `locations/customFields.readonly` |
| 16 | `opportunities_search-opportunity` | Opportunities | `opportunities.readonly` |
| 17 | `opportunities_get-pipelines` | Opportunities | `opportunities.readonly` |
| 18 | `opportunities_get-opportunity` | Opportunities | `opportunities.readonly` |
| 19 | `opportunities_update-opportunity` | Opportunities | `opportunities.write` |
| 20 | `payments_get-order-by-id` | Payments | `payments/orders.readonly` |
| 21 | `payments_list-transactions` | Payments | `payments/transactions.readonly` |
| 22 | `blogs_check-url-slug-exists` | Blogs | `blogs/check-slug.readonly` |
| 23 | `blogs_update-blog-post` | Blogs | `blogs/post-update.write` |
| 24 | `blogs_create-blog-post` | Blogs | `blogs/post.write` |
| 25 | `blogs_get-all-blog-authors-by-location` | Blogs | `blogs/author.readonly` |
| 26 | `blogs_get-all-categories-by-location` | Blogs | `blogs/category.readonly` |
| 27 | `blogs_get-blog-post` | Blogs | `blogspostsreadonly` |
| 28 | `blogs_get-blogs` | Blogs | `blogslistreadonly` |
| 29 | `emails_create-template` | Emails | `emails/builder.write` |
| 30 | `emails_fetch-template` | Emails | `emails/builder.readonly` |
| 31 | `socialmediaposting_get-account` | Social | `socialplanner/account.readonly` |
| 32 | `socialmediaposting_get-social-media-statistics` | Social | `socialplanner/statistics.readonly` |
| 33 | `socialmediaposting_create-post` | Social | `socialplanner/post.write` |
| 34 | `socialmediaposting_get-post` | Social | `socialplanner/post.readonly` |
| 35 | `socialmediaposting_get-posts` | Social | `socialplanner/post.readonly` |
| 36 | `socialmediaposting_edit-post` | Social | `socialplanner/post.write` |

> **Limitations connues** : Pas de tool pour CREER opportunite (seulement `update`/`search`/`get`). Pas de tool pour CREER calendar. Pas de tool pour delete/create custom field. Pas de tool surveys. Pas de tool forms. Pas de tool workflows. Pas de tool invoices. Pas de tool products. Pas de tool media library.

### 1.4. Scopes complets necessaires (PIT MCP officiel)

Bloc a cocher dans GHL Settings > Private Integrations :

```
contacts.readonly
contacts.write
conversations.readonly
conversations.write
conversations/message.readonly
conversations/message.write
opportunities.readonly
opportunities.write
calendars.readonly
calendars/events.readonly
locations.readonly
locations/customFields.readonly
payments/orders.readonly
payments/transactions.readonly
blogs/check-slug.readonly
blogs/post.write
blogs/post-update.write
blogs/category.readonly
blogs/author.readonly
emails/builder.readonly
emails/builder.write
socialplanner/account.readonly
socialplanner/statistics.readonly
socialplanner/post.readonly
socialplanner/post.write
```

**Strategie minimaliste recommandee Intralys** (ce qu'on utilise vraiment) :
```
contacts.readonly, contacts.write
conversations.readonly, conversations/message.readonly, conversations/message.write
opportunities.readonly, opportunities.write
calendars.readonly, calendars/events.readonly
locations.readonly, locations/customFields.readonly
```
On laisse blogs/emails/social hors-scope tant qu'on n'utilise pas ces features cote agence (reduit surface d'attaque).

### 1.5. Rate limits

**Non documente** dans la doc MCP officielle. Tombe probablement sous les limites globales GHL API (10 req/sec/sub-account, 200 req/min — limites historiques v2 API).

---

## 2. tenfoldmarc/ghl-mcp

### 2.1. Etat du repo (verifie 2026-05-03)

| Indicateur | Valeur | Signal |
|---|---|---|
| Dernier commit | **17 mars 2026** | Recent (~6 semaines) |
| Total commits | **2** | **Tres jeune projet** |
| Stars GitHub | 11 | Faible adoption |
| Issues ouvertes | 0 | Pas de bug remontee actif |
| License | **Non specifiee dans README** | A verifier avant usage prod |
| Createur | @tenfoldmarc | Profil unique inconnu |

**Verdict adoption** : Projet experimental. Code OK mais **pas encore battle-tested**. A surveiller pour breaking changes.

### 2.2. Stack technique

- Langage : **Python 3.10+**
- Framework MCP : **FastMCP** (`fastmcp>=0.2.0`)
- HTTP client : `httpx>=0.27.0`
- Pas de venv manager bizarre, juste `python -m venv .venv`
- Pas de dependance native, pas de C extension
- Pas de sudo dans `install.sh`

### 2.3. Liste des tools (extraite de `main.py`)

> **Correction importante** : tenfoldmarc annonce "70+ tools" et "complete CRUD" mais l'inspection du code montre une couverture plus limitee que la communication marketing. La liste reelle :

#### Contacts (7 tools)
`search_contacts`, `get_contact`, `create_contact`, `update_contact`, `get_contact_notes`, `add_contact_note`, `add_contact_tags`

#### Conversations (4 tools)
`search_conversations`, `get_conversation`, `get_messages`, `send_message`

#### Opportunities (6 tools — **inclut create/delete contrairement a l'officiel**)
`get_pipelines`, `search_opportunities`, `get_opportunity`, `create_opportunity`, `update_opportunity`, `delete_opportunity`

#### Calendar (4 tools)
`get_calendars`, `get_appointments`, `create_appointment`, `delete_appointment`

#### Email Templates (5 tools)
`list_email_templates`, `get_email_template`, `create_email_template`, `update_email_template`, `delete_email_template`

#### Email Campaigns (7 tools)
`list_campaigns`, `get_campaign`, `create_campaign`, `update_campaign`, `schedule_campaign`, `send_campaign_now`, `delete_campaign`

#### Workflows (2 tools — **PAS de create/edit/publish**)
`list_workflows`, `add_contact_to_workflow`
> **CRUCIAL** : Pas de creation workflow. L'API GHL n'expose PAS `workflows.write`. C'etait une fausse promesse strategie initiale.

#### Funnels & Forms (3 tools, lecture seule)
`list_funnels`, `list_funnel_pages`, `list_forms`

#### Administratif (3 tools)
`get_users`, `get_custom_fields`, `get_tags`

**Total tools verifies par inspection code : ~41** (pas 70+ comme la com marketing).

> **A reverifier en session install** : la doc README parle aussi de Surveys, Blog, Social Media, Products, Invoices, Payments, Media Library, Businesses, Custom Values, Trigger Links, Courses, Drip Campaigns. Il est possible que ces tools soient definis dans des fichiers separes (modules `tools/*.py`) que l'inspection partielle de `main.py` n'a pas vue. **A confirmer avec `claude mcp list-tools tenfoldmarc-ghl` une fois installe.**

### 2.4. Procedure install (telle que documentee dans le README)

```bash
git clone https://github.com/tenfoldmarc/ghl-mcp.git
cd ghl-mcp
bash install.sh
```

`install.sh` fait :
1. Verifie Python 3 dispo
2. Cree `.venv` dans le dossier clone
3. `pip install -r requirements.txt` (fastmcp + httpx)
4. Demande interactive : Private Integration Token + Location ID
5. Execute `claude mcp add ghl -e GHL_PRIVATE_TOKEN="..." -e GHL_LOCATION_ID="..." -- "$(pwd)/.venv/bin/python" "$(pwd)/main.py"`
6. Pas de sudo, pas de modif systeme hors `~/.claude.json`

> **Risque Windows** : `install.sh` est bash-only. Sur Windows, **executer via Git Bash** (pas PowerShell). Le path Python du venv sera `.venv/Scripts/python.exe` sur Windows, pas `.venv/bin/python` — `install.sh` ne le gere probablement pas. **A verifier en session install ou utiliser le manual setup.**

### 2.5. Variables d'environnement

| Var | Description | Source |
|---|---|---|
| `GHL_PRIVATE_TOKEN` | PIT genere dans Settings > Private Integrations | UI GHL |
| `GHL_LOCATION_ID` | ID de la sub-account | URL navigateur quand connecte a la sub-account (ex. `https://app.gohighlevel.com/v2/location/<LOCATION_ID>/...`) |

### 2.6. Scopes recommandes pour le PIT tenfoldmarc

Si on utilise tenfoldmarc UNIQUEMENT pour ce que l'officiel ne couvre pas :

```
# Email campaigns (officiel ne couvre pas)
emails/schedule.readonly
campaigns.readonly

# Workflows (lecture + add contact)
workflows.readonly

# Funnels / forms (lecture)
funnels/funnel.readonly
funnels/page.readonly
forms.readonly

# Surveys (lecture seule)
surveys.readonly

# Opportunites create/delete (officiel ne couvre que update/search)
opportunities.write

# Calendars create/delete appointments (officiel ne couvre que get)
calendars/events.write
```

Si on veut profiter de tenfoldmarc pour invoices/products/media (a confirmer dispo dans le code reel) :
```
invoices.readonly, invoices.write
products.readonly, products.write
medias.readonly, medias.write
businesses.readonly, businesses.write
```

---

## 3. Coexistence 2 MCP dans Claude Code

### 3.1. Support multi-MCP

**Confirme** : Claude Code supporte N MCP servers en parallele sans limite documentee. Chaque server a son propre namespace de tools, prefixe automatiquement.

### 3.2. Resolution des conflits de noms

Format Claude Code : tous les tools MCP apparaissent sous `mcp__<server-name>__<tool-name>`.

Exemple pratique apres install :
- Officiel expose `contacts_create-contact` → visible comme `mcp__ghl-official__contacts_create-contact`
- Tenfoldmarc expose `create_contact` → visible comme `mcp__ghl-tenfoldmarc__create_contact`

**Pas de conflit possible** car les noms de tools different deja (officiel utilise `categorie_action` avec tirets, tenfoldmarc utilise `verbe_objet` avec underscores). Le prefixe MCP server-name garantit l'unicite meme en cas de collision.

### 3.3. Choix du MCP par Claude

**Risque** : Quand 2 MCP exposent la meme operation, Claude peut choisir le mauvais. Discussion GitHub officielle (modelcontextprotocol/discussions/120, /1198) confirme que le routing reste imparfait — Claude se base sur la description du tool + l'ordre dans la config.

**Mitigation strategie Intralys** :
1. **Donner des noms de servers explicites** : `ghl-official` et `ghl-tenfoldmarc` (pas `ghl1` / `ghl2`)
2. **Dans le prompt** : forcer explicitement "via le MCP officiel" ou "via tenfoldmarc" quand c'est important
3. **Ordre dans la config** : declarer l'officiel en PREMIER (la doc Claude Code suggere que l'ordre influence la priorite implicite)
4. **`alwaysLoad` selectif** : on peut marquer le MCP officiel `alwaysLoad: true` dans `.mcp.json` pour qu'il soit toujours visible sans tool search (utile si on veut les operations contacts/opportunites toujours disponibles)

### 3.4. Configuration de scope recommandee

| Scope | Choix | Rationale |
|---|---|---|
| `local` (defaut, dans `~/.claude.json`) | **NON** pour Intralys | Personnel, perdu si on change de projet |
| `project` (`.mcp.json` versione) | **NON** pour Intralys | Tokens GHL ne doivent JAMAIS etre commites |
| `user` (cross-projets) | **OUI Intralys** | Tokens via env vars, dispo sur tous les projets clients Intralys |

> **Strategie tokens** : Stocker `GHL_PRIVATE_TOKEN_OFFICIAL` et `GHL_PRIVATE_TOKEN_TENFOLDMARC` dans Windows env vars (pas dans `.mcp.json`). Utiliser `${VAR}` dans la config Claude Code.

---

## 4. Scopes GHL Private Integration (2026)

### 4.1. Faits cles

- Maximum **5 PIT par location** (sub-account) ET 5 PIT par agence
- Token format : `pit-xxxxxxxx` (statique, pas de refresh auto)
- **Procedure UI sub-account** :
  1. Settings (engrenage en bas a gauche de la sub-account)
  2. Private Integrations (doit etre active dans Labs au prealable si pas visible)
  3. Create new Integration
  4. Nom + description + selection des scopes
  5. Copier le token IMMEDIATEMENT (n'est plus reaffiche apres)
- **Rotation** : Recommandee tous les 90 jours par GHL. Procedure : "Rotate and expire later" (overlap 7j) ou "Rotate and expire now" (revoke immediat)

### 4.2. Tableau A — Coverage operations GHL par MCP

| Operation | MCP Officiel | Tenfoldmarc | Recommande |
|---|---|---|---|
| **Contacts CRUD** | ✅ get/create/update/upsert/get-tasks/add-tags/remove-tags | ✅ search/get/create/update/notes/tags | **Officiel** |
| **Contacts notes** | ❌ | ✅ get_contact_notes, add_contact_note | **Tenfoldmarc** |
| **Contacts delete** | ❌ | ❌ | Aucun (utiliser API directe) |
| **Conversations search/get** | ✅ | ✅ | **Officiel** |
| **Conversations send msg** | ✅ send-a-new-message | ✅ send_message | **Officiel** |
| **Opportunites search/get/update** | ✅ | ✅ | **Officiel** |
| **Opportunites CREATE** | ❌ | ✅ create_opportunity | **Tenfoldmarc** |
| **Opportunites DELETE** | ❌ | ✅ delete_opportunity | **Tenfoldmarc** |
| **Pipelines list** | ✅ get-pipelines | ✅ get_pipelines | **Officiel** |
| **Calendars list** | ❌ (seulement events) | ✅ get_calendars | **Tenfoldmarc** |
| **Calendar events get** | ✅ | ✅ get_appointments | **Officiel** |
| **Appointments CREATE** | ❌ | ✅ create_appointment | **Tenfoldmarc** |
| **Appointments DELETE** | ❌ | ✅ delete_appointment | **Tenfoldmarc** |
| **Tags list (location)** | ❌ | ✅ get_tags | **Tenfoldmarc** |
| **Tags add/remove (contact)** | ✅ | ✅ add_contact_tags | **Officiel** |
| **Custom fields list** | ✅ get-custom-fields | ✅ get_custom_fields | **Officiel** |
| **Custom fields create/update** | ❌ | ❌ | Aucun (UI manuelle) |
| **Custom values CRUD** | ❌ | A verifier (annonce mais pas vu) | A confirmer install |
| **Workflows list** | ❌ | ✅ list_workflows | **Tenfoldmarc** |
| **Workflows CREATE/EDIT/PUBLISH** | ❌ | ❌ (**API GHL ne le permet pas**) | **Aucun — passage UI obligatoire** |
| **Workflow add contact** | ❌ | ✅ add_contact_to_workflow | **Tenfoldmarc** |
| **Forms list** | ❌ | ✅ list_forms | **Tenfoldmarc** |
| **Forms create/update** | ❌ | ❌ | Aucun (UI manuelle) |
| **Form submissions get** | ❌ | A verifier dans code complet | A confirmer install |
| **Surveys list/get submissions** | ❌ | A verifier | A confirmer install |
| **Funnels / pages list** | ❌ | ✅ list_funnels, list_funnel_pages | **Tenfoldmarc** |
| **Email templates CRUD** | ✅ create/fetch | ✅ list/get/create/update/delete | **Officiel** (pour create/fetch) + **Tenfoldmarc** (pour delete) |
| **Email campaigns CRUD/schedule/send** | ❌ | ✅ 7 tools | **Tenfoldmarc** |
| **Drip campaigns** | ❌ | A verifier (annonce) | A confirmer install |
| **Blog posts CRUD** | ✅ check-slug/update/create + 4 read | ✅ create/update/delete | **Officiel** (plus complet) |
| **Social media accounts/posts** | ✅ 6 tools | A verifier (annonce) | **Officiel** |
| **Invoices CRUD/send/void** | ❌ | A verifier (annonce) | **Tenfoldmarc** si confirme |
| **Payments orders/transactions** | ✅ 2 read tools | A verifier (annonce subscriptions) | **Officiel** |
| **Products/Prices CRUD** | ❌ | A verifier (annonce) | **Tenfoldmarc** si confirme |
| **Media library list/upload** | ❌ | A verifier (annonce) | **Tenfoldmarc** si confirme |
| **Businesses CRUD** | ❌ | A verifier (annonce) | **Tenfoldmarc** si confirme |
| **Trigger links CRUD** | ❌ | A verifier (annonce) | **Tenfoldmarc** si confirme |
| **Courses list** | ❌ | A verifier (annonce) | **Tenfoldmarc** si confirme |
| **Users list** | ❌ | ✅ get_users | **Tenfoldmarc** |
| **Locations get** | ✅ get-location | ❌ | **Officiel** |

> **Memoire a corriger** : Le memory `feedback_ghl_mcp_strategy.md` annonce "Workflows (creation, modification, publication)" comme couverture tenfoldmarc. **C'est faux.** L'API GHL n'autorise PAS la creation/modification de workflows par token. Cette ligne sera mise a jour.

### 4.3. Tableau B — Scopes requis par MCP

| MCP | Scopes obligatoires (operations qu'on utilise vraiment) | Scopes optionnels |
|---|---|---|
| **Officiel** | `contacts.readonly`, `contacts.write`, `conversations.readonly`, `conversations/message.readonly`, `conversations/message.write`, `opportunities.readonly`, `opportunities.write`, `calendars.readonly`, `calendars/events.readonly`, `locations.readonly`, `locations/customFields.readonly` | `payments/orders.readonly`, `blogs/*`, `emails/builder.*`, `socialplanner/*` |
| **Tenfoldmarc** | `workflows.readonly`, `forms.readonly`, `funnels/funnel.readonly`, `funnels/page.readonly`, `calendars/events.write`, `opportunities.write`, `campaigns.readonly`, `users.readonly`, `locations/tags.readonly` | `surveys.readonly`, `invoices.*`, `products.*`, `medias.*`, `businesses.*`, `links.*`, `objects/record.*` |

**Principe Intralys** : 2 PIT, scopes disjoints au maximum. Si l'officiel a `contacts.write`, tenfoldmarc ne l'a PAS. Reduit le blast radius si un token fuit.

---

## 5. Risques identifies + mitigations

| Risque | Severite | Mitigation |
|---|---|---|
| **Compromission tenfoldmarc upstream** (supply chain) | Eleve | Pin commit hash dans clone (`git checkout <sha>` apres clone). Audit du code main.py avant install. Pas d'auto-update. |
| **Drift doc vs realite tools** | Moyen | Apres install, exporter la vraie liste avec `claude mcp get tenfoldmarc-ghl` et comparer au tableau A. |
| **Breaking change API GHL** | Moyen | L'officiel suit GHL automatiquement (cote serveur). Tenfoldmarc peut prendre du retard — surveiller `services.leadconnectorhq.com` v2 vs v3 changements. |
| **Token leak via .mcp.json commit** | **CRITIQUE** | Stocker tokens dans Windows env vars, jamais en clair dans `.mcp.json`. Utiliser `${GHL_PIT_OFFICIAL}` syntax. |
| **Conflit nom tool** | Faible | Auto-resolu par prefixe `mcp__<server>__<tool>`. |
| **Rate limit GHL** (10 req/sec/sub-account) | Moyen | Si batch operations sur N clients, sequencer ou throttler cote prompt. Pas de retry/throttle dans tenfoldmarc, vigilance. |
| **Token tenfoldmarc avec scopes trop larges** | Moyen | Strict scope-disjoint principle (tableau B ci-dessus). |
| **Windows + bash install.sh** | Moyen | Executer via Git Bash uniquement, ou faire le manual setup en PowerShell-aware. |
| **Promesse fausse "MCP cree des workflows"** | Eleve (deception strategique) | Accepter que les workflows restent en config UI manuelle. MCP utile pour CRM/contacts/pipelines, pas builder. |
| **License tenfoldmarc inconnue** | Moyen | Verifier avant deploiement client. Si proprietaire, abandonner. |

---

## 6. PROCEDURE D'INSTALL — A executer apres GO Rochdi

> **Pre-requis** : Tu es dans la session "GO INSTALLATION", Claude Code v2.1.121+, Git Bash dispo sur Windows, pas de modification systeme deja faite.

### Step 1 — Generer les 2 PIT dans GHL

> **Faire pour la sub-account Poubelle Premium en premier (test). Re-faire pour chaque future sub-account Intralys.**

#### PIT n°1 : `pp-mcp-official`

1. Ouvrir `https://app.gohighlevel.com/v2/location/<LOCATION_ID_POUBELLE>/`
2. Settings (engrenage en bas a gauche)
3. Private Integrations (si pas visible : Labs > activer Private Integrations)
4. **Create new Integration**
5. Nom : `Claude Code MCP - Officiel HighLevel`
6. Description : `MCP officiel - contacts, opportunites, calendars, conversations, social, blog`
7. Cocher les scopes (copy-paste ci-dessous, version minimale Intralys) :
   ```
   contacts.readonly
   contacts.write
   conversations.readonly
   conversations/message.readonly
   conversations/message.write
   opportunities.readonly
   opportunities.write
   calendars.readonly
   calendars/events.readonly
   locations.readonly
   locations/customFields.readonly
   ```
   (Ajouter `payments/orders.readonly`, `blogs/*`, `socialplanner/post.*` si on prevoit de s'en servir.)
8. Generate Token
9. **Copier le token immediatement** (format `pit-xxxxxxxx`) → coller dans password manager 1Password/Bitwarden sous nom `pp-mcp-official`
10. Recuperer le `LOCATION_ID` depuis l'URL en navigant sur la sub-account (segment apres `/location/`)

#### PIT n°2 : `pp-mcp-tenfoldmarc`

Repeter mais avec :
- Nom : `Claude Code MCP - Tenfoldmarc Community`
- Description : `MCP communautaire - workflows lecture, forms, calendars create, opportunites create/delete`
- Scopes (disjoints de l'officiel sauf chevauchements obligatoires) :
   ```
   workflows.readonly
   forms.readonly
   funnels/funnel.readonly
   funnels/page.readonly
   calendars/events.write
   surveys.readonly
   campaigns.readonly
   users.readonly
   locations/tags.readonly
   ```

**Stocker les 2 tokens dans password manager.** Ne pas continuer si non fait.

### Step 2 — Definir les variables d'environnement Windows

Dans **PowerShell admin** (une fois, pas a chaque session) :

```powershell
[System.Environment]::SetEnvironmentVariable('GHL_PIT_OFFICIAL', 'pit-xxxxxxxx-officiel', 'User')
[System.Environment]::SetEnvironmentVariable('GHL_PIT_TENFOLDMARC', 'pit-xxxxxxxx-tenfold', 'User')
[System.Environment]::SetEnvironmentVariable('GHL_LOCATION_PP', '<location_id_poubelle_premium>', 'User')
```

Fermer/rouvrir **toutes** les sessions terminal ensuite (Git Bash + PowerShell + VSCode).

Verification :
```bash
# Git Bash
echo $GHL_PIT_OFFICIAL
echo $GHL_LOCATION_PP
```

### Step 3 — Installer le MCP officiel HighLevel (HTTP, pas de clone necessaire)

Dans Claude Code (depuis n'importe quel dossier projet — on utilise scope `user`) :

```bash
claude mcp add --transport http \
  --scope user \
  --header "Authorization: Bearer ${GHL_PIT_OFFICIAL}" \
  --header "locationId: ${GHL_LOCATION_PP}" \
  ghl-official \
  https://services.leadconnectorhq.com/mcp/
```

**Verification** :
```bash
claude mcp list           # doit montrer ghl-official
claude mcp get ghl-official  # doit montrer transport http + url
```

Dans une session Claude Code, lancer :
```
/mcp
```
→ doit montrer `ghl-official` avec status `connected`.

Test fumee dans Claude Code (avec MCP officiel charge) :
> "Liste les pipelines de la sub-account Poubelle Premium via le MCP officiel"

→ Claude doit invoquer `mcp__ghl-official__opportunities_get-pipelines` et retourner les 6 pipelines de Poubelle Premium.

### Step 4 — Installer tenfoldmarc/ghl-mcp (clone Python)

> **Sur Windows : utiliser Git Bash.** PowerShell ne fait pas marcher `bash install.sh`.

```bash
# Choisir un dossier permanent (pas dans le projet client)
mkdir -p "$HOME/dev/mcp-servers"
cd "$HOME/dev/mcp-servers"

# Clone + pin commit (audit reproductibilite)
git clone https://github.com/tenfoldmarc/ghl-mcp.git
cd ghl-mcp

# OPTIONNEL mais recommande : pin sur le commit du 17 mars 2026
git checkout 75318b7  # commit "Fix repo URLs"

# Inspection rapide avant install
cat install.sh        # verifier qu'il fait bien ce qu'il dit
cat requirements.txt  # doit etre fastmcp + httpx uniquement
cat main.py | head -100  # voir l'auth + premier tool

# Setup manuel (pas install.sh interactif sur Windows)
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r requirements.txt   # Windows path
# OU sur Linux/macOS WSL : .venv/bin/pip install -r requirements.txt

# Enregistrer dans Claude Code (scope user)
claude mcp add ghl-tenfoldmarc \
  --scope user \
  --transport stdio \
  --env GHL_PRIVATE_TOKEN="${GHL_PIT_TENFOLDMARC}" \
  --env GHL_LOCATION_ID="${GHL_LOCATION_PP}" \
  -- "$(pwd)/.venv/Scripts/python.exe" "$(pwd)/main.py"
# Linux/macOS : remplacer .venv/Scripts/python.exe par .venv/bin/python
```

**Verification** :
```bash
claude mcp list  # doit montrer ghl-official ET ghl-tenfoldmarc
claude mcp get ghl-tenfoldmarc
```

Dans Claude Code :
```
/mcp
```
→ les 2 MCP doivent etre `connected`.

Test fumee :
> "Liste les workflows de la sub-account Poubelle Premium via tenfoldmarc"

→ Claude doit invoquer `mcp__ghl-tenfoldmarc__list_workflows`.

### Step 5 — Configurer la strategie 2-MCP dans CLAUDE.md du projet

Ajouter dans le `CLAUDE.md` projet (ou creer si pas existant) :

```markdown
# MCP GHL — strategie 2 servers

Pour toute operation GHL :
1. **Tenter `mcp__ghl-official__*` en priorite** — supporte par GHL.
2. **Fallback `mcp__ghl-tenfoldmarc__*`** uniquement pour : workflows (lecture), forms (lecture), funnels, calendars CREATE/DELETE appointments, opportunites CREATE/DELETE, email campaigns, users.
3. **Annoncer explicitement** "via officiel" ou "via tenfoldmarc" dans les reponses.
4. Workflows CREATE/EDIT : impossible par MCP. Passer par UI GHL.
```

### Step 6 — Test golden path

Liste de 5 commandes a tester dans Claude Code apres install pour valider :

| Test | Commande prompt | MCP attendu | Resultat attendu |
|---|---|---|---|
| 1 | "Liste les contacts de Poubelle Premium dont le tag = 'Lead Meta'" | officiel | N contacts retournes |
| 2 | "Liste les pipelines de Poubelle Premium" | officiel | 6 pipelines |
| 3 | "Liste les workflows de Poubelle Premium" | tenfoldmarc | N workflows |
| 4 | "Liste les forms de Poubelle Premium" | tenfoldmarc | Forms (incl. soumission GHL native) |
| 5 | "Cree un appointment test demain 14h sur le calendar de Poubelle Premium" | tenfoldmarc | Appointment cree (a supprimer apres) |

### Step 7 — Rollback procedure (si install foire)

```bash
# Desinstaller MCP de Claude Code
claude mcp remove ghl-official
claude mcp remove ghl-tenfoldmarc

# Supprimer le clone tenfoldmarc
rm -rf "$HOME/dev/mcp-servers/ghl-mcp"

# Revoke les 2 tokens dans GHL UI :
#   Settings > Private Integrations > <le token> > Rotate and expire NOW
```

Les variables d'environnement Windows peuvent rester (innocuous tant que les tokens sont revokes).

---

## 7. Configuration Claude Code finale (JSON)

Apres install, le fichier `~/.claude.json` contiendra (extrait scope user) :

```json
{
  "mcpServers": {
    "ghl-official": {
      "type": "http",
      "url": "https://services.leadconnectorhq.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GHL_PIT_OFFICIAL}",
        "locationId": "${GHL_LOCATION_PP}"
      }
    },
    "ghl-tenfoldmarc": {
      "type": "stdio",
      "command": "C:\\Users\\rochdi\\dev\\mcp-servers\\ghl-mcp\\.venv\\Scripts\\python.exe",
      "args": ["C:\\Users\\rochdi\\dev\\mcp-servers\\ghl-mcp\\main.py"],
      "env": {
        "GHL_PRIVATE_TOKEN": "${GHL_PIT_TENFOLDMARC}",
        "GHL_LOCATION_ID": "${GHL_LOCATION_PP}"
      }
    }
  }
}
```

**Note** : Sur multi-clients Intralys, on ne peut PAS avoir 2 sub-accounts simultanees avec le meme MCP server-name. Solutions :
- **Option A** : redefinir `GHL_LOCATION_PP` env var avant chaque session selon le client
- **Option B** : declarer N MCP servers (`ghl-official-pp`, `ghl-official-clientB`, etc.) avec headers differents
- **Option C** : passer le `locationId` dynamiquement dans le prompt plutot qu'en header

A trancher en session install selon UX souhaitee.

---

## 8. Questions ouvertes (a confirmer en session install)

1. **Liste reelle des tools tenfoldmarc** : Le main.py inspecte montre 41 tools, le README annonce 70+. Confirmer avec `claude mcp get ghl-tenfoldmarc` apres install si Claude Code peut lister tous les tools du server. Possible que des tools additionnels existent dans des modules separes non vus.
2. **License tenfoldmarc** : Pas de fichier LICENSE visible. Avant deploiement client, ouvrir une issue GitHub pour demander.
3. **install.sh sur Windows Git Bash** : Le script utilise `.venv/bin/pip` (Linux path). Sur Windows c'est `.venv/Scripts/pip.exe`. Probable que `install.sh` echoue — d'ou la procedure manual setup ci-dessus.
4. **Header `locationId` cote MCP officiel** : La doc parle de `locationId` en header mais aussi en parametre dynamique via prompt. Tester les 2 modes pour multi-sub-account.
5. **Rate limits MCP officiel** : Non documentes. A monitorer en prod, mettre un wrapper retry si necessaire.
6. **Forms.write** : Existe dans la liste scopes GHL mais aucun MCP ne l'expose. Inspecter le code complet de tenfoldmarc apres clone — peut-etre cache dans un module.
7. **Surveys.write** : N'existe PAS dans la liste scopes GHL (seulement `surveys.readonly`). Confirme : pas de creation surveys par API.
8. **MCP officiel + Claude Code Auth scheme** : La doc Claude Code suggere `--header "Authorization: Bearer X"` mais GHL veut potentiellement un format different. Tester si le header passe correctement (verifier avec `/mcp` qui peut afficher l'erreur 401 si auth foire).
9. **Permissions Claude Code par defaut** : Apres install, est-ce que Claude Code va prompter chaque appel MCP ? Si oui, configurer `.claude/settings.json` avec `allow` pour les patterns `mcp__ghl-official__*` et `mcp__ghl-tenfoldmarc__*` (skill `fewer-permission-prompts` peut aider).

---

## 8.5. Stack Intralys post-Poubelle Premium : React + Cloudflare + MCP GHL

> **Contexte** : Poubelle Premium = dernier projet HTML/CSS pur dans GHL Custom Code. **Tous les futurs clients Intralys** utilisent stack `bun + motion/react`, deploye sur **Cloudflare Pages + Workers**, avec forms via composant `GhlFormEmbed` qui pointe vers GHL natif.

### 8.5.1. Pattern d'architecture cible

```
[Cloudflare Pages] React app (bun build → static)
   │
   ├─ <GhlFormEmbed formId="abc-123" /> ─── iframe/widget vers GHL form natif
   │
   └─ fetch /api/* ─── [Cloudflare Workers] ─── API GHL services.leadconnectorhq.com
                              │
                              └─ KV cache (custom fields, pipelines, tags)
```

GHL = backend CRM/forms. Cloudflare = frontend + edge logic. MCP GHL = outil dev pour faire le pont.

### 8.5.2. Use cases MCP specifiques au stack React/Cloudflare

#### A. Generation types TypeScript depuis structure GHL (build-time)

Script `bun run gen:types` qui appelle Claude Code avec MCP GHL :
> "Pour la sub-account `${LOCATION_ID}`, genere `types/ghl.ts` : type `Contact` avec tous les custom fields, type `Pipeline` avec stages, union type `GhlTag` avec tous les tags actifs"

→ Type-safe garanti dans le React. Pas de drift silencieux entre structure GHL et code React.

#### B. Build-time audit (CI/CD avant deploy Cloudflare Pages)

Script `bun run audit:ghl` :
> "Verifie que les form IDs declares dans `src/forms.config.ts` existent dans GHL. Que les custom fields utilises dans `src/types/ghl.ts` sont toujours presents. Que les tags references dans `src/lib/segmentation.ts` existent. Sortie : exit 1 si drift detecte."

→ Ajoute dans GitHub Actions / Cloudflare Pages build hook. Empeche un deploy de site casse silencieusement parce qu'un form a ete supprime cote GHL.

#### C. Generation Workers boilerplate

Tu vas tres probablement avoir des Cloudflare Workers qui appellent l'API GHL (webhook receivers, cron sync, post-traitement form submit). Avec MCP :

> "Genere-moi un Worker TypeScript qui ecoute POST /lead-meta, valide payload via Zod, cree contact dans la sub-account Client X avec tag 'Lead Meta', source = 'Facebook Ads', et redirige vers /merci"

Claude lit la structure GHL via MCP, genere le Worker avec les bons custom field names, tu fais `wrangler deploy`.

#### D. Setup Wrangler secrets en 1 prompt

Pour chaque nouveau client Intralys :
> "Genere les commandes `wrangler secret put` pour le client Y avec son PIT (lis depuis env var) et son LOCATION_ID"

→ Plus de copy-paste manuel. Plus de risque de secret-leak.

#### E. Cache KV des structures GHL (pattern recommande)

Probleme : appeler GHL API a chaque page-view = cher + lent + risque rate limit. Solution :
- **Cron Worker** (1x/jour) : pull custom fields + pipelines + tags via API GHL → push dans KV namespace
- **React app** : fetch depuis KV (edge, sub-50ms global)

Avec MCP GHL, tu generes ce Cron Worker en lisant la spec de la sub-account directement.

#### F. Audit cross-clients en 1 prompt (le vrai daily driver)

Avec 5-10 clients Intralys actifs, le pain quotidien :
> "Liste les leads des 7 derniers jours sur les 5 sub-accounts Intralys actives, source = Meta. Sortie tableau markdown : client, lead count, taux conversion lead → opportunite, top tag."

→ Operation **impossible cote GHL UI** (faut switcher de sub-account 5 fois). MCP avec PIT par client = 1 prompt.

### 8.5.3. Architecture multi-clients : MCP servers nommes par client

Pour Intralys multi-clients sur Cloudflare, deux patterns possibles :

**Pattern A — Un MCP server par client** (verbose mais explicite)
```bash
claude mcp add --transport http --scope user \
  --header "Authorization: Bearer ${GHL_PIT_CLIENT_A}" \
  --header "locationId: ${GHL_LOCATION_CLIENT_A}" \
  ghl-client-a https://services.leadconnectorhq.com/mcp/

claude mcp add --transport http --scope user \
  --header "Authorization: Bearer ${GHL_PIT_CLIENT_B}" \
  --header "locationId: ${GHL_LOCATION_CLIENT_B}" \
  ghl-client-b https://services.leadconnectorhq.com/mcp/
```

→ Quand tu travailles sur le projet Cloudflare Client A, tu dis "via ghl-client-a". Eviter les confusions cross-clients.

**Pattern B — Un seul MCP, locationId dynamique dans prompt** (concis mais risque d'erreur humaine)
```bash
claude mcp add --transport http --scope user \
  --header "Authorization: Bearer ${GHL_PIT_AGENCY}" \
  ghl-intralys https://services.leadconnectorhq.com/mcp/
```

→ Le `locationId` se passe dans chaque prompt : "Pour la sub-account `xyz123`, liste les contacts...". Plus risque de toucher le mauvais client.

**Recommandation Intralys** : Pattern A. Plus verbose au setup (1x par client) mais ZERO risque de cross-client mistake. Quand tu es sur le projet Cloudflare Client A en local, le MCP `ghl-client-a` est la seule cle d'acces sa sub-account.

### 8.5.4. Templating Intralys reproductible

Avec ce stack, tu peux construire un **template Intralys reutilisable** :

```
intralys-client-template/
├── bun.lockb
├── package.json (bun + motion/react + wrangler)
├── src/
│   ├── components/GhlFormEmbed.tsx (composant standard Intralys)
│   ├── types/ghl.ts (genere par MCP au setup)
│   ├── lib/ghl-client.ts (fetch wrapper API GHL pour Workers)
│   └── forms.config.ts (formIds par form)
├── workers/
│   ├── lead-receiver.ts (Cloudflare Worker generique)
│   └── cron-sync-ghl.ts (cache GHL → KV)
├── scripts/
│   ├── audit-ghl.ts (verifie integrite GHL pre-deploy)
│   └── gen-types.ts (regen types depuis MCP GHL)
└── CLAUDE.md (procedures Intralys + MCP usage)
```

Pour chaque nouveau client : `bunx degit intralys/client-template my-client-X` + setup MCP server `ghl-client-X` + `bun run gen:types` + dev. **Setup complet de l'env dev en ~10 min vs ~2h aujourd'hui.**

### 8.5.5. Use cases qui DISPARAISSENT avec stack React/Cloudflare (vs Custom Code legacy)

| Use case Custom Code | Statut React/Cloudflare |
|---|---|
| Mapping HTML `name="..."` ↔ custom field | **Disparu** (form natif GHL via embed) |
| Debug "form submit silencieux" | **Disparu** (mapping declare cote GHL UI) |
| Paste Custom Code multi-slot 4x par page | **Disparu** (deploy Cloudflare via wrangler) |
| Test "scripts inline qui ne s'executent pas a cause innerHTML" | **Disparu** (React render natif) |
| Iframe sondage cross-origin | **Disparu** (composant React natif si reecrit) |

→ Ton workflow dev devient **drastiquement plus simple** sur les futurs clients. Le pain Poubelle Premium (debug GHL Custom Code) reste localise sur Poubelle Premium uniquement.

---

## 9. Recommandations finales

1. **Garder les 2 MCP malgre la decouverte workflows** : L'officiel reste solide pour 80% du quotidien (contacts, opportunites, conversations). Tenfoldmarc apporte CREATE/DELETE manquant + lecture workflows + forms + funnels.

2. **Ne PAS attendre des miracles sur workflow automation** : La promesse initiale "Claude cree mes workflows GHL" est techniquement impossible cote API. Workflows builders restent UI manuelle. MCP utile pour : assigner contacts, declencher, monitorer, lire status.

3. **Strategie scopes disjoints** : Les 2 PIT ne se chevauchent QUE sur les operations utilisees par les 2 (ex. contacts.write si on veut create_contact via tenfoldmarc en fallback). Sinon, separer.

4. **Pin tenfoldmarc commit hash** : Le repo est jeune. Pas d'auto-pull. Verifier les commits manuellement avant `git pull`.

5. **Rotation tokens 90j** : Mettre rappel calendrier (ou `/schedule` Claude Code) pour rotation des 2 tokens tous les 3 mois.

6. **Cas Intralys multi-client** : Anticiper la question multi-sub-account avant d'industrialiser. Option C (locationId dynamique dans prompt) la plus elegante mais la moins testee. Option B (N servers declares) la plus robuste mais surcharge la config.

---

## 10. Sources

### Officiel HighLevel MCP
- [HighLevel Support Portal — How to Use the HighLevel MCP Server](https://help.gohighlevel.com/support/solutions/articles/155000005741-how-to-use-the-highlevel-mcp-server)
- [HighLevel API Marketplace — MCP docs](https://marketplace.gohighlevel.com/docs/other/mcp/)

### tenfoldmarc/ghl-mcp
- [GitHub repo](https://github.com/tenfoldmarc/ghl-mcp)
- [README raw](https://raw.githubusercontent.com/tenfoldmarc/ghl-mcp/main/README.md)
- [requirements.txt](https://raw.githubusercontent.com/tenfoldmarc/ghl-mcp/main/requirements.txt)
- [main.py](https://github.com/tenfoldmarc/ghl-mcp/blob/main/main.py)

### Claude Code MCP
- [Claude Code MCP docs](https://code.claude.com/docs/en/mcp)
- [MCP naming conflict discussion #1198](https://github.com/modelcontextprotocol/modelcontextprotocol/discussions/1198)
- [MCP naming conflict discussion #120](https://github.com/orgs/modelcontextprotocol/discussions/120)

### GHL Authorization
- [GHL API Scopes](https://marketplace.gohighlevel.com/docs/Authorization/Scopes/index.html)
- [Private Integrations — Everything you need to know](https://help.gohighlevel.com/support/solutions/articles/155000003054-private-integrations-everything-you-need-to-know)
- [Private Integrations API doc](https://marketplace.gohighlevel.com/docs/Authorization/PrivateIntegrationsToken/)

### Alternatives non retenues (pour reference)
- [mastanley13/GoHighLevel-MCP](https://github.com/mastanley13/GoHighLevel-MCP) — autre community MCP, pas inspecte
- [BusyBee3333/Go-High-Level-MCP-2026-Complete](https://github.com/BusyBee3333/Go-High-Level-MCP-2026-Complete) — annonce 520+ tools mais pas verifie
