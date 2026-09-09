# Ateliers Médiation Numérique

© 2026 titi_23 — Tous droits réservés. Voir le fichier [LICENSE](./LICENSE).

Portfolio de médiation numérique de Cédric Waltener, créé dans le cadre du
Titre Professionnel Médiateur Numérique (AFPA Guéret) : 17 ateliers pour le
grand public, les débutants et les seniors, chacun avec une fiche PDF et un
quiz interactif à 3 niveaux.

Site en ligne : https://titi20061982-png.github.io/mediateur-numerique/

## Structure du dépôt

```
index.html          Page d'accueil (liste des 17 ateliers, recherche, favoris)
a-propos.html        Page "À propos" (qui je suis, mission, valeurs)
prestations.html     Page "Prestations" (ateliers, accompagnement, devis)
stats.html            Tableau de bord des visites de quiz
404.html               Page d'erreur personnalisée
style.css                Feuille de style partagée (voir "Système de design")
manifest.json              Manifeste PWA (site installable)
ateliers/                    Une page HTML par fiche et par quiz
  <slug>_<fiche>.html          Ex. smartphone_fiche-exercice.html
  <slug>_quiz.html              Quiz à 3 niveaux, traduit
  i18n/quiz-<code>.json          Traductions des quiz (une par langue)
<Nom du dossier PDF>/       Dossiers contenant les PDF originaux téléchargeables
```

## Ajouter ou modifier un atelier

Chaque atelier est une "carte" dans `index.html`, à l'intérieur d'une
`<section class="category">` (une section par thématique : Premiers pas,
Sécurité, Démarches, Insertion pro, Culture numérique). Pour ajouter un
atelier :

1. Copier le bloc `<div class="card">…</div>` d'un atelier existant dans la
   bonne section.
2. Changer le `<h3>` (titre) et les liens `<a class="main-link" href="ateliers/...">`
   vers les fiches PDF/HTML, et `<a class="dl-link" href="...">` vers le PDF
   téléchargeable.
3. Pour le quiz, garder `data-key="<slug>-quiz"` sur le `<span class="quiz-count">`
   — c'est la clé utilisée par le compteur de visites et par le système de
   favoris. Ne pas la changer une fois publiée (le compteur repartirait à zéro).
