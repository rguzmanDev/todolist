import type Database from 'better-sqlite3'

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#3B82F6',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sections (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      section_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT NOT NULL DEFAULT 'medium'
        CHECK (priority IN ('low', 'medium', 'high')),
      status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      section_id TEXT,
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    );
  `)

  // Migration v2: allow in_progress status (recreate table if old constraint)
  const version = (db.pragma('user_version', { simple: true }) as number) ?? 0
  if (version < 2) {
    db.exec(`
      PRAGMA foreign_keys = OFF;
      CREATE TABLE IF NOT EXISTS tasks_v2 (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        section_id TEXT,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT NOT NULL DEFAULT 'medium'
          CHECK (priority IN ('low', 'medium', 'high')),
        status TEXT NOT NULL DEFAULT 'pending'
          CHECK (status IN ('pending', 'in_progress', 'completed')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT,
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
        FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
      );
      INSERT OR IGNORE INTO tasks_v2 SELECT * FROM tasks;
      DROP TABLE tasks;
      ALTER TABLE tasks_v2 RENAME TO tasks;
      PRAGMA foreign_keys = ON;
      PRAGMA user_version = 2;
    `)
  }

  // Migration v3: add sort_order to tasks
  const version3 = (db.pragma('user_version', { simple: true }) as number) ?? 0
  if (version3 < 3) {
    db.exec(`
      ALTER TABLE tasks ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
      UPDATE tasks SET sort_order = rowid WHERE sort_order = 0;
      PRAGMA user_version = 3;
    `)
  }

  // Migration v4: add type to books ('tasks' | 'notes')
  const version4 = (db.pragma('user_version', { simple: true }) as number) ?? 0
  if (version4 < 4) {
    db.exec(`
      ALTER TABLE books ADD COLUMN type TEXT NOT NULL DEFAULT 'tasks';
      PRAGMA user_version = 4;
    `)
  }
}
