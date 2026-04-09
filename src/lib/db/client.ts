import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { runMigrations } from './schema'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'folio.db')

const globalDb = globalThis as unknown as { _folioDb: Database.Database | undefined }

export function getDb(): Database.Database {
  if (!globalDb._folioDb) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    globalDb._folioDb = new Database(DB_PATH)
    globalDb._folioDb.pragma('journal_mode = WAL')
    globalDb._folioDb.pragma('foreign_keys = ON')
    runMigrations(globalDb._folioDb)
  }
  return globalDb._folioDb
}
