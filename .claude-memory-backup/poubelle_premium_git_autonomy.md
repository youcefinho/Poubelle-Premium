---
name: Poubelle Premium - autorisation git/npx autonome
description: Rochdi a autorisé l'exécution autonome des commandes git (commit, push, pull) et npx pour ce projet
type: feedback
originSessionId: d4423436-38e4-47a1-a0f3-92ce4574c317
---
Pour le projet Poubelle Premium (repo `https://github.com/youcefinho/Poubelle-Premium`), exécuter directement les commandes `git` et `npx` sans demander confirmation à chaque fois.

**Why:** Rochdi l'a explicitement autorisé le 2026-04-30 pour fluidifier le workflow. Les commits sur `main` sont OK (projet personnel client, pas de review process). Le push direct sur `main` est autorisé.

**How to apply:**
- Après une série de modifications fonctionnelles (un fix complet, un set de fichiers cohérent), commit + push automatiquement avec un message clair (Co-Authored-By inclus).
- Pas besoin de demander "tu veux que je commit ?" — faire et résumer en une ligne.
- Toujours commit sur `main`, push sur `origin main`.
- Pour `npx` (ex: outils de build, formatters, linters), même règle : exécuter directement.
- Conserver les bonnes pratiques: jamais de `--no-verify`, jamais de force push sur main, jamais d'amend de commits déjà pushés.
