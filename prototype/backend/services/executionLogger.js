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
      `)

      // Portfolio table - stores complete car analysis data
      database.run(`
        CREATE TABLE IF NOT EXISTS portfolio (
          portfolio_id TEXT PRIMARY KEY,
          vehicle_make TEXT,
          vehicle_model TEXT,
          vehicle_year INTEGER,
          mileage INTEGER,
          trim TEXT,
          engine TEXT,
          vin TEXT,
          parsed_service_history TEXT,
          service_history_analysis TEXT,
          routine_maintenance TEXT,
          unscheduled_maintenance TEXT,
          gap_analysis TEXT,
          risk_evaluation TEXT,
          market_valuation TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          reject(err)
        } else {
          // Add market_valuation column if it doesn't exist (migration for existing databases)
          database.run(`
            ALTER TABLE portfolio 
            ADD COLUMN market_valuation TEXT
          `, (alterErr) => {
            // Ignore error if column already exists (SQLite error: "duplicate column name")
            if (alterErr && !alterErr.message.includes('duplicate column') && !alterErr.message.includes('duplicate column name')) {
              console.warn('Could not add market_valuation column:', alterErr.message)
            }
            // Always resolve - column either added successfully or already exists
            resolve()
          })
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

export async function savePortfolio(portfolioData) {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    const portfolioId = portfolioData.portfolioId || `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    database.run(
      `INSERT OR REPLACE INTO portfolio (
        portfolio_id, vehicle_make, vehicle_model, vehicle_year, mileage, trim, engine, vin,
        parsed_service_history, service_history_analysis, routine_maintenance,
        unscheduled_maintenance, gap_analysis, risk_evaluation, market_valuation, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        portfolioId,
        portfolioData.vehicleData?.make || null,
        portfolioData.vehicleData?.model || null,
        portfolioData.vehicleData?.year || null,
        portfolioData.vehicleData?.mileage || null,
        portfolioData.vehicleData?.trim || null,
        portfolioData.vehicleData?.engine || null,
        portfolioData.vehicleData?.vin || null,
        JSON.stringify(portfolioData.parsedServiceHistory || null),
        JSON.stringify(portfolioData.serviceHistoryAnalysis || null),
        JSON.stringify(portfolioData.routineMaintenance || null),
        JSON.stringify(portfolioData.unscheduledMaintenance || null),
        JSON.stringify(portfolioData.gapAnalysis || null),
        JSON.stringify(portfolioData.riskEvaluation || null),
        JSON.stringify(portfolioData.marketValuation || null)
      ],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(portfolioId)
        }
      }
    )
  })
}

export async function getAllPortfolios() {
  return new Promise((resolve, reject) => {
    const database = getDatabase()

    database.all(
      `SELECT portfolio_id, vehicle_make, vehicle_model, vehicle_year, mileage, trim, engine, vin, created_at, updated_at
       FROM portfolio
       ORDER BY updated_at DESC`,
      [],
      (err, rows) => {
        if (err) {
          reject(err)
        } else {
          resolve(rows || [])
        }
      }
    )
  })
}

export async function getPortfolio(portfolioId) {
  return new Promise((resolve, reject) => {
    const database = getDatabase()

    database.get(
      `SELECT * FROM portfolio WHERE portfolio_id = ?`,
      [portfolioId],
      (err, row) => {
        if (err) {
          reject(err)
        } else if (!row) {
          resolve(null)
        } else {
          // Parse JSON fields
          const portfolio = {
            portfolioId: row.portfolio_id,
            vehicleData: {
              make: row.vehicle_make,
              model: row.vehicle_model,
              year: row.vehicle_year,
              mileage: row.mileage,
              trim: row.trim,
              engine: row.engine,
              vin: row.vin
            },
            parsedServiceHistory: row.parsed_service_history ? JSON.parse(row.parsed_service_history) : null,
            serviceHistoryAnalysis: row.service_history_analysis ? JSON.parse(row.service_history_analysis) : null,
            routineMaintenance: row.routine_maintenance ? JSON.parse(row.routine_maintenance) : null,
            unscheduledMaintenance: row.unscheduled_maintenance ? JSON.parse(row.unscheduled_maintenance) : null,
            gapAnalysis: row.gap_analysis ? JSON.parse(row.gap_analysis) : null,
            riskEvaluation: row.risk_evaluation ? JSON.parse(row.risk_evaluation) : null,
            marketValuation: row.market_valuation ? JSON.parse(row.market_valuation) : null,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }
          resolve(portfolio)
        }
      }
    )
  })
}

export async function deletePortfolioField(portfolioId, fieldName) {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    
    // Map frontend field names to database column names
    const fieldMap = {
      'parsedServiceHistory': 'parsed_service_history',
      'serviceHistoryAnalysis': 'service_history_analysis',
      'routineMaintenance': 'routine_maintenance',
      'unscheduledMaintenance': 'unscheduled_maintenance',
      'gapAnalysis': 'gap_analysis',
      'riskEvaluation': 'risk_evaluation',
      'marketValuation': 'market_valuation'
    }
    
    const dbFieldName = fieldMap[fieldName]
    if (!dbFieldName) {
      reject(new Error(`Invalid field name: ${fieldName}`))
      return
    }
    
    database.run(
      `UPDATE portfolio SET ${dbFieldName} = NULL, updated_at = CURRENT_TIMESTAMP WHERE portfolio_id = ?`,
      [portfolioId],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes > 0)
        }
      }
    )
  })
}

export async function deletePortfolio(portfolioId) {
  return new Promise((resolve, reject) => {
    const database = getDatabase()

    database.run(
      `DELETE FROM portfolio WHERE portfolio_id = ?`,
      [portfolioId],
      function(err) {
        if (err) {
          reject(err)
        } else {
          resolve(this.changes > 0)
        }
      }
    )
  })
}

