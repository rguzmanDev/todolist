# Folio - Gestor de Tareas Jerárquico

Aplicación web para gestionar tareas organizadas en libros y secciones. Diseñada para usar SQLite de forma local.

## Tecnologías

- **Frontend**: Next.js 16.2.3, React 19.2.4, TypeScript 5
- **Estado**: Zustand 5.0.12
- **Estilos**: Tailwind CSS 4
- **Base de datos**: SQLite (better-sqlite3 12.8.0)
- **Persistencia**: Archivo local `data/folio.db`

## Estructura del Proyecto

```
src/
├── app/                      # Next.js routes + API
│   ├── api/books/           # CRUD books
│   ├── api/tasks/           # CRUD tasks
├── components/              # Componentes React
│   ├── ui/                  # Primitivos (Button, Modal, Input, etc)
│   ├── books/               # Formulario de libros
│   ├── tasks/               # Formulario y lista de tareas
│   ├── layout/              # Sidebar, Header
│   └── views/               # BookView, SectionView
├── lib/
│   ├── db/                  # SQLite, migraciones, repositorios
│   ├── api/                 # Cliente HTTP tipado
│   ├── store/               # Zustand store
│   ├── types.ts             # Interfaces TypeScript
│   └── constants.ts         # Configuración (prioridades, colores)
```

## Estructura de Datos

**Tablas SQLite:**
- `books` - Libros (colección raíz)
- `sections` - Secciones dentro de libros
- `tasks` - Tareas con prioridad (low/medium/high) y estado (pending/completed)

Todas las tablas tienen `created_at` y relaciones con cascading delete.

## Desarrollo Local

```bash
npm install
npm run dev  # http://localhost:3000
npm run build
npm start    # Producción
```

## Publicar en Servidor Casero

### Con Docker (Recomendado)

1. **Crea `Dockerfile`:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

2. **Crea `docker-compose.yml`:**
```yaml
version: '3.8'
services:
  folio:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - NODE_ENV=production
```

3. **Deploy:**
```bash
docker-compose up -d
```

### Notas Importantes

- **Base de datos**: El archivo `folio.db` se crea en `data/` automáticamente
- **Volumen Docker**: Monta `./data:/app/data` para persistencia entre contenedores
- **Puerto**: Por defecto usa `3000`, configurable en docker-compose.yml
- **Node.js requerido**: better-sqlite3 necesita compilar natively (por eso Node.js en Dockerfile)
- **Variable de entorno**: `NODE_ENV=production` para optimizar

### Alternativa: Sin Docker

```bash
npm install
npm run build
NODE_ENV=production npm start
```

El archivo `data/folio.db` persistirá en el mismo directorio.

## Interfaz de Usuario

- Barra lateral oscura (#gray-900) con árbol de navegación
- Jerarquía: Libros → Secciones → Tareas
- Filtros: Todos / Pendiente / Completado
- Modales para crear/editar
- Responsive con Tailwind CSS

---

**Versión**: 1.0.0 | **Dominio**: rgcore.dev
