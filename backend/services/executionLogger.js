import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const dbPath = join(__dirname, '../data/executionLog.db')

let db = null

export function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath)
  }
  return db
}

export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Ensure data directory exists
    const dataDir = join(__dirname, '../data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const database = getDatabase()

    database.serialize(() => {
      // Analysis sessions table
      database.run(`
        CREATE TABLE IF NOT EXISTS analysis_sessions (
          session_id TEXT PRIMARY KEY,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          vehicle_make TEXT,
          vehicle_model TEXT,
          vehicle_year INTEGER,
          mileage INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Service history inputs table
      database.run(`
        CREATE TABLE IF NOT EXISTS service_history_inputs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT,
          service_record_id TEXT,
          service_date TEXT,
          mileage INTEGER,
          service_description TEXT,
          raw_pdf_data TEXT,
          parsed_data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES analysis_sessions(session_id)
        )
      `)

      // Generated tables table
      database.run(`
        CREATE TABLE IF NOT EXISTS generated_tables (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT,
          table_type TEXT,
          table_data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES analysis_sessions(session_id)
        )
      `)

      // Generated reports table
      database.run(`
        CREATE TABLE IF NOT EXISTS generated_reports (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT,
          report_type TEXT,
          report_data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES analysis_sessions(session_id)
        )
      `)

      // AI research queries table
      database.run(`
        CREATE TABLE IF NOT EXISTS ai_research_queries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          session_id TEXT,
          query_type TEXT,
          query_params TEXT,
          response_data TEXT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (session_id) REFERENCES analysis_sessions(session_id)
        )
      `, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  })
}

export async function logAnalysisSession(vehicleData) {
  return new Promise((resolve, reject) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const database = getDatabase()

    database.run(
      `INSERT INTO analysis_sessions (session_id, vehicle_make, vehicle_model, vehicle_year, mileage)
       VALUES (?, ?, ?, ?, ?)`,
      [sessionId, vehicleData.make, vehicleData.model, vehicleData.year, vehicleData.mileage],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(sessionId)
        }
      }
    )
  })
}

export async function logServiceHistory(sessionId, serviceHistory) {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    const stmt = database.prepare(
      `INSERT INTO service_history_inputs 
       (session_id, service_record_id, service_date, mileage, service_description, raw_pdf_data, parsed_data)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )

    for (const record of serviceHistory.records) {
      stmt.run(
        [
          sessionId,
          `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          record.date || null,
          record.mileage || null,
          record.description || null,
          serviceHistory.rawText || null,
          JSON.stringify(record)
        ],
        (err) => {
          if (err) {
            reject(err)
            return
          }
        }
      )
    }

    stmt.finalize((err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export async function logAICall(sessionId, queryType, queryParams, responseData) {
  return new Promise((resolve, reject) => {
    const database = getDatabase()

    database.run(
      `INSERT INTO ai_research_queries (session_id, query_type, query_params, response_data)
       VALUES (?, ?, ?, ?)`,
      [sessionId, queryType, JSON.stringify(queryParams), JSON.stringify(responseData)],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

export async function logGeneratedTable(sessionId, tableType, tableData) {
  return new Promise((resolve, reject) => {
    const database = getDatabase()

    database.run(
      `INSERT INTO generated_tables (session_id, table_type, table_data)
       VALUES (?, ?, ?)`,
      [sessionId, tableType, JSON.stringify(tableData)],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

export async function logGeneratedReport(sessionId, reportType, reportData) {
  return new Promise((resolve, reject) => {
    const database = getDatabase()

    database.run(
      `INSERT INTO generated_reports (session_id, report_type, report_data)
       VALUES (?, ?, ?)`,
      [sessionId, reportType, JSON.stringify(reportData)],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

