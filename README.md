# Folio

Gestor de tareas jerárquico (Libros → Secciones → Tareas) con soporte local SQLite.

## Stack

- Next.js 16.2.3 · React 19 · TypeScript 5
- Zustand · Tailwind CSS 4 · better-sqlite3
- Radix UI (Dialog) · Lucide React

## Desarrollo

```bash
npm install
npm run dev       # http://localhost:3000
npm run build
npm start
```

> La base de datos se crea automáticamente en `data/folio.db`.

## Docker

```bash
docker-compose up -d
```

Monta `./data:/app/data` para persistencia. Puerto por defecto: `3000`.

## Estructura

```
src/
├── app/            # Routes + API (books, sections, tasks)
├── components/
│   ├── layout/     # Sidebar, ContentHeader, MobileSidebar
│   ├── views/      # BookView, SectionView
│   ├── tasks/      # TaskGroup, TaskFilters, TaskForm
│   ├── books/      # BookForm
│   └── ui/         # Button, Modal, Input, EmptyState…
└── lib/
    ├── db/         # SQLite + repositorios
    ├── store/      # Zustand
    └── hooks/      # useTheme
```

## Notas

- Tema claro/oscuro via CSS variables (`data-theme` en `<html>`)
- Sidebar colapsable en desktop; drawer en mobile (logo como trigger)
- Fuente Inter · 18px base

---

v1.0.0 · rgcore.dev
