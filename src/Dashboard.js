import React, { useMemo } from 'react';
import './Dashboard.css';
import { formatDisplayDate } from './data/disclosures';
import { useDisclosures } from './context/DisclosuresContext';

function Dashboard() {
  const { disclosures } = useDisclosures();

  const latestDisclosures = useMemo(() => disclosures.slice(0, 5), [disclosures]);

  const metrics = useMemo(() => {
    const totalAnnouncements = disclosures.length;
    let scoreAbove80 = 0;
    let scoreBetween50And80 = 0;
    let scoreBelow50 = 0;

    disclosures.forEach((item) => {
      if (item.complianceScore == null) return;

      if (item.complianceScore >= 80) {
        scoreAbove80 += 1;
      } else if (item.complianceScore >= 50) {
        scoreBetween50And80 += 1;
      } else {
        scoreBelow50 += 1;
      }
    });

    return {
      totalAnnouncements,
      scoreAbove80,
      scoreBetween50And80,
      scoreBelow50,
    };
  }, [disclosures]);

  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title">Dashboard</h1>
      
      <div className="entity-overview-section">
        <h2 className="section-title">Entity Overview</h2>
        <div className="metrics-container">
          <div className="metric-card total-announcements">
            <div className="metric-value">{metrics.totalAnnouncements}</div>
            <div className="metric-label">Total Announcements</div>
          </div>
          <div className="metric-card score-high">
            <div className="metric-value">{metrics.scoreAbove80}</div>
            <div className="metric-label">Compliance ≥ 80%</div>
          </div>
          <div className="metric-card score-mid">
            <div className="metric-value">{metrics.scoreBetween50And80}</div>
            <div className="metric-label">Compliance 50-79%</div>
          </div>
          <div className="metric-card score-low">
            <div className="metric-value">{metrics.scoreBelow50}</div>
            <div className="metric-label">Compliance &lt; 50%</div>
          </div>
        </div>
        <div className="quick-upload-container">
          <button className="quick-upload-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            Quick Upload
          </button>
        </div>
      </div>

      <div className="latest-disclosures-section">
        <h2 className="section-title">Latest Disclosures</h2>
        <div className="disclosures-table-container">
          <table className="disclosures-table">
            <thead>
              <tr>
                <th>Announcement Title</th>
                <th>Date of Event</th>
                <th>Regulations</th>
                <th>Status</th>
                <th>Compliance Score</th>
              </tr>
            </thead>
            <tbody>
              {latestDisclosures.map((item) => {
                const showScore = item.fileStatus === 'Completed' && item.complianceScore != null;
                return (
                  <tr key={item.id}>
                    <td>{item.announcementTitle}</td>
                    <td>{formatDisplayDate(item.dateOfEvent)}</td>
                    <td>
                      {item.regulations.map((reg) => (
                        <span key={reg} className="regulation-tag">
                          {reg}
                        </span>
                      ))}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(item.fileStatus)}`}>
                        {item.fileStatus}
                      </span>
                    </td>
                    <td>
                      {showScore ? (
                        <span className="compliance-score">
                          <span className={`score-indicator ${getScoreIndicatorClass(item.complianceScore)}`} />
                          {item.complianceScore}%
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

export default Dashboard;

