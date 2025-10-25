# Contribuer à Halloweenify 🎃

Merci de l'intérêt que vous portez à Halloweenify ! Nous apprécions l'aide de la communauté. Que vous signaliez un bug, proposiez une nouvelle fonctionnalité ou écriviez du code, votre contribution est la bienvenue.

## Comment Contribuer ?

Il y a plusieurs façons d'aider :

* **Signaler des bugs** : Si vous trouvez un problème, merci de vérifier s'il n'a pas déjà été signalé [dans les Issues](https://github.com/Carolinedanslesnuages/halloweenify/issues) avant d'en créer une nouvelle.
* **Suggérer des améliorations** : Vous avez une idée pour une nouvelle fonctionnalité ou une amélioration ? Ouvrez une [Issue](https://github.com/Carolinedanslesnuages/halloweenify/issues) pour en discuter.
* **Proposer du code (Pull Requests)** : Si vous souhaitez corriger un bug ou implémenter une fonctionnalité.

## Signaler des Bugs

Avant de soumettre un bug :

1.  **Vérifiez les Issues existantes** pour voir si quelqu'un a déjà signalé le même problème.
2.  Assurez-vous d'utiliser la **dernière version** du package.
3.  Essayez de **reproduire le bug** dans un environnement minimal (par exemple, avec la page `test/test.html` fournie).

Lorsque vous créez une Issue de bug, veuillez inclure :

* Une description claire et concise du bug.
* Les étapes pour reproduire le problème.
* Ce que vous attendiez qu'il se passe.
* Ce qui se passe réellement.
* Des informations sur votre environnement (navigateur, système d'exploitation).
* Des captures d'écran si pertinent.

## Proposer des Changements (Pull Requests)

1.  **Forkez** le dépôt sur GitHub.
2.  **Clonez** votre fork localement : `git clone https://github.com/VOTRE_PSEUDO/halloweenify.git`
3.  **Créez une nouvelle branche** pour vos modifications : `git checkout -b ma-super-fonctionnalite` ou `git checkout -b fix/corriger-ce-bug`
4.  **Installez les dépendances** : `npm install`
5.  **Faites vos modifications** dans le code (principalement dans le dossier `src/`).
6.  **Testez vos changements** :
    * Lancez la compilation : `npm run build`
    * Ouvrez le fichier `test/test.html` (avec un serveur local comme `live-server`) pour vérifier visuellement que tout fonctionne comme prévu.
7.  **Commitez vos changements** en suivant la [Convention des Commits Conventionnels](https://www.conventionalcommits.org/en/v1.0.0/). C'est **très important** car cela détermine automatiquement la prochaine version du package.
    * Exemple pour une nouvelle fonctionnalité : `git commit -m "feat: add draggable logo functionality"`
    * Exemple pour une correction : `git commit -m "fix: prevent error when logo path is invalid"`
    * Exemple pour la documentation : `git commit -m "docs: update contributing guide"`
    * Exemple pour un changement cassant (breaking change) : `git commit -m "refactor!: rename main function to applyHalloweenTheme"` (notez le `!`) ou ajoutez `BREAKING CHANGE:` dans le corps du message.
8.  **Poussez** votre branche vers votre fork : `git push origin ma-super-fonctionnalite`
9.  **Ouvrez une Pull Request** depuis votre fork vers la branche `main` du dépôt `Carolinedanslesnuages/halloweenify`.
10. **Décrivez** clairement vos changements dans la Pull Request.

---

## Messages de Commit et Versionnage Sémantique (SemVer)

Ce projet utilise [Release Please](https://github.com/google-github-actions/release-please-action) pour automatiser la création des releases et la mise à jour du `CHANGELOG.md`. Cela fonctionne en analysant les messages de commit sur la branche `main`.

Il est donc **essentiel** que vos messages de commit respectent la convention [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

Le Versionnage Sémantique (SemVer) utilise un format `MAJOR.MINOR.PATCH` :

* **MAJOR** : Incrémenté pour des changements **incompatibles** (breaking changes).
* **MINOR** : Incrémenté pour de **nouvelles fonctionnalités** ajoutées de manière compatible.
* **PATCH** : Incrémenté pour des **corrections de bugs** compatibles.

`Release Please` utilise le type de vos commits pour déterminer la prochaine version :

* Un commit `fix:` déclenchera une version `PATCH` (ex: `0.1.0` -> `0.1.1`).
* Un commit `feat:` déclenchera une version `MINOR` (ex: `0.1.0` -> `0.2.0`).
* Un commit avec `BREAKING CHANGE:` dans le corps ou `!` après le type (`feat!:`, `fix!:`) déclenchera une version `MAJOR` (ex: `1.2.3` -> `2.0.0`).
* Les autres types (`docs:`, `chore:`, `style:`, `refactor:`, `test:`) ne déclenchent pas de nouvelle version.

En respectant cette convention, vous nous aidez à maintenir un historique clair et à automatiser le processus de release.

---

## Style de Code

Nous n'avons pas encore de linter ou de formateur configuré, mais essayez de suivre le style général du code existant (indentation, nommage des variables, etc.).
---

Merci encore pour votre contribution !