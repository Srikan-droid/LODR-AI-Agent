import React from 'react';
import './Dashboard.css';

function Dashboard() {
  return (
    <div className="dashboard-content">
      <h1 className="dashboard-title">Dashboard</h1>
      
      <div className="entity-overview-section">
        <h2 className="section-title">Entity Overview</h2>
        <div className="metrics-container">
          <div className="metric-card total-submission">
            <div className="metric-value">5</div>
            <div className="metric-label">Total Submission</div>
          </div>
          <div className="metric-card compliant">
            <div className="metric-value">3</div>
            <div className="metric-label">Compliant</div>
          </div>
          <div className="metric-card pending">
            <div className="metric-value">1</div>
            <div className="metric-label">Pending Review</div>
          </div>
          <div className="metric-card non-compliant">
            <div className="metric-value">1</div>
            <div className="metric-label">Non-Compliant</div>
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
                <th>Disclosure Title</th>
                <th>Date</th>
                <th>Regulations</th>
                <th>Compliance Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Credit Rating Disclosure - Q3 FY2024</td>
                <td>15/01/2024</td>
                <td>
                  <span className="regulation-tag">Reg 30</span>
                  <span className="regulation-tag">Reg 46</span>
                </td>
                <td>85%</td>
                <td>
                  <span className="status-badge compliant">Compliant</span>
                </td>
              </tr>
              <tr>
                <td>Board Meeting Outcome - Annual Results</td>
                <td>12/01/2024</td>
                <td>
                  <span className="regulation-tag">Reg 46</span>
                  <span className="regulation-tag">Reg 55</span>
                </td>
                <td>35%</td>
                <td>
                  <span className="status-badge non-compliant">Non-Compliant</span>
                </td>
              </tr>
              <tr>
                <td>Material Event - Change in Key Management</td>
                <td>10/01/2024</td>
                <td>
                  <span className="regulation-tag">Reg 33</span>
                </td>
                <td>-</td>
                <td>
                  <span className="status-badge pending">Pending Review</span>
                </td>
              </tr>
              <tr>
                <td>Related Party Transaction Disclosure</td>
                <td>08/01/2024</td>
                <td>
                  <span className="regulation-tag">Reg 45</span>
                  <span className="regulation-tag">Reg 55</span>
                </td>
                <td>-</td>
                <td>
                  <span className="status-badge pending">Pending Review</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

