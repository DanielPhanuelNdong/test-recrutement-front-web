# Task Manager — Frontend

Petite application de gestion de tâches, faite dans le cadre d'un test technique. Le frontend est en React/Vite et consomme l'API du backend Spring Boot ([`recutement-test`](../recutement-test)) : inscription/connexion, création/édition/suppression de tâches, filtres par statut et recherche.

## Stack

- React 19 + TypeScript + Vite
- Redux Toolkit pour l'état global (auth + tâches)
- React Router pour la navigation
- Tailwind CSS v4
- Axios pour les appels API
- react-hot-toast pour les notifications

## Lancer le projet en local

Prérequis : Node 22, et le backend qui tourne sur `http://localhost:8080` (voir son README).

```bash
npm install
cp .env.example .env.local
npm run dev
```

L'app démarre sur `http://localhost:5173`. Si le backend tourne sur une autre URL, il suffit d'ajuster `VITE_API_URL` dans `.env.local`.

Autres commandes utiles :

```bash
npm run lint      # oxlint
npm run build     # tsc -b && vite build -> dist/
npm run preview   # sert le build de dist/ en local
```

## Organisation du code

```
src/
├── api/client.ts           # instance Axios : ajoute le token JWT, gère les erreurs et le 401 (déco + redirection /login)
├── app/                    # store Redux (store.ts) + hooks typés (hooks.ts)
├── features/auth/          # slice Redux pour le login/register, token persisté en localStorage
├── features/tasks/         # slice Redux pour le CRUD des tâches + filtres (statut, recherche)
├── components/             # Navbar, TaskForm, TaskItem, TaskFilters, ProtectedRoute, ...
├── pages/                  # LoginPage, RegisterPage, TasksPage
└── types/                  # types TS qui reflètent les DTOs du backend
```

Le token JWT est stocké dans `localStorage` (clé `task_manager_token`) et relu au démarrage pour garder la session active. La recherche de tâches est debouncée (300ms) avant d'appeler l'API pour éviter de spammer le backend à chaque frappe.

## Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_API_URL` | URL du backend. En local : `http://localhost:8080`. |

Vite embarque les variables `VITE_*` directement dans le bundle au moment du build — ce n'est pas une variable d'environnement lue au runtime du conteneur. Concrètement, changer l'URL du backend en prod veut dire rebuild + redéploiement, pas juste modifier une variable sur le service Cloud Run.

## CORS

Le backend n'autorise que les origines listées dans `CORS_ALLOWED_ORIGINS` côté serveur. En local, `http://localhost:5173` est déjà autorisé. Si tu déploies ce frontend ailleurs, il faut ajouter son URL à cette variable côté backend, sinon le navigateur bloque les requêtes même si le backend répond normalement.

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci-cd.yml`) se déclenche automatiquement :
- sur chaque **pull request** vers `main` → seul le job `build` tourne (lint + build), pour valider que ça compile avant de merger.
- sur chaque **push sur `main`** → les trois jobs s'enchaînent : `build` → `package` → `deploy`.

Il n'y a rien à lancer manuellement, il suffit de push. Pour suivre l'exécution : onglet **Actions** du repo.

| Job | Ce qu'il fait |
|---|---|
| `build` | `npm ci`, lint, `tsc -b && vite build` |
| `package` | build de l'image Docker (Vite build → servi par Nginx) et push sur Artifact Registry |
| `deploy` | déploiement sur Cloud Run |

Le frontend est déployé dans le même projet GCP que le backend (`test-recrutement-509008`), avec le même service account (`github-actions-deployer`), déjà configuré avec les bons rôles. L'image part dans le dépôt Artifact Registry existant `task-manager`, juste sous un nom différent (`task-manager-frontend`).

### Config à faire une fois sur le repo GitHub

Les secrets et variables ne sont pas partagés entre repos, même si le backend les a déjà il faut les remettre ici (**Settings → Secrets and variables → Actions**) :

**Secrets**
| Nom | Valeur |
|---|---|
| `GCP_SA_KEY` | clé JSON du service account `github-actions-deployer` (même que côté backend) |

**Variables**
| Nom | Exemple |
|---|---|
| `GCP_PROJECT_ID` | `test-recrutement-509008` |
| `GCP_REGION` | `europe-west1` |
| `BACKEND_API_URL` | URL du backend déployé, ex `https://task-manager-backend-d34k53zaza-ew.a.run.app` |

L'URL Cloud Run de ce frontend est prévisible avant même le premier déploiement (le suffixe est basé sur le numéro du projet GCP) : `https://task-manager-frontend-646783674843.europe-west1.run.app`. Elle doit être ajoutée à `CORS_ALLOWED_ORIGINS` côté backend pour que les appels API passent une fois déployé.

### En cas de souci

Voir la section Dépannage du [README backend](../recutement-test#dépannage) — les mêmes pièges s'appliquent ici (Actions désactivées par défaut sur un compte/repo neuf, vérif email/téléphone/paiement sur le compte GitHub owner...).

## À faire

- [x] Dockerfile + pipeline CI/CD (build → package → deploy)
- [ ] Premier déploiement (config des secrets/variables GitHub à faire, puis push sur `main`)
- [ ] Tests (composants, slices Redux)
