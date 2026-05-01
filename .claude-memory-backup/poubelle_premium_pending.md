---
name: Poubelle Premium - points en attente (2026-05-01)
description: Reste a faire apres session 5 - audit, marketing, items bloques cote client
type: project
originSessionId: 7b37ba76-5d35-49b1-9574-16256a263a0c
---
Le site est **fonctionnellement complet et stable en GHL** au 2026-05-01 (commit f01da9b). Tout marche : header sticky, anims pp-anim au scroll, count-up, hamburger mobile, redirects /retour, form GHL natif, traduction FR/EN.

Ce qui reste :

## 1. Audit / cleanup des 13 fichiers (user-demande, en pause)
User a dit : "je pense ta trop surchargé les fichier sur y a des ligne qui servent a rien apres je veux pas que tu casse ce qu'on a rectifeir". On a mis en pause apres avoir fait fonctionner tout, pour eviter de casser pendant le cleanup.

**Approche convenue** : audit ligne par ligne, lister ce qui peut etre retire (CSS dupliques, regles redondantes, scripts deprecated), valider chaque suppression avec user avant de couper. **Ne pas y toucher sans accord explicite.**

Candidats potentiels au cleanup (a valider) :
- Doubles `<style class="unihdr">` dans `2-avis-clients.html` (lignes 376-596 dupliquent 1-375)
- Regles `.cbutton-*` dans `_accueil-css.css` ligne 67-159 si plus utilisees
- Variables `--orange` vs `--orange2` dans Avis (incoherentes)
- Patterns lang FR/EN dupliques entre fichier inline et `_*-css.css`

## 2. Marketing pipeline (a faire)
- **Meta Pixel** : creer le pixel sur business.facebook.com, remplacer `YOUR_PIXEL_ID` dans les 4 `_*-header.html` (lignes commentees)
- **Lookalike Audience** : creer apres collecte d'au moins 100 conversions
- **Google Ads + GTM** : creer comptes, remplacer `AW-XXXXX` et `GTM-XXXXXXX` dans les 4 headers
- **Lancement campagnes Ads** : apres tout le tracking en place

## 3. Items bloques cote client (en attente d'envoi)
- **Vraie photo "Aujourd'hui"** pour la timeline evolution — la cliente doit envoyer une vraie photo pour remplacer le stock GHL
- **Logo Comptant** pour remplacer Interac dans la section paiements
- **Google My Map version 2026** — la cliente avait promis une URL a jour
- **Texte "Bacs de Poubelles"** qui deborde sur une nouvelle ligne (besoin de voir le rendu pour decider du fix)
- **Footer "Liens utiles"** verification — la cliente voulait verifier
- **Duplicate "Nos services" en noir** a retirer — la cliente voulait verifier

## 4. Limitations GHL Forms basic plan (deferred)
La cliente est sur Forms basic plan, donc impossibles sans upgrade :
- Auto-scroll en haut du form sur "Suivant"
- Logique conditionnelle pour le champ "Forfait personnalise"

**How to apply:** Quand Rochdi revient, demander : "tu veux attaquer l'audit cleanup ou le marketing pipeline ou autre chose ?". Lui rappeler que tout marche et que le cleanup est risque sans validation ligne par ligne.
