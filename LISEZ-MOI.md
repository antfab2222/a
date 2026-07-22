# Portfolio Antoine Fabre — structure du site

Site statique multi-pages (HTML / CSS / JS). Aucune dépendance à installer :
ouvre simplement `index.html` dans un navigateur, ou héberge le dossier tel quel.

## Pages

| Fichier | Rôle |
|---|---|
| `index.html` | Accueil (hero, profil, projets en aperçu, contact) |
| `portfolio.html` | Tous les projets + **filtre par mot-clé** |
| `cv.html` | CV : compétences, outils, langues, parcours |
| `projet-habiter-archipel.html` | Projet — Habiter l’archipel |
| `projet-nayka.html` | Projet — Nayka |
| `projet-odyssee.html` | Projet — Odyssée Médicale |
| `projet-techniques.html` | Études techniques — restaurant, studio et escalier |
| `styles.css` / `site.js` | Design system + comportements partagés |

## Mots-clés cliquables

Chaque mot-clé (tag) mène à `portfolio.html?tag=…` qui filtre les projets
partageant cette discipline. Tags disponibles :
`design-espace`, `architecture`, `scenographie`, `materiaux`, `technique`,
`fabrication`, `lumiere`, `soin`, `patrimoine`.

Pour rendre un nouveau mot-clé cliquable, il suffit d'ajouter la même valeur
dans `data-tags="…"` de la carte projet (dans `portfolio.html`) et d'utiliser
`<a class="tag" href="portfolio.html?tag=…">…</a>` partout où il apparaît.

## Images

Le dossier `images/` contient les **fonds topographiques** (déjà générés :
`topo-hero.svg`, `topo-wide.svg`, `topo-panel.svg`).

Le portrait extrait du CV est déjà inclus sous le nom `portrait.jpg`.
Pour les projets, dépose tes fichiers dans `images/` avec les noms ci-dessous :
ils remplaceront automatiquement les cadres gris. Le nom attendu est affiché
dans chaque cadre vide.

- `archipel-hero.jpg`, `archipel-exterior-1.jpg`, `archipel-exterior-2.jpg`
- `archipel-bar.jpg`, `archipel-dorm.jpg`, `archipel-circulation.jpg`
- `archipel-plan-rdc.jpg`, `archipel-plans-etages.jpg`, `archipel-coupes.jpg`, `archipel-facades.jpg`, `archipel-a1.jpg`
- Nayka est livré entièrement en PNG :
  `nayka-hero.png`, `nayka-entree.png`, `nayka-salon.png`, `nayka-cuisine.png`,
  `nayka-zoning-r2.png`, `nayka-zoning-r3.png`, `nayka-plan-r2.png`,
  `nayka-plan-r3.png`, `nayka-coupe-r2.png`, `nayka-coupe-r3.png` et `nayka-a1.png`
- Odyssée Médicale est déjà livré en PNG :
  `odyssee-hero.png`, `odyssee-tranquillite.png`, `odyssee-lagon.png`,
  `odyssee-restauration.png`, `odyssee-zoning.png`, `odyssee-plan-general.png`,
  `odyssee-plan-accueil.png`, `odyssee-plan-enfants.png`,
  `odyssee-plan-restauration.png`, `odyssee-maquette-1.png` à
  `odyssee-maquette-4.png` et `odyssee-a1.png`
- Études techniques :
  `techniques-hero.png`,
  `tech-restaurant-plan.png`, `tech-restaurant-bar.png`, `tech-restaurant-lounge.png`,
  `tech-studio-plan.png`, `tech-studio-detail.png`,
  `tech-escalier-plan-rdc.png`, `tech-escalier-plan-r1.png`,
  `tech-escalier-elevation-1.png`, `tech-escalier-elevation-2.png`,
  `tech-escalier-coupe.png` et `tech-escalier-detail.png`

Si une image manque, le cadre reste propre (texture + libellé) — rien ne casse.



## Études techniques

La page `projet-techniques.html` est divisée en trois microprojets autonomes :

1. **Restaurant ELOIE** — plan général, coupe du bar et élévation du lounge ;
2. **Aménagement de studio** — élévation générale et détail du mobilier intégré ;
3. **Escalier d’hôtel** — plans RDC/R+1, deux élévations, une coupe et un détail.

Les fichiers sources ont été convertis en PNG optimisés pour le web. Ne les renomme pas si tu souhaites conserver les liens existants.

## Vidéos immersives

Le dossier `videos/` contient un lecteur prêt à l’emploi pour chaque projet.
Pour ajouter ou remplacer une visite immersive, conserve exactement le nom attendu :

- `habiter-archipel-immersive.mp4`
- `nayka-immersive.mp4`
- `odyssee-medicale-immersive.mp4`
- `techniques-immersive.mp4`

Nayka contient aussi trois séquences complémentaires :
`nayka-attente.mp4`, `nayka-repos.mp4` et `nayka-vie-commune.mp4`.
Les petites vidéos d’attente des autres projets peuvent simplement être écrasées par les futurs MP4 : aucune modification HTML n’est nécessaire.

## Finalisation avant publication

Le site est utilisable sans JavaScript, accessible au clavier et optimisé pour les images.
Le CV en ligne reprend désormais la formation, les expériences, les compétences et la
recherche de stage en architecture pour un Master du document fourni. Le fichier `cv-antoine-fabre.pdf` est inclus et
accessible depuis le bouton de téléchargement. Les projets « Habiter l’archipel », « Nayka » et « Odyssée Médicale » sont entièrement intégrés. La page « Études techniques » sépare clairement trois microprojets : restaurant ELOIE, aménagement de studio et escalier d’hôtel.

## Améliorations intégrées

- navigation principale isolée du pied de page ;
- menu mobile accessible (`aria-expanded`, touche Échap, fermeture extérieure) ;
- lien d’évitement et styles de focus clavier ;
- contenu visible même sans JavaScript ;
- filtres de projets annoncés aux technologies d’assistance ;
- vignettes et galeries stabilisées par des ratios d’image ;
- chargement différé des images secondaires et priorité donnée aux visuels principaux ;
- métadonnées de partage, couleur de thème et structure sémantique `<main>` ;
- fonds SVG topographiques allégés ;
- CV public aligné sur le CV fourni, avec portrait et PDF téléchargeable.


## Photos de maquettes

Déposez les photographies directement dans le dossier `images/` en conservant les noms suivants. Les emplacements apparaîtront automatiquement sur les pages :

- `nayka-maquette-1.png`, `nayka-maquette-2.png`, `nayka-maquette-3.png`
- `habiter-archipel-maquette-1.png`, `habiter-archipel-maquette-2.png`, `habiter-archipel-maquette-3.png`
- `techniques-maquette-1.png`, `techniques-maquette-2.png`, `techniques-maquette-3.png`

Odyssée Médicale possède déjà sa galerie de maquette avec les fichiers `odyssee-maquette-1.png` à `odyssee-maquette-4.png`.
