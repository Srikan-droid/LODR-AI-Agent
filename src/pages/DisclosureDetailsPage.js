import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDisclosures } from '../context/DisclosuresContext';
import { formatDisplayDate } from '../data/disclosures';
import { generateRuleResults } from '../utils/ruleUtils';
import DisclosureDetailsModal from '../components/DisclosureDetailsModal';
import './DisclosureDetailsPage.css';

function DisclosureDetailsPage() {
  const { disclosureId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { disclosures } = useDisclosures();
  const [showModal, setShowModal] = useState(false);

  const disclosure = useMemo(
    () => disclosures.find((item) => String(item.id) === String(disclosureId)),
    [disclosures, disclosureId]
  );

  const derivedRules = useMemo(() => {
    if (!disclosure) return [];
    if (disclosure.ruleResults?.length) return disclosure.ruleResults;
    if (disclosure.complianceScore != null) {
      return generateRuleResults(disclosure.complianceScore);
    }
    return [];
  }, [disclosure]);

  if (!disclosure) {
    return (
      <div className="disclosure-details-page">
        <div className="details-card">
          <p className="details-empty">We couldn't find that disclosure.</p>
          <button className="back-button" onClick={() => navigate('/validation')}>
            Back to Validation History
          </button>
        </div>
      </div>
    );
  }

  const { announcementTitle, dateOfEvent, complianceScore, fileStatus } = disclosure;

  const handleBack = () => {
    if (location.state?.from === 'dashboard') {
      navigate('/home');
    } else {
      navigate('/validation');
    }
  };

  return (
    <div className="disclosure-details-page">
      <header className="details-header">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>
    </header>

      <section className="details-card">
        <div className="details-summary">
          <div className="summary-text">
            <h1>{announcementTitle}</h1>
            <p>
              Date: <span>{formatDisplayDate(dateOfEvent)}</span> • Source: <span>Upload</span>
            </p>
            <p>
              Status: <span className="status-pill">{fileStatus}</span>
            </p>
          </div>
          <div className="summary-score">
            <span>Compliance Score</span>
            <strong>{complianceScore != null ? `${complianceScore}%` : '-'}</strong>
          </div>
        </div>
      </section>

      <section className="details-card">
        <div className="rules-header">
          <h2>Rules Validated</h2>
          <div className="rules-actions">
            <span>{derivedRules.length || 0} checks</span>
            <button className="view-details-link" onClick={() => setShowModal(true)}>
              View details
            </button>
          </div>
        </div>
        <div className="rules-table-wrapper">
          {derivedRules.length ? (
            <table className="rule-table">
              <thead>
                <tr>
                  <th>Rule</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {derivedRules.map((rule) => (
                  <tr key={rule.id}>
                    <td>{rule.name}</td>
                    <td>
                      <span className={`rule-status ${rule.status?.toLowerCase()}`}>{rule.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="details-empty">Validation results will appear once processing completes.</p>
          )}
        </div>
      </section>

      {showModal && (
        <DisclosureDetailsModal disclosure={disclosure} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default DisclosureDetailsPage;

