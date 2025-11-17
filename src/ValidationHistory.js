import React from 'react';
import './ValidationHistory.css';

function ValidationHistory() {
  // Dummy validation history data
  const validationHistory = [
    {
      id: 1,
      announcementTitle: 'Credit Rating Disclosure - Q3 FY2024',
      dateOfEvent: '15/01/2024',
      uploadedDate: '15/01/2024',
      status: 'Completed',
      complianceScore: '85%',
      fileName: 'credit_rating_q3_2024.pdf'
    },
    {
      id: 2,
      announcementTitle: 'Board Meeting Outcome - Annual Results',
      dateOfEvent: '12/01/2024',
      uploadedDate: '12/01/2024',
      status: 'In Progress',
      complianceScore: '-',
      fileName: 'board_meeting_annual.pdf'
    },
    {
      id: 3,
      announcementTitle: 'Material Event - Change in Key Management',
      dateOfEvent: '10/01/2024',
      uploadedDate: '10/01/2024',
      status: 'Pending',
      complianceScore: '-',
      fileName: 'material_event_management.docx'
    }
  ];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'status-completed';
      case 'In Progress':
        return 'status-in-progress';
      case 'Pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  return (
    <div className="validation-history-content">
      <h1 className="validation-history-title">Validation History</h1>
      
      <div className="validation-table-container">
        <table className="validation-table">
          <thead>
            <tr>
              <th>Announcement Title</th>
              <th>Date of Event</th>
              <th>Uploaded Date</th>
              <th>File Name</th>
              <th>Status</th>
              <th>Compliance Score</th>
            </tr>
          </thead>
          <tbody>
            {validationHistory.map((item) => (
              <tr key={item.id}>
                <td>{item.announcementTitle}</td>
                <td>{item.dateOfEvent}</td>
                <td>{item.uploadedDate}</td>
                <td className="file-name-cell">{item.fileName}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.complianceScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ValidationHistory;
