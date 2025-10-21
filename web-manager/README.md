# ARK Server Web Manager

Interface web moderne pour gérer les serveurs ARK: Survival Evolved, remplaçant les commandes en ligne de commande par une interface intuitive.

## Fonctionnalités

Cette interface web offre une alternative conviviale aux commandes en ligne de commande d'arkmanager, avec les fonctionnalités suivantes :

### Tableau de bord
- Vue d'ensemble de tous les serveurs configurés
- Statistiques en temps réel (serveurs en ligne/hors ligne, nombre total)
- Liste des serveurs récents avec leur statut

### Gestion des serveurs
- Créer, configurer et supprimer des instances de serveur
- Démarrer, arrêter et redémarrer les serveurs via des boutons simples
- Configurer les paramètres (carte, nombre de joueurs, ports, RCON)
- Visualiser le statut en temps réel de chaque serveur

### Gestion des mods
- Installer et désinstaller des mods depuis le Steam Workshop
- Activer et désactiver des mods
- Vérifier les mises à jour des mods
- Gérer l'ordre de chargement des mods

### Sauvegardes
- Créer des sauvegardes manuelles
- Consulter l'historique des sauvegardes
- Restaurer une sauvegarde spécifique
- Supprimer les anciennes sauvegardes

### Communication
- Envoyer des messages broadcast aux joueurs connectés
- Exécuter des commandes RCON personnalisées

### Logs et historique
- Consulter l'historique des commandes exécutées
- Visualiser les logs de chaque serveur
- Suivre les actions des utilisateurs

## Architecture technique

L'application est construite avec une stack moderne :

- **Frontend** : React 19 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend** : Node.js + Express + tRPC 11
- **Base de données** : MySQL/TiDB (via Drizzle ORM)
- **Authentification** : JWT avec support OAuth
- **Communication** : tRPC pour une API type-safe end-to-end

## Prérequis

- Node.js 22.x ou supérieur
- pnpm (gestionnaire de paquets)
- MySQL ou TiDB (base de données)
- arkmanager installé et configuré sur le système

## Installation

1. Cloner le dépôt :
```bash
git clone https://github.com/LHRICO78/ark-server-tools.git
cd ark-server-tools
git checkout web-interface
cd web-manager
```

2. Installer les dépendances :
```bash
pnpm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

4. Initialiser la base de données :
```bash
pnpm db:push
```

5. Démarrer le serveur de développement :
```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

## Configuration

### Variables d'environnement

Les variables d'environnement suivantes doivent être configurées :

- `DATABASE_URL` : URL de connexion à la base de données MySQL
- `JWT_SECRET` : Secret pour signer les tokens JWT
- `VITE_APP_ID` : ID de l'application OAuth
- `OAUTH_SERVER_URL` : URL du serveur OAuth
- `VITE_OAUTH_PORTAL_URL` : URL du portail de connexion OAuth
- `VITE_APP_TITLE` : Titre de l'application (par défaut : "ARK Server Web Manager")
- `VITE_APP_LOGO` : URL du logo de l'application

### Intégration avec arkmanager

L'interface web communique avec arkmanager via des appels système. Assurez-vous que :

1. arkmanager est installé et accessible via `/usr/local/bin/arkmanager`
2. L'utilisateur exécutant l'application web a les permissions nécessaires pour exécuter les commandes arkmanager
3. Les instances de serveur sont correctement configurées dans arkmanager

## Déploiement

Pour déployer l'application en production :

1. Construire l'application :
```bash
pnpm build
```

2. Démarrer le serveur de production :
```bash
pnpm start
```

3. Configurer un reverse proxy (nginx, Apache) pour exposer l'application
4. Configurer un service systemd pour démarrer automatiquement l'application

## Compatibilité

Cette interface web est entièrement compatible avec les scripts bash arkmanager existants. Les utilisateurs peuvent continuer à utiliser les commandes en ligne de commande s'ils le souhaitent, l'interface web servant d'alternative plus conviviale.

Toutes les configurations sont stockées dans la base de données et synchronisées avec les fichiers de configuration d'arkmanager.

## Développement

### Structure du projet

```
web-manager/
├── client/              # Application React frontend
│   ├── src/
│   │   ├── components/  # Composants UI réutilisables
│   │   ├── pages/       # Pages de l'application
│   │   ├── lib/         # Utilitaires et configuration
│   │   └── hooks/       # Hooks React personnalisés
│   └── public/          # Fichiers statiques
├── server/              # API Node.js backend
│   ├── routers.ts       # Routes tRPC
│   ├── db.ts            # Fonctions de base de données
│   ├── arkmanager.ts    # Interface avec arkmanager
│   └── _core/           # Configuration du serveur
├── drizzle/             # Schéma et migrations de base de données
│   └── schema.ts        # Définition des tables
└── shared/              # Types et constantes partagés
```

### Ajouter de nouvelles fonctionnalités

1. Définir le schéma de base de données dans `drizzle/schema.ts`
2. Créer les fonctions de requête dans `server/db.ts`
3. Ajouter les routes tRPC dans `server/routers.ts`
4. Créer les composants UI dans `client/src/pages/`
5. Utiliser les hooks tRPC pour appeler l'API

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub :
https://github.com/LHRICO78/ark-server-tools/issues

## Licence

Ce projet est sous licence MIT, comme le projet arkmanager original.

## Crédits

- Projet original arkmanager : https://github.com/arkmanager/ark-server-tools
- Interface web développée par LHRICO78

