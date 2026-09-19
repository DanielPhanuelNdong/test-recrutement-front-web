# Task Manager — Frontend (React + Vite + Redux Toolkit)

Interface web de la mini application de gestion de tâches ("Task Manager"), réalisée dans le cadre du test de recrutement. Consomme l'API du backend Spring Boot : [`recutement-test`](../recutement-test).

**Stack** : React 19 + Vite + TypeScript (TSX) + Tailwind CSS v4 + Redux Toolkit + React Router + Axios + react-hot-toast.

## Architecture

```
src/
├── api/client.ts           # Instance Axios : injecte le JWT (Authorization: Bearer), normalise les erreurs API et gère le 401 (déconnexion + redirection /login)
├── app/store.ts, hooks.ts  # Store Redux Toolkit (configureStore) + hooks typés (useAppDispatch/useAppSelector)
├── features/auth/          # Slice Redux : register/login (createAsyncThunk), persistance du token en localStorage
├── features/tasks/         # Slice Redux : CRUD tâches + filtres (statut, recherche) via createAsyncThunk
├── components/             # ProtectedRoute, Navbar, TaskForm, TaskItem, TaskFilters
├── pages/                  # LoginPage, RegisterPage, TasksPage
└── types/                  # Types TS miroir des DTOs backend (Task, AuthResponse, ...)
```

## Choix techniques

- **Redux Toolkit** plutôt que du `useState`/Context épars : centralise l'état d'authentification et la liste de tâches, avec des `createAsyncThunk` qui encapsulent chaque appel API et exposent des états `idle/loading/failed` exploitables directement dans l'UI.
- **JWT stocké en `localStorage`** (clé `task_manager_token`), relu au démarrage du slice `auth` pour restaurer la session ; l'intercepteur Axios l'attache automatiquement à chaque requête et nettoie la session sur un `401`.
- **Gestion des erreurs API** centralisée dans `api/client.ts` : les erreurs de validation (`fieldErrors`) et les messages d'erreur du backend (`ErrorResponse`) sont normalisés en un message unique, affiché via `react-hot-toast`.
- **Filtrage par statut + recherche texte** géré côté serveur (`GET /api/tasks?status=...&search=...`), avec un debounce de 300 ms sur la recherche pour éviter une requête à chaque frappe.

## Installation et exécution

```bash
npm install
cp .env.example .env.local   # puis ajuster VITE_API_URL si besoin
npm run dev                  # http://localhost:5173
```

`VITE_API_URL` pointe par défaut vers `http://localhost:8080` (backend lancé en local). Pour cibler le backend déployé sur Cloud Run, mettre son URL dans `.env.local` (fichier ignoré par git, cf. `*.local` dans `.gitignore`).

## CORS

Le backend n'autorise que les origines listées dans sa variable d'environnement `CORS_ALLOWED_ORIGINS`. En local, `http://localhost:5173` est autorisé par défaut côté backend. Pour un déploiement de ce frontend (Cloud Run, Firebase Hosting, ...), son URL doit être ajoutée à la variable GitHub `CORS_ALLOWED_ORIGINS` du dépôt backend, sans quoi le navigateur bloquera les requêtes malgré un backend fonctionnel.

## Build de production

```bash
npm run build   # tsc -b && vite build -> dist/
npm run preview # sert le build de dist/ en local
```

## CI/CD (GitHub Actions → GCP Cloud Run)

Le pipeline (`.github/workflows/ci-cd.yml`) suit le même découpage que celui du backend :

| Job | Déclenchement | Rôle |
|---|---|---|
| `build` | push + pull request | `npm ci`, lint (`oxlint`), `tsc -b && vite build` |
| `package` | push sur `main` uniquement, après `build` | Build de l'image Docker (`Dockerfile` : build Vite → Nginx) et push vers Artifact Registry |
| `deploy` | push sur `main` uniquement, après `package` | Déploiement sur **Cloud Run** (service public, site statique) |

Différence clé avec un backend : `VITE_API_URL` est embarqué **au build** (Vite l'injecte dans le bundle JS statique), pas au runtime du conteneur. Il est donc passé en `--build-arg` à `docker build`, à partir de la variable GitHub `BACKEND_API_URL` — changer cette variable nécessite un nouveau build+déploiement, pas juste une mise à jour d'env var sur le service Cloud Run.

### Réutilisation de l'infra GCP du backend

Ce frontend est déployé dans le **même projet GCP** que le backend (`test-recrutement-509008`), avec le même compte de service `github-actions-deployer` (déjà créé et configuré, cf. le README du [backend](../recutement-test)). Il possède déjà les rôles nécessaires (`roles/artifactregistry.writer`, `roles/run.admin`, `roles/iam.serviceAccountUser`) — aucune nouvelle ressource IAM à créer côté GCP. L'image est poussée dans le dépôt Artifact Registry existant `task-manager` (créé pour le backend), sous un nom d'image différent (`task-manager-frontend`).

### Secrets et variables GitHub à configurer (sur *ce* dépôt)

Les secrets/variables ne sont pas partagés entre dépôts GitHub : même si le backend les a déjà, il faut les redéfinir ici, dans **Settings → Secrets and variables → Actions** de `test-recrutement-front-web` :

**Secrets** (`Repository secrets`)
| Nom | Contenu |
|---|---|
| `GCP_SA_KEY` | Même contenu JSON que côté backend (clé du compte de service `github-actions-deployer`) |

**Variables** (`Repository variables`)
| Nom | Exemple |
|---|---|
| `GCP_PROJECT_ID` | `test-recrutement-509008` |
| `GCP_REGION` | `europe-west1` |
| `BACKEND_API_URL` | `https://task-manager-backend-d34k53zaza-ew.a.run.app` (URL du backend déployé) |

### CORS côté backend

Le backend n'autorise que les origines listées dans sa variable `CORS_ALLOWED_ORIGINS` (cf. README backend). L'URL Cloud Run de ce frontend est **prévisible avant le premier déploiement** (le suffixe numérique dans `https://<service>-<PROJECT_NUMBER>.<region>.run.app` est basé sur le numéro du projet GCP, stable et identique pour tous les services du projet) : `https://task-manager-frontend-646783674843.europe-west1.run.app`. Cette URL a déjà été ajoutée à `CORS_ALLOWED_ORIGINS` sur le service Cloud Run du backend — mais uniquement en édition directe (`gcloud run services update`), qui sera **écrasée** au prochain déploiement du pipeline backend. Il faut donc aussi ajouter cette URL à la variable GitHub `CORS_ALLOWED_ORIGINS` du dépôt backend pour que ce soit permanent.

### Dépannage

Voir la section [Dépannage du README backend](../recutement-test#dépannage) : les mêmes pièges s'appliquent ici (Actions potentiellement désactivées par défaut sur un dépôt/compte neuf → bouton "Enable Actions on this repository" dans l'onglet Actions ; si ça échoue, vérifier email/téléphone vérifiés et moyen de paiement renseigné sur le compte GitHub propriétaire du dépôt).

## Prochaines étapes

- [x] Dockerfile (build Vite → Nginx) + workflow CI/CD (build → package → deploy Cloud Run)
- [ ] Premier déploiement effectif (nécessite de configurer les secrets/variables GitHub ci-dessus puis de pousser sur `main`)
- [ ] Tests (composants, slices Redux)
