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

## Prochaines étapes

- [ ] Déploiement (Cloud Run / Firebase Hosting) + job CI/CD dédié
- [ ] Tests (composants, slices Redux)
