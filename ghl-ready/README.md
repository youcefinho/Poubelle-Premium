# Fichiers prêts à coller dans GHL

4 fichiers nettoyés (sans `<!DOCTYPE>`, `<html>`, `<head>`, `<body>` — déjà présents dans la page GHL parente).

## Procédure (à répéter 4 fois)

### 1. Créer les 4 pages dans le funnel GHL

| Fichier source                  | Nom de page GHL  | Slug d'URL          | Taille |
|---------------------------------|------------------|---------------------|--------|
| `1-accueil.html`                | Accueil          | `/` (home du funnel) | 1.3 MB |
| `2-avis-clients.html`           | Avis clients     | `/avis-clients`     | 32 KB  |
| `3-soumission.html`             | Soumission       | `/soumission`       | 53 KB  |
| `4-retour.html`                 | Retour           | `/retour`           | 32 KB  |

Dans GHL : `Funnel → + Add Page` → définis le **nom** et le **slug** d'URL.

### 2. Pour chaque page

1. Ouvre la page dans le builder
2. Drop un bloc **Custom HTML/JS** (1 Column Row → bloc HTML/Javascript personnalisé)
3. Ouvre le fichier correspondant ici (`1-accueil.html`, etc.)
4. **Ctrl+A** (tout sélectionner) → **Ctrl+C** (copier)
5. Colle dans le bloc Custom Code GHL
6. Sauvegarder + Publier

### 3. SEO de chaque page (à faire dans GHL, PAS dans le code)

Dans `Page Settings → SEO` de chaque page GHL, configure :

| Page              | Title                                          | Meta description                                                    |
|-------------------|------------------------------------------------|---------------------------------------------------------------------|
| Accueil           | Nettoyage de Bacs \| Poubelle Premium          | Service rapide, écologique et abordable. Devis gratuit dès aujourd'hui. |
| Avis clients      | Avis clients \| Poubelle Premium               | Découvrez pourquoi des centaines de familles font confiance à Poubelle Premium. |
| Soumission        | Demande de Soumission \| Poubelle Premium      | Remplissez notre formulaire en ligne pour recevoir une soumission rapide. |
| Retour            | Votre retour — Poubelle Premium                | Partagez votre retour avec Poubelle Premium.                        |

Les `<meta>` et `<title>` qui restent en haut des fichiers HTML sont **ignorés** par le navigateur quand insérés dans le body — c'est cosmétique, GHL utilise ce que tu mets dans le SEO panel.

## Liens internes

Les `href` ont été patchés pour pointer vers les **slugs GHL** :

```
href="/"                ← Accueil
href="/avis-clients"    ← page Avis
href="/soumission"      ← page Soumission
href="/retour"          ← page Retour
```

⚠️ Si tu changes un slug dans GHL, il faut **regénérer les fichiers** avec les nouveaux slugs (sinon les liens cassent).

## Test après publication

Vérifie que les 4 liens du menu (Accueil / Services / Avis clients / Demander un devis) fonctionnent depuis chaque page. Pareil pour les CTAs dans les sections (boutons "Faire nettoyer mes bacs" → soumission).
