# Guide de démarrage rapide - Interface Web ARK Server Manager

Ce guide vous permet d'installer et de démarrer l'interface web en quelques minutes.

## Installation rapide (5 minutes)

### 1. Prérequis

Installez Node.js 22.x :
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
npm install -g pnpm
```

Installez MySQL :
```bash
sudo apt update && sudo apt install mysql-server -y
sudo systemctl start mysql
```

### 2. Cloner le projet

```bash
cd /opt
sudo git clone https://github.com/LHRICO78/ark-server-tools.git
cd ark-server-tools
sudo git checkout web-interface
cd web-manager
sudo chown -R $USER:$USER .
```

### 3. Configurer la base de données

```bash
# Créer la base de données
sudo mysql -e "CREATE DATABASE ark_web_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'arkweb'@'localhost' IDENTIFIED BY 'ChangeMe123!';"
sudo mysql -e "GRANT ALL PRIVILEGES ON ark_web_manager.* TO 'arkweb'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"
```

### 4. Configurer l'application

```bash
# Créer le fichier .env
cat > .env << 'EOF'
DATABASE_URL=mysql://arkweb:ChangeMe123!@localhost:3306/ark_web_manager
JWT_SECRET=$(openssl rand -base64 64)
VITE_APP_ID=ark-web-manager
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
OWNER_NAME=Admin
VITE_APP_TITLE=ARK Server Web Manager
VITE_APP_LOGO=/logo.png
EOF
```

### 5. Installer et démarrer

```bash
# Installer les dépendances
pnpm install

# Initialiser la base de données
pnpm db:push

# Démarrer en mode développement
pnpm dev
```

**C'est tout !** Ouvrez votre navigateur sur `http://localhost:3000`

## Installation en production

Pour une installation en production avec démarrage automatique :

```bash
# Construire l'application
pnpm build

# Créer le service systemd
sudo tee /etc/systemd/system/ark-web-manager.service > /dev/null << EOF
[Unit]
Description=ARK Server Web Manager
After=network.target mysql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/ark-server-tools/web-manager
ExecStart=$(which pnpm) start
Restart=on-failure
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
EOF

# Démarrer le service
sudo systemctl daemon-reload
sudo systemctl enable ark-web-manager
sudo systemctl start ark-web-manager
```

Vérifiez le statut :
```bash
sudo systemctl status ark-web-manager
```

## Accès depuis l'extérieur

### Ouvrir le port dans le pare-feu

```bash
sudo ufw allow 3000/tcp
```

### Avec Nginx (recommandé)

```bash
# Installer Nginx
sudo apt install nginx -y

# Créer la configuration
sudo tee /etc/nginx/sites-available/ark-web-manager > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Activer la configuration
sudo ln -s /etc/nginx/sites-available/ark-web-manager /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Accédez maintenant à l'interface via `http://votre-ip-serveur`

## Commandes utiles

```bash
# Démarrer l'interface
sudo systemctl start ark-web-manager

# Arrêter l'interface
sudo systemctl stop ark-web-manager

# Redémarrer l'interface
sudo systemctl restart ark-web-manager

# Voir les logs
sudo journalctl -u ark-web-manager -f

# Mettre à jour
cd /opt/ark-server-tools
sudo git pull origin web-interface
cd web-manager
pnpm install
pnpm db:push
sudo systemctl restart ark-web-manager
```

## Premiers pas dans l'interface

1. **Connectez-vous** avec votre compte
2. **Créez votre premier serveur** :
   - Cliquez sur "Serveurs" dans le menu
   - Cliquez sur "Nouveau serveur"
   - Remplissez les informations (nom, instance, carte, ports)
   - Cliquez sur "Créer"
3. **Démarrez le serveur** :
   - Cliquez sur le bouton "Démarrer"
   - Attendez que le statut passe à "online"
4. **Gérez vos mods** :
   - Allez dans la section "Mods"
   - Entrez l'ID d'un mod Steam Workshop
   - Cliquez sur "Installer"

## Problèmes courants

### Le port 3000 est déjà utilisé
```bash
# Trouver le processus
sudo lsof -i :3000
# Tuer le processus
sudo kill -9 <PID>
```

### Erreur de connexion à la base de données
```bash
# Vérifier que MySQL est démarré
sudo systemctl status mysql
# Redémarrer MySQL si nécessaire
sudo systemctl restart mysql
```

### Permission denied pour arkmanager
```bash
# Ajouter l'utilisateur au groupe steam
sudo usermod -aG steam $USER
# Redémarrer la session ou le service
sudo systemctl restart ark-web-manager
```

## Support

- **Documentation complète** : [INSTALLATION-WEB-INTERFACE.md](INSTALLATION-WEB-INTERFACE.md)
- **Issues GitHub** : https://github.com/LHRICO78/ark-server-tools/issues
- **Projet original** : https://github.com/arkmanager/ark-server-tools

---

**Besoin d'aide ?** Consultez le guide d'installation complet ou créez une issue sur GitHub.

