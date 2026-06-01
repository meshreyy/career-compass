# Career Compass

A campus placement platform that helps students discover roles, skills, and companies using ML-based recommendations. Includes dashboards for students, placement cells, and admins.

## Demo

[Watch the demo video](https://drive.google.com/file/d/1kT2bmfWKYw8GLTdctiWO3RejeOjAfTPx/view)

## Features

- **Student** — Sign up, get skill & company recommendations, browse placement history
- **Placement cell** — Upload placement CSVs, view placement stats
- **Admin** — Approve or reject uploaded placement data

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind, shadcn/ui, Supabase
- **Backend:** Flask, scikit-learn (Random Forest + TF-IDF recommendations)

## Run locally

**Frontend**

```bash
npm install
npm run dev
```

**Backend** (from `backend/`)

```bash
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
python app.py
```

Open the app at `http://localhost:5173`. The backend runs on `http://127.0.0.1:5000`.
