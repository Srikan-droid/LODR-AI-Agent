import React, { useMemo } from 'react';
import './DisclosureDetailsModal.css';
import { formatDisplayDate } from '../data/disclosures';
import { generateRuleResults } from '../utils/ruleUtils';
import { findRuleMetadata } from '../constants/validationRules';

function DisclosureDetailsModal({ disclosure, onClose }) {
  const derivedRules = useMemo(() => {
    if (!disclosure) {
      return [];
    }

    const { complianceScore, ruleResults = [] } = disclosure;
    if (ruleResults.length) {
      return ruleResults;
    }
    if (complianceScore != null) {
      return generateRuleResults(complianceScore);
    }
    return [];
  }, [disclosure]);

  if (!disclosure) {
    return null;
  }

  const { announcementTitle, dateOfEvent, complianceScore, regulations = [] } = disclosure;
  const scoreClass =
    complianceScore != null ? `compliance-score ${getScoreIndicatorClass(complianceScore)}` : '';

  return (
    <div className="disclosure-modal-overlay" onClick={onClose}>
      <div className="disclosure-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="disclosure-modal-header">
          <div>
            <h3>{announcementTitle}</h3>
            <p className="disclosure-meta">
              Date: <span>{formatDisplayDate(dateOfEvent)}</span> • Source: <span>Upload</span>
            </p>
          </div>
          <button className="disclosure-modal-close" onClick={onClose} aria-label="Close dialog">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="disclosure-summary">
          <div>
            <span className="summary-label">Compliance Score</span>
            <div className={`summary-value ${scoreClass}`}>
              {complianceScore != null ? `${complianceScore}%` : '-'}
            </div>
          </div>
          <div>
            <span className="summary-label">Regulations</span>
            <div className="regulation-pill-container">
              {regulations.length ? (
                regulations.map((reg) => (
                  <span key={reg} className="regulation-pill">
                    {reg}
                  </span>
                ))
              ) : (
                <span className="regulation-pill muted">Not available</span>
              )}
            </div>
          </div>
        </div>

        <div className="rule-section">
          <div className="rule-section-header">
            <h4>Rules Validated</h4>
            <span className="rule-count">{derivedRules.length || 0} checks</span>
          </div>
          {derivedRules.length ? (
            <table className="rule-table">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Rule Description</th>
                  <th>Extracted Evidence</th>
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
                        <span className="rule-name">{rule.name}</span>
                      </td>
                      <td>{rule.detail || 'Context extracted from PDF submission'}</td>
                      <td>
                        <span className={`rule-status ${rule.status.toLowerCase()}`}>
                          {rule.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="rule-empty-state">Validation results will appear once processing ends.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DisclosureDetailsModal;

const getRuleIdLabel = (rule) => {
  if (!rule) return '';
  if (rule.ruleId) return rule.ruleId;
  const metadata = findRuleMetadata(rule.ruleId || rule.name || rule.check);
  return metadata?.id || '';
};

const getScoreIndicatorClass = (score) => {
  if (score >= 80) return 'score-good';
  if (score >= 50) return 'score-warning';
  return 'score-poor';
};
