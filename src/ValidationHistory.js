import React, { useMemo } from 'react';
import './ValidationHistory.css';
import { getAllDisclosures, formatDisplayDate } from './data/disclosures';

function ValidationHistory() {
  const validationHistory = useMemo(() => getAllDisclosures(), []);

  return (
    <div className="validation-history-content">
      <h1 className="validation-history-title">Validation History</h1>
      
      <div className="validation-table-container">
        <table className="validation-table">
          <thead>
            <tr>
              <th>Announcement Title</th>
              <th>Date of Event</th>
              <th>Regulations</th>
              <th>File Name</th>
              <th>Uploaded Date</th>
              <th>Status</th>
              <th>Compliance Score</th>
            </tr>
          </thead>
          <tbody>
            {validationHistory.map((item) => (
              <tr key={item.id}>
                <td>{item.announcementTitle}</td>
                <td>{formatDisplayDate(item.dateOfEvent)}</td>
                <td>
                  {item.regulations.map((reg) => (
                    <span key={`${item.id}-${reg}`} className="regulation-tag">
                      {reg}
                    </span>
                  ))}
                </td>
                <td className="file-name-cell">{item.fileName}</td>
                <td>{formatDisplayDate(item.uploadedDate)}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(item.fileStatus)}`}>
                    {item.fileStatus}
                  </span>
                </td>
                <td>
                  {item.fileStatus === 'Completed' && item.complianceScore != null ? (
                    <span className="compliance-score">
                      <span className={`score-indicator ${getScoreIndicatorClass(item.complianceScore)}`} />
                      {item.complianceScore}%
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Completed':
      return 'status-completed';
    case 'Processing':
      return 'status-processing';
    case 'Pending':
      return 'status-pending';
    case 'Error':
      return 'status-error';
    case 'Cancelled':
      return 'status-cancelled';
    default:
      return '';
  }
};

const getScoreIndicatorClass = (score) => {
  if (score >= 80) return 'score-good';
  if (score >= 50) return 'score-warning';
  return 'score-poor';
};

export default ValidationHistory;
