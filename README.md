# Aria's Portfolio

A personal portfolio website built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**, integrated with a **Strapi** backend.

> **Note**
> This repository is intentionally **not runnable out of the box**.  
> The required environment variables are private and **not provided** in this repo.

---

## Why access is restricted

- The site depends on a private Strapi backend instance.
- To avoid unwanted traffic/costs and protect content, the backend URL and tokens are **not published**.
- Frontend env vars prefixed with `VITE_` are embedded into the client bundle; sensitive values should never be exposed publicly.

---

## Getting Started (for maintainers with access)

> If you do not have credentials, you won't be able to run the app locally.

### 1) Install dependencies

```bash
npm install
```

### 2) Environment variables

Create a `.env.local` in the project root. This file is **gitignored** and not included in the repository.

```dotenv
# Required (kept private and not provided here)
VITE_STRAPI_URL=
```

- A sample file is provided as `.env.example` **without values**.
- The app will **not** function without a valid `VITE_STRAPI_URL` that points to the private backend.

### 3) Start the dev server (will fail without valid env)

```bash
npm run dev
```

---

## Available Scripts

- `npm run dev` – Start the local development server.
- `npm run lint` – Run ESLint to check for code issues.
- `npm run format` – Format the code using Prettier.
- `npm run format:check` – Check if code formatting matches Prettier rules.

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.
