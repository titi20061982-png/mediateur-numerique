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
confettis, retour en haut, etc.) ni la migration vers `style.css` : le
template du script charge désormais `../style.css` lui aussi, exactement
comme les 17 pages déjà en ligne (vérifié : une régénération de test ne
produit aucune différence de contenu).

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

**Ces jetons de couleur et tous les composants réutilisables (cartes,
boutons, en-tête/pied de page, barre de recherche, écran de quiz,
sélecteur de langue des fiches, feuille d'impression, etc.) vivent dans
`style.css`, à la racine du dépôt.** Toutes les pages du site l'utilisent
— plus aucune page n'a de `<style>` intégré dans son `<head>` :

- `index.html`, `a-propos.html`, `prestations.html`, `stats.html`
- les 17 quiz et les 25 fiches de `ateliers/`

Pour ajouter ou changer une couleur, une carte, un bouton commun à
plusieurs pages, tout se passe désormais dans `style.css` — inutile de
répéter la modification page par page.

Chaque page (hors `ateliers/`) charge `style.css` depuis la racine ; les
pages de `ateliers/` le chargent via `../style.css` (elles sont un
dossier plus bas). Le script `build_quiz4.ps1` a été mis à jour pour
générer ce lien lui aussi : régénérer les quiz via ce script ne fait pas
revenir en arrière sur cette migration.

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
- **`style.css` global** : extraction de tous les styles du site (page
  d'accueil, À propos, Prestations, Statistiques, les 17 quiz et les 25
  fiches) dans une feuille de style partagée, migrée en plusieurs commits
  vérifiés un par un (pilote sur une page, puis lots) plutôt qu'en un seul
  gros commit. Quelques détails qui différaient légèrement d'une page à
  l'autre ont été harmonisés au passage (ombres, tailles de police des
  titres de carte, largeur de colonne des pages secondaires). Plus aucune
  page du site n'a de `<style>` intégré.
- **Thème** : le vert nature déjà en place a été conservé (et non remplacé
  par un bleu néon) pour rester cohérent avec le texte "Yggdrasil" déjà
  publié.
- **Pied de page** harmonisé sur l'accueil et `stats.html` (liens GitHub,
  À propos, Prestations, Statistiques/Accueil).

## Licence

Voir [LICENSE](./LICENSE) : toute réutilisation du contenu nécessite une
autorisation préalable de l'auteur.
