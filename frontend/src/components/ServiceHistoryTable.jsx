import './ServiceHistoryTable.css'

function ServiceHistoryTable({ records }) {
  if (!records || !Array.isArray(records) || records.length === 0) {
    return <p className="no-data">No service history records found</p>
  }

  return (
    <div className="service-history-container">
      <div className="table-header">
        <h3>Service History Records</h3>
        <span className="record-count">{records.length} record{records.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="table-wrapper">
        <table className="service-history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Mileage</th>
              <th>Service Type</th>
              <th>Description</th>
              <th>Location</th>
              <th>Cost</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td className="date-cell">
                  {record.date || '-'}
                </td>
                <td className="mileage-cell">
                  {record.mileage ? record.mileage.toLocaleString() : '-'}
                </td>
                <td className="service-type-cell">
                  {record.serviceType || '-'}
                </td>
                <td className="description-cell">
                  {record.description || '-'}
                </td>
                <td className="location-cell">
                  {record.location || '-'}
                </td>
                <td className="cost-cell">
                  {record.cost ? `$${record.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ServiceHistoryTable

