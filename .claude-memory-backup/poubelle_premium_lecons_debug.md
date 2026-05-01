---
name: Poubelle Premium - leçons debug GHL (à appliquer dès le début)
description: Erreurs à ne PAS refaire sur Poubelle Premium / GHL - réflexes de debug à appliquer en premier, pas en dernier
type: feedback
originSessionId: 7b37ba76-5d35-49b1-9574-16256a263a0c
---
Ces leçons viennent de 2 sessions où on a chacune fois passé 1h+ sur des bugs qui avaient une solution simple. Les appliquer EN PREMIER quand un symptôme similaire se présente.

## 1. "Le HTML est là dans la source mais ne s'affiche pas" → vérifier les balises NON FERMÉES en premier

**Réflexe** : avant de chercher des explications complexes (cache, GHL natif, JS), faire :
```bash
for tag in style script div header section form; do
  echo "$tag: $(grep -c "<$tag\b" file.html) ouvert / $(grep -c "</$tag>" file.html) ferme"
done
```
Une balise `<style>` ou `<script>` non fermée avale TOUT le HTML qui suit comme du texte/CSS invalide → la suite ne se rend pas.

**Why:** Bug header Soumission V1 — on a tourné 1h+ avec patches JS/CSS alors qu'il manquait juste un `</style>` ligne 730.

## 2. "Page GHL ne sert pas notre code" → vérifier les funnels en double

**Réflexe** : si une URL `/X` ne sert pas le HTML qu'on vient de coller dans un funnel, demander immédiatement "as-tu plusieurs funnels qui pourraient répondre à cette URL ?". Souvent un ancien funnel non supprimé garde le slug.

**Indices** : présence dans le HTML rendu de chaînes inconnues (genre `accueil919563`) qui n'existent NULLE PART dans le code source.

**Solution** : soit supprimer la page conflictuelle dans l'ancien funnel, soit renommer notre slug (ex: `/soumission` → `/soumission_1`).

## 3. GHL Custom Code Block = UNE section autonome

**Réflexe** : ne JAMAIS mettre une page complète (header + hero + content + footer) dans un seul Custom Code Block. GHL enferme le HTML dans son propre conteneur avec layout natif → des sections après le contenu principal (genre avis, footer) peuvent être tronquées visuellement même si elles sont dans le DOM.

**Pattern correct** :
- 1 bloc Custom Code = 1 section logique (ex: hero+form)
- Avis = un autre bloc Custom Code séparé
- Footer = un 3ᵉ bloc, ou élément natif GHL

**Why:** Bug section Avis Soumission_1 invisible — on a essayé 6 fixes CSS/JS avant de réaliser qu'il fallait juste splitter en 2 blocs.

## 4. Classes GHL natives à éviter dans notre HTML custom

Ne pas utiliser ces classes dans notre Custom Code (GHL applique son propre CSS/JS dessus, ça casse) :
- `fullSection`
- `c-section`
- `c-wrapper`
- `c-row`
- `c-column`
- `inner` (parfois)

Préfixer nos classes (`pp-` pour Poubelle Premium) pour éviter les collisions.

## 5. Form GHL : utiliser l'iframe natif, jamais re-coder un POST custom

Quand on a un form GHL existant (ID `T4YujbkmtyJpE1tkejGE`), JAMAIS bricoler un form HTML maison qui tente de POSTer vers l'API GHL. Utiliser l'iframe officiel directement :
```html
<iframe src="https://api.leadconnectorhq.com/widget/form/<FORM_ID>" data-form-id="<FORM_ID>" ...>
```
GHL gère tout (CRM, notifications, pixel, conversation, sticky contact). Pas de reverse-engineering nécessaire.

**Attention** : GHL réinjecte automatiquement `form_embed.js` même si on le retire — il auto-resize l'iframe. Pour bloquer le redimensionnement : verrouiller `height` + `overflow:hidden` sur le **wrapper parent**, pas sur l'iframe directement.

## 6. Réflexe screenshot — demander VITE quand bloqué

Quand le user dit "ça marche pas" et que le HTML/CSS source semble correct côté code, **demander un screenshot dès le 2ᵉ aller-retour**, pas après 5 tentatives à l'aveugle. Une image = 0 tâtonnement.

**Why:** Bug Avis qui disparaît — j'ai fait 6 commits CSS avant de demander screenshot, alors que le screenshot a immédiatement révélé que le bas de page était littéralement blanc.

## 7. Validation côté GHL = problème humain

Si après plusieurs commits le HTML servi `curl` retourne **encore** l'ancienne version, c'est que le user n'a pas re-collé / pas Publié / pas vidé le cache. Avant de proposer un nouveau fix code, **vérifier avec `curl` que la dernière version est bien en ligne** (chercher un marqueur unique du dernier commit).

## 8. Filets de sécurité CSS sur AOS = piège

Ne JAMAIS faire un fallback CSS qui force `opacity:1; transform:none` sur **tous** les `[data-aos]` après un délai fixe sans gate. Le pattern naïf :
```css
[data-aos] { animation: pp-force-visible-fallback 0s 1.5s forwards; }
```
…snap les éléments à l'état final avant que AOS ait le temps d'observer le scroll → toutes les animations meurent silencieusement.

