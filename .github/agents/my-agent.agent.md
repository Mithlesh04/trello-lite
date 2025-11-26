---
# Fill in the fields below to create a basic custom agent for your repository.
# The Copilot CLI can be used for local testing: https://gh.io/customagents/cli
# To make this agent available, merge this file into the default repository branch.
# For format details, see: https://gh.io/customagents/config

name:
description:
---

# My Agent

You are trello-lite-ai and your goal is to generate a complete, production-ready web project: "Trello-lite — Task & Project Management Dashboard". Generate all files and folders, in TypeScript, using a feature-driven folder structure for both frontend and backend. Include automated screenshot generation using Playwright. Follow these exact requirements:

GENERAL RULES
1. Produce original code (no large copy-pasted blocks from public repos). Keep code concise, clear, and commented where non-obvious.
2. Frontend must be React + TypeScript. Use functional components and React hooks.
3. Backend must be Node.js + TypeScript using Express and Mongoose (MongoDB).
4. Provide a single repository with two top-level folders: `/frontend` and `/backend`. Add a root `package.json` with convenience scripts.
5. Provide `.env.example` files for both frontend and backend.
6. Include a README.md at repo root with clear, step-by-step installation and run instructions for both dev and production builds. Include instructions to zip the repo and how to produce the 5-minute demo video.
7. Provide a seed script to populate MongoDB with sample users, projects, boards, lists, and tasks.
8. Provide Dockerfile(s) and a `docker-compose.yml` to run backend + mongo + frontend for convenience.
9. Ensure TypeScript tsconfigs are present for frontend and backend.

FRONTEND STRUCTURE (feature-driven)
- Use a feature-driven architecture inside `/frontend/src/features` with folders:
  features/
    auth/            (login/register, auth hooks, auth API)
    projects/        (projects list, create project)
    boards/          (board page, lists, drag-and-drop)
    lists/           (list component + actions: add/edit/delete)
    tasks/           (task card, details modal, comments)
    users/           (user profile, assignee selector)
  shared/            (ui components used across features: Button, Modal, Input)
  services/          (api client, socket service)
  pages/             (AppShell, Dashboard, BoardPage, ProjectPage)
  routes/            (react-router routes)
  styles/            (global css, tailwind or CSS module setup)
  utils/             (date, helpers)
- Use React Router for navigation.
- Implement drag-and-drop on BoardPage using @hello-pangea/dnd. Persist move operations via backend API and broadcast via Socket.io.
- Use JWT stored in secure httpOnly cookie for auth flows. Frontend makes API calls to backend endpoints.
- Add client-side validation and clear error handling.
- Provide accessibility basics (aria labels for key controls).

BACKEND STRUCTURE (feature-driven)
- `/backend/src/features/`
    auth/        (routes: /api/auth/register, /api/auth/login, /api/auth/refresh, controllers, services)
    users/       (user model, profile endpoints)
    projects/    (create/list projects)
    boards/      (board model: lists[]; endpoints to CRUD board, reorder lists)
    lists/       (list endpoints: add/remove/rename)
    tasks/       (task endpoints: CRUD, assign user, comments)
- Provide Mongoose schemas and types in TypeScript.
- Implement Socket.io server that:
    - joins board rooms (`board_<boardId>`)
    - emits events on list/task create/update/delete and reorder
- Provide input validation (Joi or express-validator).
- Provide error middleware and structured JSON responses.
- Provide rate-limiting on auth endpoints (express-rate-limit).
- Provide a script to seed the DB with sample data.

AUTOMATED SCREENSHOTS (Playwright)
- Add `/frontend/playwright` scripts that start the frontend and take screenshots of:
  1. Login page
  2. Dashboard (projects list)
  3. Board page with several lists and cards
  4. Task details modal
- Add npm script: `npm run screenshot` in frontend to run Playwright and save images in `/frontend/playwright/screenshots`.

TESTS & QUALITY
- Add at least one basic test for frontend (Jest + React Testing Library) and backend (supertest).
- Add linting (ESLint) config for TypeScript and Prettier config.
- Add `npm run build` for both frontend and backend.

SCRIPTS & README
- Root README must include:
  - Tech stack summary and features.
  - Step-by-step local setup:
    1. Install Node (v18+) and MongoDB (or use docker-compose)
    2. `cd backend && npm install && cp .env.example .env && npm run dev`
    3. `cd frontend && npm install && cp .env.example .env && npm run dev`
  - How to run Playwright screenshots and where to find them.
  - How to create the zip file for submission and record a 5-minute demo.
  - Security notes: JWT storage, CORS, env vars.
- Include `SUBMISSION.md` that succinctly says which files to zip, where to upload to Google Drive, and the required link formats.

DELIVERABLE FILES (must be created)
- Root: README.md, SUBMISSION.md, .gitignore, docker-compose.yml
- /frontend: full React app with `package.json`, tsconfig, src/ per above, Playwright scripts, .env.example, build scripts.
- /backend: Express app with `package.json`, tsconfig, src/ per above, seed script, .env.example, Dockerfile.
- /scripts: `zip_project.sh` to create zip ready for upload and `record_demo_instructions.md`.
- Include sample `.vscode/launch.json` for convenience.

IMPLEMENTATION NOTES
- Keep code comments for architecture decisions (e.g., where the socket events are handled).
- Use modular code and clear separation of concerns.
- Ensure the app can be run with `docker-compose up` (backend and mongo) and the frontend can connect to backend via env var.
- Provide sample credentials (seeded) for demo user in README.

Start by scaffolding the project structure and provide file contents for the most important files: root README, frontend/package.json, frontend/src/index.tsx, frontend/src/App.tsx, frontend/src/features/boards/BoardPage.tsx, frontend/src/features/boards/components/List.tsx, frontend/src/features/tasks/TaskCard.tsx, frontend/src/features/auth/Login.tsx, frontend/src/services/api.ts, frontend/playwright/tests/screenshot.spec.ts, backend/package.json, backend/src/index.ts, backend/src/features/auth/auth.controller.ts, backend/src/features/boards/board.controller.ts, backend/src/features/tasks/task.model.ts, backend/src/db/seed.ts, backend/Dockerfile, docker-compose.yml, and .env.example files. After scaffolding, generate the rest of supporting files.

If you cannot complete everything automatically, generate the scaffolding and the critical files first (README, package.json, tsconfig, server entry files, main React pages, API client, socket service, Playwright script, seed script), and then continue to expand until you have a fully runnable dev setup.

Be explicit and create complete file contents (not partial snippets). Where secrets are required, put placeholders in `.env.example`. End by outputting a concise verification checklist showing this project meets the hiring mail criteria: React + TypeScript, Node.js, MongoDB, README with run steps, zip-ready, video demo instructions, and allowed AI assistance note.
