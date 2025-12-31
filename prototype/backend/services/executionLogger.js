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

      // Portfolio table - stores only vehicle info (analysis data in separate tables)
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
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Service history analysis table
      database.run(`
        CREATE TABLE IF NOT EXISTS service_history_analysis (
          portfolio_id TEXT PRIMARY KEY,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id) ON DELETE CASCADE
        )
      `)

      // Routine maintenance table
      database.run(`
        CREATE TABLE IF NOT EXISTS routine_maintenance (
          portfolio_id TEXT PRIMARY KEY,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id) ON DELETE CASCADE
        )
      `)

      // Gap analysis table
      database.run(`
        CREATE TABLE IF NOT EXISTS gap_analysis (
          portfolio_id TEXT PRIMARY KEY,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id) ON DELETE CASCADE
        )
      `)

      // Unscheduled maintenance table
      database.run(`
        CREATE TABLE IF NOT EXISTS unscheduled_maintenance (
          portfolio_id TEXT PRIMARY KEY,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id) ON DELETE CASCADE
        )
      `)

      // Risk evaluation table
      database.run(`
        CREATE TABLE IF NOT EXISTS risk_evaluation (
          portfolio_id TEXT PRIMARY KEY,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id) ON DELETE CASCADE
        )
      `)

      // Market valuation table
      database.run(`
        CREATE TABLE IF NOT EXISTS market_valuation (
          portfolio_id TEXT PRIMARY KEY,
          data TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (portfolio_id) REFERENCES portfolio(portfolio_id) ON DELETE CASCADE
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

// Helper function to save analysis data to separate table
async function saveAnalysisData(tableName, portfolioId, data) {
  return new Promise((resolve, reject) => {
    if (!data) {
      resolve() // Skip if no data
      return
    }
    const database = getDatabase()
    database.run(
      `INSERT OR REPLACE INTO ${tableName} (portfolio_id, data, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)`,
      [portfolioId, JSON.stringify(data)],
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
  return new Promise(async (resolve, reject) => {
    const database = getDatabase()
    const portfolioId = portfolioData.portfolioId || `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    try {
      // Save vehicle data to portfolio table
      database.run(
        `INSERT OR REPLACE INTO portfolio (
          portfolio_id, vehicle_make, vehicle_model, vehicle_year, mileage, trim, engine, vin,
          parsed_service_history, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          portfolioId,
          portfolioData.vehicleData?.make || null,
          portfolioData.vehicleData?.model || null,
          portfolioData.vehicleData?.year || null,
          portfolioData.vehicleData?.mileage || null,
          portfolioData.vehicleData?.trim || null,
          portfolioData.vehicleData?.engine || null,
          portfolioData.vehicleData?.vin || null,
          JSON.stringify(portfolioData.parsedServiceHistory || null)
        ],
        async function(err) {
          if (err) {
            reject(err)
            return
          }

          // Save analysis data to separate tables
          try {
            if (portfolioData.serviceHistoryAnalysis) {
              await saveAnalysisData('service_history_analysis', portfolioId, portfolioData.serviceHistoryAnalysis)
            }
            if (portfolioData.routineMaintenance) {
              await saveAnalysisData('routine_maintenance', portfolioId, portfolioData.routineMaintenance)
            }
            if (portfolioData.gapAnalysis) {
              await saveAnalysisData('gap_analysis', portfolioId, portfolioData.gapAnalysis)
            }
            if (portfolioData.unscheduledMaintenance) {
              await saveAnalysisData('unscheduled_maintenance', portfolioId, portfolioData.unscheduledMaintenance)
            }
            if (portfolioData.riskEvaluation) {
              await saveAnalysisData('risk_evaluation', portfolioId, portfolioData.riskEvaluation)
            }
            if (portfolioData.marketValuation) {
              await saveAnalysisData('market_valuation', portfolioId, portfolioData.marketValuation)
            }
            resolve(portfolioId)
          } catch (saveErr) {
            reject(saveErr)
          }
        }
      )
    } catch (error) {
      reject(error)
    }
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

// Helper function to get analysis data from separate table
async function getAnalysisData(tableName, portfolioId) {
  return new Promise((resolve, reject) => {
    const database = getDatabase()
    database.get(
      `SELECT data FROM ${tableName} WHERE portfolio_id = ?`,
      [portfolioId],
      (err, row) => {
        if (err) {
          reject(err)
        } else if (!row || !row.data) {
          resolve(null)
        } else {
          try {
            resolve(JSON.parse(row.data))
          } catch (parseErr) {
            reject(parseErr)
          }
        }
      }
    )
  })
}

export async function getPortfolio(portfolioId) {
  return new Promise(async (resolve, reject) => {
    const database = getDatabase()

    database.get(
      `SELECT * FROM portfolio WHERE portfolio_id = ?`,
      [portfolioId],
      async (err, row) => {
        if (err) {
          reject(err)
        } else if (!row) {
          resolve(null)
        } else {
          try {
            // Get analysis data from separate tables
            const [
              serviceHistoryAnalysis,
              routineMaintenance,
              gapAnalysis,
              unscheduledMaintenance,
              riskEvaluation,
              marketValuation
            ] = await Promise.all([
              getAnalysisData('service_history_analysis', portfolioId),
              getAnalysisData('routine_maintenance', portfolioId),
              getAnalysisData('gap_analysis', portfolioId),
              getAnalysisData('unscheduled_maintenance', portfolioId),
              getAnalysisData('risk_evaluation', portfolioId),
              getAnalysisData('market_valuation', portfolioId)
            ])

            // Combine portfolio and analysis data
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
              serviceHistoryAnalysis: serviceHistoryAnalysis,
              routineMaintenance: routineMaintenance,
              unscheduledMaintenance: unscheduledMaintenance,
              gapAnalysis: gapAnalysis,
              riskEvaluation: riskEvaluation,
              marketValuation: marketValuation,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            }
            resolve(portfolio)
          } catch (error) {
            reject(error)
          }
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

