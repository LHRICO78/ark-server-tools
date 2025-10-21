# Guide d'installation de l'interface web ARK Server Manager

Ce guide vous explique comment installer et configurer l'interface web pour gérer vos serveurs ARK: Survival Evolved.

## Table des matières

1. [Prérequis](#prérequis)
2. [Installation d'arkmanager](#installation-darkmanager)
3. [Installation de l'interface web](#installation-de-linterface-web)
4. [Configuration](#configuration)
5. [Démarrage](#démarrage)
6. [Accès à l'interface](#accès-à-linterface)
7. [Configuration en production](#configuration-en-production)
8. [Dépannage](#dépannage)

## Prérequis

Avant de commencer, assurez-vous d'avoir :

### Système d'exploitation
- Ubuntu 20.04 LTS ou supérieur
- Debian 10 ou supérieur
- CentOS 8 ou supérieur

### Logiciels requis

1. **Node.js 22.x ou supérieur**
```bash
# Installer Node.js via nvm (recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22

# Vérifier l'installation
node --version  # Doit afficher v22.x.x
```

2. **pnpm (gestionnaire de paquets)**
```bash
npm install -g pnpm

# Vérifier l'installation
pnpm --version
```

3. **MySQL ou TiDB**
```bash
# Installer MySQL sur Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# Démarrer MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Sécuriser MySQL
sudo mysql_secure_installation
```

4. **Git**
```bash
sudo apt install git
```

## Installation d'arkmanager

Si arkmanager n'est pas encore installé sur votre système :

```bash
# Installer arkmanager
curl -sL https://raw.githubusercontent.com/LHRICO78/ark-server-tools/web-interface/netinstall.sh | sudo bash -s steam

# Vérifier l'installation
arkmanager version
```

Pour plus d'informations sur la configuration d'arkmanager, consultez le [README original](README.asciidoc).

## Installation de l'interface web

### Étape 1 : Cloner le dépôt

```bash
# Cloner le fork avec l'interface web
cd /opt
sudo git clone https://github.com/LHRICO78/ark-server-tools.git
cd ark-server-tools

# Basculer sur la branche web-interface
sudo git checkout web-interface

# Accéder au dossier de l'interface web
cd web-manager
```

### Étape 2 : Créer la base de données

```bash
# Se connecter à MySQL
sudo mysql

# Créer la base de données et l'utilisateur
CREATE DATABASE ark_web_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'arkweb'@'localhost' IDENTIFIED BY 'votre_mot_de_passe_securise';
GRANT ALL PRIVILEGES ON ark_web_manager.* TO 'arkweb'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Étape 3 : Configurer les permissions

```bash
# Donner les permissions appropriées
sudo chown -R $USER:$USER /opt/ark-server-tools/web-manager
```

### Étape 4 : Installer les dépendances

```bash
# Installer les dépendances Node.js
cd /opt/ark-server-tools/web-manager
pnpm install
```

Cette étape peut prendre quelques minutes.

## Configuration

### Étape 1 : Créer le fichier de configuration

```bash
cd /opt/ark-server-tools/web-manager
cp .env.example .env
nano .env
```

### Étape 2 : Configurer les variables d'environnement

Éditez le fichier `.env` avec les valeurs suivantes :

```bash
# Configuration de la base de données
DATABASE_URL=mysql://arkweb:votre_mot_de_passe_securise@localhost:3306/ark_web_manager

# Secret JWT (générez une chaîne aléatoire sécurisée)
JWT_SECRET=votre_secret_jwt_aleatoire_tres_long_et_securise

# Configuration OAuth (optionnel)
# Configurez ces valeurs si vous souhaitez utiliser l'authentification OAuth
VITE_APP_ID=ark-web-manager
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=

# Informations du propriétaire (optionnel)
OWNER_OPEN_ID=
OWNER_NAME=Admin

# Branding de l'application
VITE_APP_TITLE=ARK Server Web Manager
VITE_APP_LOGO=/logo.png

# APIs externes (optionnel)
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Analytics (optionnel)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

**Important** : Remplacez `votre_mot_de_passe_securise` et `votre_secret_jwt_aleatoire_tres_long_et_securise` par vos propres valeurs sécurisées.

Pour générer un secret JWT sécurisé :
```bash
openssl rand -base64 64
```

### Étape 3 : Initialiser la base de données

```bash
cd /opt/ark-server-tools/web-manager
pnpm db:push
```

Cette commande créera toutes les tables nécessaires dans la base de données.

## Démarrage

### Mode développement

Pour tester l'interface en mode développement :

```bash
cd /opt/ark-server-tools/web-manager
pnpm dev
```

L'interface sera accessible sur `http://localhost:3000`

### Mode production

Pour démarrer l'interface en mode production :

```bash
cd /opt/ark-server-tools/web-manager

# Construire l'application
pnpm build

# Démarrer le serveur
pnpm start
```

## Accès à l'interface

### En local

Ouvrez votre navigateur et accédez à :
```
http://localhost:3000
```

### Depuis un autre ordinateur

Si vous souhaitez accéder à l'interface depuis un autre ordinateur sur votre réseau :

1. Trouvez l'adresse IP de votre serveur :
```bash
ip addr show | grep inet
```

2. Ouvrez le port 3000 dans le pare-feu :
```bash
sudo ufw allow 3000/tcp
```

3. Accédez à l'interface via :
```
http://adresse_ip_du_serveur:3000
```

### Première connexion

Lors de la première connexion, vous devrez créer un compte administrateur.

## Configuration en production

### Utiliser systemd pour démarrer automatiquement

Créez un service systemd pour que l'interface démarre automatiquement au démarrage du serveur :

```bash
sudo nano /etc/systemd/system/ark-web-manager.service
```

Ajoutez le contenu suivant :

```ini
[Unit]
Description=ARK Server Web Manager
After=network.target mysql.service

[Service]
Type=simple
User=steam
WorkingDirectory=/opt/ark-server-tools/web-manager
ExecStart=/usr/bin/pnpm start
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal

# Variables d'environnement
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

**Note** : Remplacez `steam` par l'utilisateur qui exécute arkmanager sur votre système.

Activez et démarrez le service :

```bash
sudo systemctl daemon-reload
sudo systemctl enable ark-web-manager
sudo systemctl start ark-web-manager
```

Vérifiez le statut :

```bash
sudo systemctl status ark-web-manager
```

Consultez les logs :

```bash
sudo journalctl -u ark-web-manager -f
```

### Configurer un reverse proxy avec Nginx

Pour exposer l'interface sur le port 80/443 avec un nom de domaine :

1. Installer Nginx :
```bash
sudo apt install nginx
```

2. Créer la configuration :
```bash
sudo nano /etc/nginx/sites-available/ark-web-manager
```

3. Ajouter la configuration :
```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

4. Activer la configuration :
```bash
sudo ln -s /etc/nginx/sites-available/ark-web-manager /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. (Optionnel) Installer un certificat SSL avec Let's Encrypt :
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com
```

### Configurer les permissions arkmanager

L'utilisateur qui exécute l'interface web doit avoir les permissions pour exécuter les commandes arkmanager :

```bash
# Ajouter l'utilisateur au groupe steam (ou le groupe qui exécute arkmanager)
sudo usermod -aG steam $USER

# Donner les permissions sudo pour arkmanager (optionnel mais recommandé)
sudo visudo
```

Ajoutez cette ligne :
```
steam ALL=(ALL) NOPASSWD: /usr/local/bin/arkmanager
```

## Dépannage

### Erreur de connexion à la base de données

**Symptôme** : `Error: Failed to initialize database`

**Solution** :
1. Vérifiez que MySQL est démarré :
```bash
sudo systemctl status mysql
```

2. Vérifiez vos identifiants dans `.env`
3. Testez la connexion manuellement :
```bash
mysql -u arkweb -p ark_web_manager
```

### Port 3000 déjà utilisé

**Symptôme** : `Error: listen EADDRINUSE: address already in use :::3000`

**Solution** :
1. Trouvez le processus qui utilise le port :
```bash
sudo lsof -i :3000
```

2. Arrêtez le processus ou changez le port dans le fichier de configuration

### Erreur "arkmanager: command not found"

**Symptôme** : Les commandes ne s'exécutent pas depuis l'interface

**Solution** :
1. Vérifiez que arkmanager est installé :
```bash
which arkmanager
```

2. Si le chemin est différent de `/usr/local/bin/arkmanager`, modifiez le fichier `server/arkmanager.ts` :
```typescript
const ARKMANAGER_PATH = "/chemin/vers/arkmanager";
```

### Problèmes de permissions

**Symptôme** : `Permission denied` lors de l'exécution de commandes

**Solution** :
1. Vérifiez que l'utilisateur a les bonnes permissions :
```bash
sudo usermod -aG steam $USER
```

2. Redémarrez le service :
```bash
sudo systemctl restart ark-web-manager
```

### L'interface ne charge pas

**Symptôme** : Page blanche ou erreur 502

**Solution** :
1. Vérifiez que le serveur est démarré :
```bash
sudo systemctl status ark-web-manager
```

2. Consultez les logs :
```bash
sudo journalctl -u ark-web-manager -n 50
```

3. Vérifiez que toutes les dépendances sont installées :
```bash
cd /opt/ark-server-tools/web-manager
pnpm install
```

## Support

Si vous rencontrez des problèmes non couverts par ce guide :

1. Consultez les logs de l'application
2. Vérifiez les [issues GitHub](https://github.com/LHRICO78/ark-server-tools/issues)
3. Créez une nouvelle issue avec :
   - Description du problème
   - Messages d'erreur
   - Logs pertinents
   - Version de votre système d'exploitation
   - Versions de Node.js et pnpm

## Mise à jour

Pour mettre à jour l'interface web :

```bash
cd /opt/ark-server-tools
sudo git pull origin web-interface
cd web-manager
pnpm install
pnpm db:push
sudo systemctl restart ark-web-manager
```

## Désinstallation

Pour désinstaller complètement l'interface web :

```bash
# Arrêter et désactiver le service
sudo systemctl stop ark-web-manager
sudo systemctl disable ark-web-manager
sudo rm /etc/systemd/system/ark-web-manager.service
sudo systemctl daemon-reload

# Supprimer la base de données
sudo mysql -e "DROP DATABASE ark_web_manager; DROP USER 'arkweb'@'localhost';"

# Supprimer les fichiers
sudo rm -rf /opt/ark-server-tools/web-manager

# Supprimer la configuration Nginx (si configurée)
sudo rm /etc/nginx/sites-enabled/ark-web-manager
sudo rm /etc/nginx/sites-available/ark-web-manager
sudo systemctl restart nginx
```

---

**Félicitations !** Vous avez maintenant une interface web moderne pour gérer vos serveurs ARK: Survival Evolved. 🎮

