# 🎃 halloweenify 👻

[![NPM version](https://img.shields.io/npm/v/halloweenify.svg)](https://www.npmjs.com/package/halloweenify) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Appliquez facilement un thème décoratif d'Halloween configurable à n'importe quelle page web !

Ce petit package JavaScript/TypeScript ajoute des décorations et des effets amusants pour célébrer Halloween, sans perturber la structure de votre site. Il est conçu pour être accessible et offre des options pour activer ou désactiver chaque fonctionnalité.

## ✨ Fonctionnalités

* 🗓️ **Activation par date** : S'active automatiquement pendant une période définie (par défaut le 31 octobre) ou via un paramètre URL (`?spooky=true`) ou une option `force`.
* 🎨 **Thème optionnel** : Peut appliquer un fond texturé sombre avec des couleurs adaptées, ou simplement décorer par-dessus votre thème existant (fond blanc par défaut).
* 🕷️ **Toiles d'araignée** : Ajoute des toiles statiques dans les coins.
* 🎃 **Curseur Emoji** : Remplace le curseur par défaut par un emoji citrouille (configurable).
* 🧙‍♀️ **Logo Déplaçable** : Affiche une image (votre sorcière !) au centre (ou ailleurs) que l'utilisateur peut déplacer après un double-clic.
    * 💬 Bulle d'aide initiale pour indiquer comment déplacer.
* 🖋️ **Police Spéciale** : Utilise la police "Creepster" de Google Fonts pour les titres.
* 📊 **Scrollbar personnalisée** : Style la barre de défilement aux couleurs d'Halloween.
* 🔗 **Liens Fantômes** : Fait apparaître un petit fantôme 👻 au survol des liens.
* 📄 **Titre d'onglet Emoji** : Ajoute un 🎃 au titre de la page.
* 🖼️ **Favicon** : Change le favicon du site.
* 💻 **Message Console** : Affiche un message de bienvenue Halloween dans la console développeur.
* ⚙️ **Configurable** : Chaque fonctionnalité peut être activée/désactivée.
* ❌ **Bouton Utilisateur** : Ajoute un petit bouton discret pour permettre à l'utilisateur de désactiver le thème pour la journée (utilise `localStorage`).
* 🧹 **Fonction de Nettoyage** : Exporte une fonction `removeHalloweenify` pour retirer tous les effets et styles.
* ♿ **Accessible** : Conçu sans animations intrusives et respecte les contrastes (en mode fond blanc ou sombre).

## 🚀 Installation

```bash
npm install halloweenify
# ou
yarn add halloweenify
# ou
pnpm add halloweenify
```

## 🔧 Usage

Importez le package et appelez la fonction `halloweenify()`. Elle s'activera automatiquement aux bonnes dates, ou si l'option `force` est `true`.

```javascript
import halloweenify from 'halloweenify';

// Activation simple (s'active seulement pendant la période définie)
halloweenify();

// -- OU --

// Activation avec configuration (exemple complet)
halloweenify({
  force: true, // Pour tester hors période Halloween
  startDate: '10-25', // Du 25 Octobre...
  endDate: '10-31',   // ...au 31 Octobre

  // Chemins vers vos assets (relatifs à votre page HTML)
  backgroundTexturePath: './assets/web1.png', // Mettre null pour garder le fond blanc
  overlayLogoPath: './assets/Witch.svg',       // Votre image centrale
  // cursorPath: './assets/cursor.png', // Obsolète si enableCursor: true (emoji)
  faviconPath: './assets/favicon-pumpkin.ico', // Votre favicon Halloween

  // Options de style
  spiderOpacity: 0.35,
  logoPosition: 'bottom-right', // 'center', 'top-left', 'top-right', 'bottom-left', 'bottom-right'

  // Activation/Désactivation des fonctionnalités
  enableWebs: true,
  enableCursor: true,       // Utilise l'emoji 🎃 par défaut, ignore cursorPath
  enableLogo: true,
  enableTitleEmoji: true,
  enableScrollbar: true,
  enableConsoleMessage: true,
  enableGhostLinks: true,
  enableFont: true,
  enableFavicon: true,
  enableUserToggle: true,   // Affiche le bouton [👻 OFF] pour désactiver
  showDragHint: true,       // Affiche la bulle d'aide pour le logo

  exposeCleanup: true // Permet d'appeler window.__halloweenify_remove()
});
```

### Forcer l'activation pour le test

Vous pouvez forcer l'activation de 3 manières :

1.  Passer l'option `{ force: true }`.
2.  Ajouter `?spooky=true` à l'URL de votre page.
3.  Modifier temporairement les dates `startDate` et `endDate`.

### Retirer le thème manuellement

Si vous avez utilisé `exposeCleanup: true`, vous pouvez appeler `window.__halloweenify_remove()` depuis la console ou un autre script pour retirer tous les éléments ajoutés par le package.

Vous pouvez aussi importer et appeler la fonction de nettoyage :

```javascript
import { removeHalloweenify } from 'halloweenify';

// ... plus tard dans votre code ...
removeHalloweenify();
```

## 🛠️ Options Détaillées

La fonction `halloweenify(options)` accepte un objet `options` avec les propriétés suivantes :

| Option                  | Type                                                       | Défaut          | Description                                                                                                                               |
| :---------------------- | :--------------------------------------------------------- | :-------------- | :---------------------------------------------------------------------------------------------------------------------------------------- |
| `force`                 | `boolean`                                                  | `false`         | Si `true`, active le thème quelle que soit la date.                                                                                         |
| `startDate`             | `string` ('MM-DD')                                         | `'10-31'`       | Date de début d'activation (mois-jour).                                                                                                     |
| `endDate`               | `string` ('MM-DD')                                         | `'10-31'`       | Date de fin d'activation (inclus). Si omis, utilise `startDate`.                                                                           |
| `backgroundTexturePath` | `string \| null`                                           | `null`          | Chemin vers une image de fond à appliquer en mosaïque. Si `null`, un fond blanc est forcé avec des couleurs de texte adaptées (contraste élevé). |
| `overlayLogoPath`       | `string \| null`                                           | `null`          | Chemin vers l'image du logo (sorcière) à afficher et rendre déplaçable.                                                                     |
| `faviconPath`           | `string \| null`                                           | `null`          | Chemin vers le fichier `.ico` ou `.png` à utiliser comme favicon.                                                                         |
| `spiderOpacity`         | `number`                                                   | `0.25`          | Opacité des toiles d'araignée (entre 0 et 1).                                                                                             |
| `logoPosition`          | `'center'\|'top-left'\|'top-right'\|'bottom-left'\|'bottom-right'` | `'center'`      | Position initiale du logo.                                                                                                                |
| `enableWebs`            | `boolean`                                                  | `true`          | Active/désactive les toiles d'araignée.                                                                                                     |
| `enableCursor`          | `boolean`                                                  | `true`          | Active/désactive le curseur emoji citrouille.                                                                                             |
| `enableLogo`            | `boolean`                                                  | `true`          | Active/désactive l'affichage du logo déplaçable (nécessite `overlayLogoPath`).                                                          |
| `enableTitleEmoji`      | `boolean`                                                  | `true`          | Active/désactive l'ajout de 🎃 au titre de la page.                                                                                       |
| `enableScrollbar`       | `boolean`                                                  | `true`          | Active/désactive la personnalisation de la barre de défilement.                                                                           |
| `enableConsoleMessage`  | `boolean`                                                  | `true`          | Active/désactive le message dans la console développeur.                                                                                    |
| `enableGhostLinks`      | `boolean`                                                  | `true`          | Active/désactive l'emoji 👻 au survol des liens.                                                                                          |
| `enableFont`            | `boolean`                                                  | `true`          | Active/désactive l'utilisation de la police "Creepster" pour les titres `h1, h2, h3`.                                                     |
| `enableFavicon`         | `boolean`                                                  | `true`          | Active/désactive le changement de favicon (nécessite `faviconPath`).                                                                        |
| `enableUserToggle`      | `boolean`                                                  | `true`          | Active/désactive l'affichage du bouton "👻 OFF" pour l'utilisateur.                                                                      |
| `showDragHint`          | `boolean`                                                  | `true`          | Affiche la bulle "Double-cliquez pour me déplacer !" près du logo au début.                                                              |
| `exposeCleanup`         | `boolean`                                                  | `false`         | Si `true`, attache la fonction `removeHalloweenify` à `window.__halloweenify_remove`.                                                   |

## 📜 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.