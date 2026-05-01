# Fichiers prêts à coller dans GHL

## Vue d'ensemble — 4 pages × 4 emplacements

Chaque page GHL reçoit **4 collages** :
- 1× HTML markup → bloc Custom Code
- 1× lib externe → Code de suivi → Suivi d'**en-tête**
- 1× scripts init → Code de suivi → Suivi du **pied de page**
- 1× styles → **CSS personnalisé**

---

## 📋 Tableau de correspondance (1 ligne = 1 page)

| Page GHL    | Slug          | Bloc Custom Code         | Code de suivi (en-tête)    | Code de suivi (pied de page) | CSS personnalisé      |
|-------------|---------------|--------------------------|----------------------------|------------------------------|-----------------------|
| Accueil     | `/`           | `1-accueil.html`         | `_accueil-header.html`     | `_accueil-footer.html`       | `_accueil-css.css`    |
| Avis        | `/avis-clients` | `2-avis-clients.html`  | `_avis-header.html`        | `_avis-footer.html`          | `_avis-css.css`       |
| Soumission  | `/soumission_1` | `3-soumission.html` + `_soumission-avis-footer.html` (2e bloc) | `_soumission-header.html` | `_soumission-footer.html` | `_soumission-css.css` |
| Retour      | `/retour`     | `4-retour.html`          | `_retour-header.html`      | `_retour-footer.html`        | `_retour-css.css`     |

## Bonus — CSS pour les forms natifs GHL (à coller dans l'éditeur GHL du form, pas dans la page)

| Form GHL                | Fichier                       | Où le coller                                                                |
|-------------------------|-------------------------------|-----------------------------------------------------------------------------|
| Form 9 / Retour (`g5pvDJWBSQmPuMQ9hvTu`) | `_form-retour-ghl.css` | Sites → Formulaires → ouvrir le form → Paramètres → CSS personnalisé |
| Soumission Sondage (`VvEwIFqbMCj3t1kUnB6g`) | `_form-soumission-ghl.css` | Sites → Sondages → ouvrir le sondage → Modifier → Avancé → CSS personnalisé |
| Soumission Sondage — pied de page | `_form-soumission-ghl-footer.html` | Sites → Sondages → ouvrir le sondage → Modifier → Avancé → Modifier le pied de page |

---

## Procédure pour 1 page (à répéter 4 fois)

1. Ouvre la page dans le builder GHL (Funnel → Page concernée)
2. **Bloc Custom Code** : drop un bloc HTML/JS personnalisé → ouvre le fichier `1-accueil.html` (ou autre) → Ctrl+A → Ctrl+C → coller dans le bloc
3. **Paramètres de la page → CSS personnalisé** : ouvre `_<nom>-css.css` → Ctrl+A → Ctrl+C → coller
4. **Paramètres de la page → Code de suivi** :
   - Onglet **Suivi d'en-tête** : colle `_<nom>-header.html`
   - Onglet **Suivi du pied de page** : colle `_<nom>-footer.html`
5. Sauvegarder → Publier

---

## SEO de chaque page

Dans `Page Settings → SEO` :

| Page              | Title                                          | Meta description                                                    |
|-------------------|------------------------------------------------|---------------------------------------------------------------------|
| Accueil           | Nettoyage de Bacs \| Poubelle Premium          | Service rapide, écologique et abordable. Devis gratuit dès aujourd'hui. |
| Avis clients      | Avis clients \| Poubelle Premium               | Découvrez pourquoi des centaines de familles font confiance à Poubelle Premium. |
| Soumission        | Demande de Soumission \| Poubelle Premium      | Remplissez notre formulaire en ligne pour recevoir une soumission rapide. |
| Retour            | Votre retour — Poubelle Premium                | Partagez votre retour avec Poubelle Premium.                        |

---

## Pourquoi 4 emplacements et pas 1 seul ?

GHL injecte le bloc Custom Code via `innerHTML`. Conséquence : **les `<script>` à l'intérieur ne s'exécutent pas toujours** (compteur sans «+», animations bloquées, FAQ figée, switcher FR/EN buggé).

Solution : dupliquer les libs externes et les scripts d'init dans les emplacements GHL natifs (`Code de suivi` + `CSS personnalisé`) où le code est exécuté nativement.

Le bloc Custom Code reste indispensable pour le HTML markup. Les 3 autres collages renforcent et garantissent l'exécution.
