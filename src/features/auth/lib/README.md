# Authentication & Admin IDs

## Système de cache des IDs admin

Ce dossier contient un système automatique de gestion des IDs des utilisateurs admin/super-admin pour Better Auth.

### Fichiers

- **`admin-ids.ts`** : Système de cache des IDs admin
- **`auth.ts`** : Configuration Better Auth
- **`auth-clients.ts`** : Clients d'authentification

### Fonctionnement

Le fichier `admin-ids.ts` implémente un système de cache qui :

1. **Récupère automatiquement** les IDs des utilisateurs ayant les rôles `admin` ou `super-admin` depuis la base de données
2. **Met en cache** ces IDs pendant 5 minutes pour éviter des requêtes répétées
3. **Rafraîchit automatiquement** le cache toutes les 5 minutes via un `setInterval`
4. **Fallback** sur la variable d'environnement `ADMIN_USER_IDS` si la base de données n'est pas accessible

### Utilisation

#### Configuration automatique

La configuration Better Auth charge automatiquement les IDs admin au démarrage :

```typescript
admin({
    adminUserIds: getAdminUserIds(), // IDs chargés depuis le cache
})
```

#### Rafraîchissement manuel

Vous pouvez forcer le rafraîchissement du cache :

```typescript
import { forceRefreshAdminIds } from "@/features/auth/lib/admin-ids";

const adminIds = await forceRefreshAdminIds();
```

#### Endpoint API

Un endpoint est disponible pour les super-admins :

```bash
POST /api/auth/refresh-admin-ids
```

Cet endpoint rafraîchit manuellement le cache et retourne le nombre d'admins trouvés.

### Rafraîchissement automatique

Le cache est automatiquement rafraîchi dans les cas suivants :

1. **Toutes les 5 minutes** (via setInterval)
2. **Lors de la création d'un utilisateur admin** (via `createUserAction`)
3. **Lors du changement de rôle vers admin** (via `setRoleAction`)
4. **Manuellement** via l'endpoint API ou `forceRefreshAdminIds()`

### Variable d'environnement (optionnel)

Vous pouvez définir manuellement les IDs admin via :

```env
ADMIN_USER_IDS=id1,id2,id3
```

Cette variable est utilisée comme fallback si la base de données n'est pas accessible.

### Logs en développement

En mode développement (`NODE_ENV=development`), le système affiche :

```
✅ IDs admin chargés: 2 utilisateur(s)
✅ Cache des IDs admin rafraîchi automatiquement
```

### Sécurité

- Seuls les utilisateurs avec le rôle `super-admin` peuvent accéder à l'endpoint de rafraîchissement
- Les IDs sont stockés en mémoire (pas de persistance sur disque)
- Le cache est rechargé automatiquement au redémarrage du serveur
