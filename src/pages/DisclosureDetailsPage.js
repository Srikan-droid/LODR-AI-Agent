import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDisclosures } from '../context/DisclosuresContext';
import { formatDisplayDate } from '../data/disclosures';
import { generateRuleResults } from '../utils/ruleUtils';
import { findRuleMetadata } from '../constants/validationRules';
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

  const failedRules = useMemo(() => {
    return derivedRules.filter((rule) => rule.status?.toLowerCase() === 'fail');
  }, [derivedRules]);

  const aiRecommendations = useMemo(() => {
    return failedRules.map((rule) => ({
      ruleName: rule.name,
      recommendation: generateAIRecommendation(rule.name),
    }));
  }, [failedRules]);

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

  const { announcementTitle, dateOfEvent, complianceScore, fileStatus, fileName, regulations = [] } = disclosure;
  const fileUrl = fileName ? `/uploads/${fileName}` : null;
  const isPdfFile = fileName?.toLowerCase().endsWith('.pdf');

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
              Status: <span className={`status-badge ${getStatusClass(fileStatus)}`}>{fileStatus}</span>
            </p>
            {regulations.length > 0 && (
              <div className="regulations-section">
                <span className="regulations-label">Regulations</span>
                <div className="regulations-list">
                  {regulations.map((reg) => (
                    <span key={reg} className="regulation-pill">
                      {reg}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="summary-actions">
            <div className="file-actions">
              {isPdfFile && fileUrl ? (
                <>
                  <a
                    className="file-action-btn"
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View PDF
                  </a>
                  <a
                    className="file-action-btn secondary"
                    href={fileUrl}
                    download={fileName}
                  >
                    Download
                  </a>
                </>
              ) : (
                <span className="file-action-placeholder">Document not available</span>
              )}
            </div>
            <div className="summary-score">
              <span>Compliance Score</span>
              {complianceScore != null ? (
                <strong className={`compliance-score ${getScoreIndicatorClass(complianceScore)}`}>
                  {complianceScore}%
                </strong>
              ) : (
                <strong>-</strong>
              )}
            </div>
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
                  <th>Rule ID</th>
                  <th>Rule Description</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {derivedRules.map((rule) => {
                  const ruleIdLabel = getRuleIdLabel(rule);
                  return (
                    <tr key={rule.id}>
                      <td className="rule-id-cell">
                        {ruleIdLabel ? <span className="rule-id-pill">{ruleIdLabel}</span> : '—'}
                      </td>
                      <td>
                        <span className="rule-name">{rule.name || 'Rule description unavailable'}</span>
                      </td>
                      <td>
                        <span className={`rule-status ${rule.status?.toLowerCase()}`}>{rule.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="details-empty">Validation results will appear once processing completes.</p>
          )}
        </div>
      </section>

      {aiRecommendations.length > 0 && (
        <section className="details-card">
          <div className="ai-recommendations-header">
            <h2>AI Recommendation</h2>
          </div>
          <div className="ai-recommendations-list">
            {aiRecommendations.map((rec, index) => (
              <div key={index} className="ai-recommendation-item">
                <div className="recommendation-rule">
                  <span className="recommendation-icon">💡</span>
                  <strong>{rec.ruleName}</strong>
                </div>
                <p className="recommendation-text">{rec.recommendation}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {showModal && (
        <DisclosureDetailsModal disclosure={disclosure} onClose={() => setShowModal(false)} />
      )}
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

const generateAIRecommendation = (ruleName) => {
  const recommendations = {
    'Announcement title matches filing': 'Ensure the announcement title exactly matches the filing document title. Review the submitted document and update the title to reflect the exact wording used in the official filing.',
    'Date of event is within acceptable range': 'Verify that the date of event falls within the regulatory reporting window. If the date is outside the acceptable range, provide justification or correct the date to match the actual event occurrence.',
    'All mandatory fields are present': 'Review the disclosure document and ensure all required fields as per the regulation are completed. Missing mandatory fields may result in non-compliance penalties.',
    'File format is PDF': 'Convert the document to PDF format before submission. PDF format ensures document integrity and compatibility with regulatory systems.',
    'Company name mentioned in document': 'Include the full legal company name as registered with the regulatory authority. Ensure the name appears consistently throughout the document.',
    'Disclosure made within 24 hours of event': 'Submit the disclosure within 24 hours of the event occurrence. Late submissions may require additional justification and could result in penalties.',
    'Relevant regulation cited correctly': 'Verify that the regulation numbers and clauses cited in the document are accurate and current. Cross-reference with the latest regulatory guidelines.',
    'Financial figures are consistent': 'Ensure all financial figures mentioned in the document are consistent across all sections. Verify calculations and cross-check with source documents.',
    'Signatories are authorized personnel': 'Confirm that the signatories listed in the document are authorized to sign on behalf of the company as per the company\'s authorization matrix.',
    'Document is free from typos': 'Perform a thorough review of the document for spelling and grammatical errors. Typos can affect the document\'s credibility and may need to be corrected through an amendment.',
  };

  return recommendations[ruleName] || 'Review the validation rule and ensure all requirements are met. Consult the regulatory guidelines for specific compliance requirements related to this rule.';
};

const getRuleIdLabel = (rule) => {
  if (!rule) return '';
  if (rule.ruleId) return rule.ruleId;
  const metadata = findRuleMetadata(rule.ruleId || rule.name || rule.check);
  return metadata?.id || '';
};

export default DisclosureDetailsPage;

