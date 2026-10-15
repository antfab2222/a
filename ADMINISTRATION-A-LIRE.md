# Administration du portfolio — version 1

Le tableau de bord est disponible à `/admin/` sur le domaine GitHub Pages, depuis la branche `main`.

## Fonctions disponibles
- Connexion via un jeton personnel GitHub **fine-grained** saisi à chaque session, jamais stocké dans localStorage ou cookies.
- Choix du projet et aperçu de ses images existantes.
- Remplacement d'images au **même chemin**, sans modifier les références HTML.
- Import d'une nouvelle image dans `images/uploads/` (ne l'insère pas encore dans les pages).
- Confirmation avant publication ; les modifications sont commitées directement sur `main`.

## Configuration du jeton
Sur GitHub > Settings > Developer settings > Personal access tokens > Fine-grained tokens :
- Resource owner : compte possédant le dépôt
- Repository access : Only select repositories > `antfab2222/a`
- Repository permissions : Contents > Read and write
- Choisir une durée d'expiration courte.

**Ne jamais envoyer le jeton dans une conversation, un commit ou une capture d'écran.**

## Limites et sécurité
- L'interface HTML est publiquement accessible, mais toute écriture exige une autorisation GitHub valide. L'absence de lien public n'est pas une protection.
- Le jeton est gardé uniquement en mémoire de la page ; fermer/recharger impose de se reconnecter.
- Les images remplacées sont publiées directement sur `main` ; pas de brouillons dans cette version.
- Les légendes, la mise en page, la suppression, le réordonnancement et l'ajout automatique à la galerie ne sont pas encore pris en charge.
- L'interface est une solution transitoire ; prévoir une authentification OAuth avec backend sécurisé pour un usage durable.
- Un remplacement doit conserver l'extension du fichier d'origine ; maximum 15 Mo.
- Les changements du site peuvent apparaître après le déploiement GitHub Pages et expiration des caches.

Sauvegarde du site antérieur : branche `backup/site-avant-administration`.
