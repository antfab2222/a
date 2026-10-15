# Espace d'administration — travail en cours

Cette branche sert à développer l'éditeur privé du portfolio, sans modifier la branche `main` ni le site public.

## État actuel
- `admin/index.html` : page d'attente non liée à la navigation publique.
- `admin/config.yml` : configuration initiale Decap CMS, **non activée**.
- Les pages HTML existantes continuent d'utiliser leurs images et textes statiques.
- Aucun mécanisme d'authentification n'est encore déployé : **ne pas présenter /admin comme un espace sécurisé opérationnel**.

## À réaliser avant utilisation
1. Choisir un hébergeur pour la passerelle OAuth GitHub, ou une autre solution CMS avec authentification.
2. Configurer et tester la connexion sécurisée, les permissions et la déconnexion.
3. Relier les données de `contenu/projets/*.json` aux pages publiques (ou migrer vers un générateur statique).
4. Mettre en place brouillons / aperçu / publication sans modification immédiate du site public.
5. Tester l'import d'images, le recadrage, les légendes, l'ordre des galeries et les vidéos.
6. Tester la branche en prévisualisation avant fusion dans `main`.

**Important :** cacher un lien /admin ou ajouter une balise noindex ne constitue pas une mesure de sécurité.
Ne jamais stocker un token GitHub ou un secret OAuth dans le HTML ou le JavaScript public.