4. Mettre à jour les chiffres du bandeau (`<div class="stats">` : nombre
   d'ateliers/supports/thématiques) si besoin.

Aucune étape manuelle n'est nécessaire pour le moteur de recherche, les
favoris ⭐, le bouton "au hasard" 🎲 ou les animations : ils lisent
automatiquement toutes les `.card` présentes sur la page au chargement.

### Régénérer une page de quiz

Les pages `ateliers/<slug>_quiz.html` sont générées par le script
`build_quiz4.ps1` (dans le dossier de travail, pas commité dans ce dépôt) à
partir de `quiz_data_v2.json`. Modifier les questions dans ce fichier JSON
puis relancer le script régénère les 17 pages sans perdre le design (thème,
confettis, retour en haut, etc. — tout est dans le template du script).

## Modifier "À propos" et "Prestations"

- Le contenu détaillé est dans `a-propos.html`, sous forme de cartes
  (`<div class="card reveal">` dans un conteneur `.about-grid`) : un texte
  de départ à ajuster librement — nom, mission, valeurs.
- `prestations.html` liste 4 prestations types (animation d'ateliers,
  accompagnement individuel, supports personnalisés, interventions en
  structure) et un encart "tarifs sur devis". Pas d'adresse e-mail affichée
  par défaut : ajouter la vôtre dans l'encart `.devis-note` si vous voulez
  être contacté directement plutôt que via GitHub.
- Un résumé de ces deux pages reste aussi affiché directement sur la page
  d'accueil (section "À propos" en bas de la liste des ateliers), avec un
  lien "Voir la page complète" vers `a-propos.html`.

## Système de design

Toutes les pages du site partagent les mêmes variables de couleur (thème
"Yggdrasil" : vert nature, fond crème en clair / anthracite en sombre), une
variante sombre automatique (`prefers-color-scheme`), et un bouton 🌙/☀️ pour
forcer le thème manuellement (mémorisé dans le navigateur via
`localStorage['theme']`, valable sur tout le site).

**Depuis le dernier chantier, ces jetons de couleur et les composants
réutilisables (cartes, boutons, en-tête/pied de page, barre de recherche,
etc.) vivent dans `style.css`, à la racine du dépôt.** Quatre pages
l'utilisent déjà (plus de `<style>` intégré dans leur `<head>`) :

- `index.html`
- `a-propos.html`
- `prestations.html`
- `stats.html`

Pour ajouter ou changer une couleur, une carte, un bouton commun à ces 4
pages, tout se passe désormais dans `style.css` — inutile de répéter la
modification 4 fois.

### Ce qui n'est PAS encore migré, et pourquoi

Les 25 fiches et 17 quiz du dossier `ateliers/` gardent encore leur propre
`<style>` intégré : ce sont des pages générées automatiquement par des
scripts PowerShell (`build_quiz4.ps1`, `translate_inject.ps1`, etc.), pas
commités dans ce dépôt, et il y en a beaucoup plus (42 pages, dont certaines
existent aussi en variantes de langue). Les migrer en même temps que le
reste aurait été le chantier le plus risqué de tous pour le gain le plus
faible — voir le plan de migration ci-dessous.

## Plan de migration progressif (ateliers/ : 25 fiches + 17 quiz)

Pour intégrer `style.css` aux pages restantes sans rien casser :

1. **Choisir une seule page de fiche "pilote"** (ex. `smartphone_fiche-exercice.html`)
   et la migrer à la main en suivant exactement la méthode utilisée pour
   `stats.html` dans ce commit : remplacer le bloc `<style>` par
   `<link rel="stylesheet" href="../style.css">` (attention au `../`, ces
   pages sont dans `ateliers/`), vérifier qu'aucune classe ne porte un nom
   déjà utilisé ailleurs avec un sens différent (comme `.icon-btn` ou
   `.card` l'étaient avant ce chantier), et confirmer visuellement (clair +
   sombre) que rien n'a bougé.
2. **Ajouter à `style.css` les quelques classes propres aux fiches** qui n'y
   sont pas encore : boutons A-/A+ de taille de police, bouton d'impression,
   feuille `@media print`, sélecteur de langue FR/EN/ES/AR/PT.
3. **Écrire un script de migration** (`migrate_style_fiches.ps1`, sur le
   même modèle que `add_design_pages.ps1`) qui répète l'étape 1 sur les 24
   fiches restantes, avec un mode `$env:DESIGN_TEST_ONE` pour tester un
   fichier à la fois avant de lancer sur tous.
4. **Faire la même chose pour le template de quiz** (`build_quiz4.ps1`) :
   modifier le template une fois pour qu'il génère un lien vers
   `../style.css` au lieu d'un `<style>` intégré, ajouter à `style.css` les
   classes propres aux quiz (écran de choix du niveau, confettis, sélecteur
   parmi 249 langues), puis régénérer les 17 pages de quiz via le script
   existant (aucune perte de contenu : les questions restent dans
   `quiz_data_v2.json`).
5. **Vérifier les liens** après chaque vague (script `check_links.ps1` déjà
   utilisé plus tôt dans le projet) et pousser par petits lots plutôt qu'en
   un seul gros commit, pour pouvoir revenir en arrière facilement si une
   page pose problème.

Cette prudence n'est pas nécessaire pour de futures modifications de
`index.html`, `a-propos.html`, `prestations.html` ou `stats.html` : ces
4 pages sont déjà unifiées et se modifient normalement, directement dans
`style.css`.

## Ce qui a été fait dans cette passe "portfolio professionnel"

- **Page d'accueil** : bouton "🚀 Découvrir les ateliers", bandeau de
  statistiques transformé en cartes/badges, liens "À propos" / "Prestations"
  ajoutés dans le hero, la barre de navigation et le pied de page.
- **Nouvelle page `a-propos.html`** : présentation, mission (inclusion
  numérique, accompagnement, pédagogie par ateliers) et valeurs
  (bienveillance, accessibilité, écologie numérique), en reprenant le texte
  déjà écrit sur l'accueil plutôt qu'un texte générique à réécrire.
- **Nouvelle page `prestations.html`** : 4 types de prestations et un encart
  "tarifs sur devis".
- **`style.css` global** : extraction des styles communs à `index.html`,
  `a-propos.html`, `prestations.html` et `stats.html` dans une feuille de
  style partagée, avec harmonisation de quelques détails qui différaient
  légèrement d'une page à l'autre (ombres, tailles de police des titres de
  carte). Les 42 pages de `ateliers/` ne sont pas touchées — voir le plan de
  migration ci-dessus.
- **Thème** : le vert nature déjà en place a été conservé (et non remplacé
  par un bleu néon) pour rester cohérent avec le texte "Yggdrasil" déjà
  publié.
- **Pied de page** harmonisé sur les 4 pages migrées (liens GitHub, À propos,
  Prestations, Statistiques/Accueil).

## Licence

Voir [LICENSE](./LICENSE) : toute réutilisation du contenu nécessite une
autorisation préalable de l'auteur.
