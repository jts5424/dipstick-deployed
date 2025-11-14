import './MaintenanceTable.css'

function MaintenanceTable({ data, type }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p>No data available</p>
  }

  // Determine columns based on table type
  const getColumns = () => {
    if (type === 'routine') {
      return ['Item', 'Interval (Miles)', 'Interval (Months)', 'Cost Range', 'OEM Cost', 'Description', 'Risk Note']
    } else {
      return ['Item', 'Forecast Mileage', 'Probability', 'Cost Range', 'OEM Cost', 'Description', 'Preventative Actions', 'Inspection']
    }
  }

  const columns = getColumns()

  return (
    <div className="table-container">
      <table className="maintenance-table">
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIdx) => (
            <tr key={rowIdx}>
              {columns.map((col, colIdx) => {
                // Convert column name to data key (handle parentheses and spaces)
                const dataKey = col.toLowerCase()
                  .replace(/\s+/g, '_')
                  .replace(/[()]/g, '')
                  .replace(/_+/g, '_')
                  .replace(/^_|_$/g, '')
                
                // Try multiple key formats
                const value = row[dataKey] || row[col.toLowerCase().replace(/\s+/g, '_')] || row[col] || '-'
                return (
                  <td key={colIdx}>
                    {value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MaintenanceTable

