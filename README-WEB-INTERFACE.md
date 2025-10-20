# ARK Server Tools - Web Interface Fork

Ce fork du projet [arkmanager/ark-server-tools](https://github.com/arkmanager/ark-server-tools) ajoute une **interface web moderne** pour gérer les serveurs ARK: Survival Evolved sans avoir à utiliser les commandes en ligne de commande.

## Nouveautés de ce fork

### Interface Web Complète

Ce fork introduit une interface web complète qui permet de gérer tous les aspects de vos serveurs ARK via un navigateur web. L'interface web offre une alternative conviviale aux commandes en ligne de commande tout en restant entièrement compatible avec les scripts bash originaux.

**Fonctionnalités principales :**

- **Tableau de bord** : Vue d'ensemble de tous vos serveurs avec statistiques en temps réel
- **Gestion des serveurs** : Créer, démarrer, arrêter, redémarrer et configurer vos serveurs en quelques clics
- **Gestion des mods** : Installer, désinstaller, activer et désactiver des mods depuis le Steam Workshop
- **Sauvegardes** : Créer et restaurer des sauvegardes facilement
- **Communication** : Envoyer des messages broadcast et exécuter des commandes RCON
- **Logs** : Consulter l'historique des commandes et les logs des serveurs
- **Authentification** : Système de connexion sécurisé avec gestion des utilisateurs

### Captures d'écran

L'interface web offre une expérience utilisateur moderne et intuitive avec :
- Design responsive compatible mobile, tablette et desktop
- Thème clair professionnel
- Navigation par sidebar pour un accès rapide à toutes les fonctionnalités
- Cartes de statistiques pour visualiser l'état de vos serveurs
- Boutons d'action pour contrôler vos serveurs facilement

## Installation

### Prérequis

En plus des prérequis du projet original, l'interface web nécessite :

- **Node.js** 22.x ou supérieur
- **pnpm** (gestionnaire de paquets Node.js)
- **MySQL** ou **TiDB** (base de données)

### Installation de l'interface web

1. Cloner ce fork :
```bash
git clone https://github.com/LHRICO78/ark-server-tools.git
cd ark-server-tools
git checkout web-interface
```

2. Installer arkmanager (si ce n'est pas déjà fait) :
```bash
curl -sL https://raw.githubusercontent.com/LHRICO78/ark-server-tools/web-interface/netinstall.sh | sudo bash -s steam
```

3. Installer l'interface web :
```bash
cd web-manager
./install.sh
```

Le script d'installation vous guidera à travers les étapes suivantes :
- Vérification des prérequis
- Installation des dépendances Node.js
- Configuration de la base de données
- Création du fichier de configuration
- Optionnellement, création d'un service systemd

4. Configurer la base de données :

Éditez le fichier `.env` dans le dossier `web-manager` et configurez votre connexion à la base de données :

```bash
DATABASE_URL=mysql://user:password@localhost:3306/ark_web_manager
JWT_SECRET=votre-secret-jwt-aleatoire
```

5. Démarrer l'interface web :

**Mode développement :**
```bash
cd web-manager
pnpm dev
```

**Mode production :**
```bash
cd web-manager
pnpm build
pnpm start
```

**Avec systemd :**
```bash
sudo systemctl start ark-web-manager
sudo systemctl enable ark-web-manager  # Démarrage automatique
```

L'interface web sera accessible sur `http://localhost:3000`

## Utilisation

### Accès à l'interface web

1. Ouvrez votre navigateur et accédez à `http://votre-serveur:3000`
2. Connectez-vous avec vos identifiants
3. Vous arrivez sur le tableau de bord avec la vue d'ensemble de vos serveurs

### Créer un nouveau serveur

1. Cliquez sur "Serveurs" dans le menu de gauche
2. Cliquez sur le bouton "Nouveau serveur"
3. Remplissez le formulaire avec les informations de votre serveur :
   - Nom du serveur
   - Nom d'instance (utilisé par arkmanager)
   - Carte (TheIsland, Ragnarok, etc.)
   - Nombre de joueurs maximum
   - Ports (serveur, query, RCON)
   - Mot de passe RCON
4. Cliquez sur "Créer"

### Gérer un serveur

Depuis la page "Serveurs", vous pouvez :
- **Démarrer** un serveur arrêté
- **Arrêter** un serveur en cours d'exécution
- **Redémarrer** un serveur
- **Configurer** les paramètres d'un serveur
- **Supprimer** un serveur

### Gérer les mods

1. Cliquez sur "Mods" dans le menu de gauche
2. Sélectionnez le serveur concerné
3. Cliquez sur "Installer un mod" et entrez l'ID du mod Steam Workshop
4. Vous pouvez ensuite activer/désactiver les mods installés

### Créer une sauvegarde

1. Cliquez sur "Sauvegardes" dans le menu de gauche
2. Sélectionnez le serveur à sauvegarder
3. Cliquez sur "Créer une sauvegarde"
4. Ajoutez une description optionnelle

### Envoyer un message aux joueurs

1. Accédez à la page d'un serveur
2. Cliquez sur "Broadcast"
3. Entrez votre message
4. Cliquez sur "Envoyer"

## Compatibilité

L'interface web est **entièrement compatible** avec les commandes arkmanager existantes. Vous pouvez :

- Utiliser l'interface web ET les commandes en ligne de commande simultanément
- Gérer des serveurs créés via arkmanager dans l'interface web
- Gérer des serveurs créés via l'interface web avec arkmanager

Toutes les opérations effectuées via l'interface web utilisent les mêmes scripts bash que les commandes en ligne de commande.

## Architecture technique

L'interface web est construite avec une stack moderne :

- **Frontend** : React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : Node.js, Express, tRPC 11
- **Base de données** : MySQL/TiDB avec Drizzle ORM
- **Authentification** : JWT avec support OAuth
- **Communication** : tRPC pour une API type-safe end-to-end

## Documentation

- [README de l'interface web](web-manager/README.md) - Documentation complète de l'interface web
- [README original](README.asciidoc) - Documentation d'arkmanager

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork ce projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/ma-fonctionnalite`)
3. Commiter vos changements (`git commit -am 'Ajout de ma fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/ma-fonctionnalite`)
5. Créer une Pull Request

## Support

Pour toute question ou problème :

- **Interface web** : Ouvrez une issue sur [ce fork](https://github.com/LHRICO78/ark-server-tools/issues)
- **arkmanager** : Consultez le [projet original](https://github.com/arkmanager/ark-server-tools)

## Licence

Ce projet conserve la même licence que le projet original arkmanager.

## Remerciements

- Projet original **arkmanager** : [arkmanager/ark-server-tools](https://github.com/arkmanager/ark-server-tools)
- Tous les contributeurs du projet original
- La communauté ARK: Survival Evolved

## Auteur du fork

- **LHRICO78** - Interface web et intégration

---

**Note** : Ce fork est un projet indépendant et n'est pas officiellement affilié au projet arkmanager original. Il vise à fournir une interface web moderne tout en préservant la compatibilité avec les scripts bash existants.

