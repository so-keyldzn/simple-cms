# MinIO Setup Guide

Ce projet utilise MinIO pour le stockage des fichiers médias.

## Démarrage rapide

### 1. Démarrer les services avec Docker Compose

```bash
docker-compose up -d
```

Cela démarre :
- **PostgreSQL** sur le port `5432`
- **MinIO API** sur le port `9000`
- **MinIO Console** sur le port `9001`

### 2. Configurer les variables d'environnement

Copiez `.env.example` vers `.env` et ajoutez :

```env
# Database (local Docker)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cms"

# MinIO Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=cms-media
MINIO_USE_SSL=false
NEXT_PUBLIC_MINIO_PUBLIC_URL=http://localhost:9000
```

### 3. Initialiser la base de données

```bash
npx prisma generate
npx prisma db push
```

### 4. Démarrer l'application

```bash
pnpm dev
```

## Accès aux services

- **Application** : http://localhost:3000
- **MinIO Console** : http://localhost:9001
  - Username: `minioadmin`
  - Password: `minioadmin`
- **MinIO API** : http://localhost:9000

## Upload de fichiers

Les fichiers sont uploadés via l'API route `/api/upload` et stockés dans MinIO.

### Limites

- Taille maximale : **10 MB** par fichier
- Types acceptés : images, vidéos, PDF

### Architecture

```
User Upload → /api/upload → MinIO Storage → Database Entry
                    ↓
              Generate Public URL
```

## Gestion des médias

Accédez à la Media Library : http://localhost:3000/admin/media

Fonctionnalités :
- ✅ Upload de fichiers
- ✅ Prévisualisation
- ✅ Copier URL
- ✅ Suppression
- ✅ Alt text & captions

## Commandes utiles

```bash
# Démarrer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f

# Réinitialiser les volumes (⚠️ supprime les données)
docker-compose down -v
```

## Production

Pour la production, configurez :
- Un bucket MinIO distant ou S3
- SSL/TLS activé (`MINIO_USE_SSL=true`)
- Credentials sécurisés
- CDN devant MinIO pour les performances