**Pattern correct** : filet JS gate sur un flag (`if (!aosOk) ...`), comme celui déjà présent dans 1-accueil.html ligne 25266. Si AOS répond, le filet ne fire jamais.

**Why:** Commit 77f3683 a ajouté ce filet pour "résoudre" un problème déjà résolu côté JS → toutes les anims Accueil disparues. Retiré au commit ce95a2b.

## 9. AOS NE MARCHE PAS dans GHL → utiliser un système custom IntersectionObserver

GHL force `opacity:1` (souvent avec `!important`) sur ses classes natives `.c-column`, `.c-heading`, `.c-image`, `.c-button`. Résultat : AOS pose `opacity:0` en inline mais GHL gagne → AOS init() roule mais aucune anim visible. La page affiche tout d'un coup, sans aucun effet de scroll.

**Pattern correct** (déployé sur Accueil dans `_accueil-footer.html` + `_accueil-css.css`) :
1. Tagger les éléments avec une classe custom unique (`.pp-anim`, `.pp-anim-up`, etc. — préfixe `pp-` que GHL ne connaît pas)
2. CSS avec `!important` partout : `opacity:0` → `opacity:1` quand `.pp-in` ajoutée
3. IntersectionObserver dans le footer ajoute `.pp-in` quand visible

**3 pièges critiques évités** :
- **Skip les éléments qui CONTIENNENT un `header`/`.header-nav`/`#pp-mobile-header`** : `transform: translateY(40px)` sur un ancêtre d'un `position:fixed` crée un containing block qui CASSE le fixed → header flotte. Use `el.querySelector(HDR_SEL)` pour vérifier si l'élément contient un header.
- **Skip les éléments DÉJÀ dans le viewport au load** : sinon flash blanc 1-2s pendant que IntersectionObserver init. Use `getBoundingClientRect()` pour ne tagger que ce qui est sous le fold.
- **Skip aussi les éléments DANS un header** (closest()) au cas où.

**Why:** Sessions 4-5 : remplacé AOS par pp-anim au commit 3c3db5e, mais oublié les 3 pièges → header flotant + flash blanc → 6 commits supplémentaires. Pattern final stable au commit 85ae233.

## 10. GHL strippe les `onclick` inline sur les NOUVEAUX `<a>` (mais pas sur ceux qui existaient au commit initial)

Comportement observé : ajouter un `<a onclick="...">` à une page existante → GHL strippe l'onclick au paste. Mais les onclick déjà présents quand la page a été créée survivent. Inconsistant et trompeur.

**Pattern correct** : pour tout nouveau redirect/handler sur des liens, utiliser un **listener délégué au `document`** dans le footer (Footer Tracking emplacement, qui exécute toujours les scripts) :
```js
document.addEventListener('click', function (e) {
  var a = e.target && e.target.closest && e.target.closest('a');
  if (!a) return;
  var href = a.getAttribute('href') || '';
  if (/* filter par href */) {
    setTimeout(function () { window.location.href = '/retour'; }, 250);
  }
});
```

**Why:** Session 5 : ajouté 3 boutons "Rédiger un avis" avec onclick inline → opening Google nouvel onglet OK mais redirect /retour ne fire pas. Fix au commit 6f05eb3 par listener document level.

## 11. Cross-origin iframe (msgsndr_reviews) : mousedown ne fire PAS dans le parent

Quand un user clique un bouton DANS un iframe cross-origin (genre le widget GHL Google reviews `id=msgsndr_reviews`), les events click/mousedown ne traversent PAS au document parent (sécurité navigateur). On peut SEULEMENT détecter via `window.blur` + check `document.activeElement.id === 'msgsndr_reviews'`.

**Pattern correct** :
```js
window.addEventListener('blur', function () {
  var ae = document.activeElement;
  if (ae && (ae.id === 'msgsndr_reviews' || (ae.tagName === 'IFRAME' && ae.src && ae.src.indexOf('leadconnectorhq.com/appengine/reviews') >= 0))) {
    setTimeout(function () { window.location.href = '/retour'; }, 600);
  }
});
```

**Why:** Session 5 : les boutons "Rédiger un avis" / "5.00 ★★★★★" du widget GHL sont dans l'iframe → mousedown listener voyait `lastIframeClick = 0` → redirect ne fire pas. Fix au commit f01da9b.

## 12. Tailwind CDN (page Avis) : impossible de gagner la guerre de spécificité CSS

La page Avis charge Tailwind via `<script src="https://cdn.tailwindcss.com">` qui injecte CSS au runtime. Tailwind gagne souvent contre nos règles même avec `!important` (timing d'injection ou ordre).

**Pattern correct** : pour les éléments critiques (genre menu hamburger Avis), poser les styles directement via JS `element.style.cssText = '...!important'` au moment du clic. `style.cssText` avec `!important` bat n'importe quelle CSS externe.
```js
btn.addEventListener('click', function () {
  nav.style.cssText = 'display:flex !important;background:#fff !important;...';
});
```

**Why:** Session 5 : menu hamburger Avis s'ouvrait mais paraissait vide (Tailwind écrasait) → JS forced styles au clic = bypass nucléaire (commit 2af0e47).

---

**Bilan** : 5 sessions, ~6h perdues sur des trucs qui auraient pris 30 min avec ces réflexes. À lire avant tout debug futur sur Poubelle Premium / GHL.
