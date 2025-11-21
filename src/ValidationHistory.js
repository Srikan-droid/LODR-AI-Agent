import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './ValidationHistory.css';
import { formatDisplayDate } from './data/disclosures';
import { useDisclosures } from './context/DisclosuresContext';

function ValidationHistory() {
  const { disclosures } = useDisclosures();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [eventDateFrom, setEventDateFrom] = useState('');
  const [eventDateTo, setEventDateTo] = useState('');
  const [uploadedDateFrom, setUploadedDateFrom] = useState('');
  const [uploadedDateTo, setUploadedDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const requestIds = useMemo(() => {
    const map = {};
    disclosures.forEach((item) => {
      map[item.id] = item.fileStatus !== 'Pending' ? generateRequestId() : null;
    });
    return map;
  }, [disclosures]);

  // Read scoreFilter from URL query params on mount and when URL changes
  useEffect(() => {
    const scoreFilterParam = searchParams.get('scoreFilter');
    if (scoreFilterParam && ['80-plus', '50-79', 'below-50', 'all'].includes(scoreFilterParam)) {
      setScoreFilter(scoreFilterParam);
      // Show filters when coming from dashboard tile click
      setFiltersVisible(true);
    }
  }, [searchParams]);

  const filteredHistory = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    const isWithinRange = (dateStr, from, to) => {
      if (!dateStr) return false;
      const date = new Date(dateStr);
      const fromDate = from ? new Date(from) : null;
      const toDateValue = to ? new Date(to) : null;
      if (fromDate && date < fromDate) return false;
      if (toDateValue && date > toDateValue) return false;
      return true;
    };

    const matchesScore = (score) => {
      if (scoreFilter === 'all') return true;
      if (scoreFilter === 'no-score') return score == null;
      if (score == null) return false;
      if (scoreFilter === '80-plus') return score >= 80;
      if (scoreFilter === '50-79') return score >= 50 && score < 80;
      if (scoreFilter === 'below-50') return score < 50;
      return true;
    };

    return disclosures.filter((item) => {
      if (statusFilter !== 'all' && item.fileStatus !== statusFilter) {
        return false;
      }

      if (!matchesScore(item.complianceScore)) {
        return false;
      }

      if ((eventDateFrom || eventDateTo) && !isWithinRange(item.dateOfEvent, eventDateFrom, eventDateTo)) {
        return false;
      }

      if (
        (uploadedDateFrom || uploadedDateTo) &&
        !isWithinRange(item.uploadedDate, uploadedDateFrom, uploadedDateTo)
      ) {
        return false;
      }

      if (term) {
        const haystack = [
          item.announcementTitle,
          item.fileName,
          item.regulations.join(' '),
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(term)) {
          return false;
        }
      }

      return true;
    });
  }, [disclosures, statusFilter, scoreFilter, eventDateFrom, eventDateTo, uploadedDateFrom, uploadedDateTo, searchTerm]);

  const handleResetFilters = () => {
    setStatusFilter('all');
    setScoreFilter('all');
    setEventDateFrom('');
    setEventDateTo('');
    setUploadedDateFrom('');
    setUploadedDateTo('');
    setSearchTerm('');
    setCurrentPage(1);
    // Clear URL parameters
    setSearchParams({});
  };

  const totalPages = Math.max(1, Math.ceil(filteredHistory.length / pageSize));
  const currentPageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredHistory.slice(start, start + pageSize);
  }, [filteredHistory, currentPage]);

  const handlePageChange = (direction) => {
    setCurrentPage((prev) => {
      if (direction === 'prev') {
        return Math.max(1, prev - 1);
      }
      if (direction === 'next') {
        return Math.min(totalPages, prev + 1);
      }
      return prev;
    });
  };

  return (
    <div className="validation-history-content">
      <h1 className="validation-history-title">Validation History</h1>

      <div className="filters-header">
        <button
          className="toggle-filters-btn"
          onClick={() => setFiltersVisible((prev) => !prev)}
        >
          {filtersVisible ? 'Hide Filters' : 'Show Filters'}
          <span className={`chevron ${filtersVisible ? 'expanded' : ''}`}>&#9662;</span>
        </button>
      </div>

      {filtersVisible && (
        <div className="filters-panel">
          <div className="filter-group compact">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Completed">Completed</option>
              <option value="Error">Error</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="filter-group compact offset">
            <label>Compliance Score</label>
            <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)}>
              <option value="all">All Scores</option>
              <option value="80-plus">80% &amp; above</option>
              <option value="50-79">50% - 79%</option>
              <option value="below-50">Below 50%</option>
              <option value="no-score">No Score</option>
            </select>
          </div>

          <div className="filter-group full-width">
            <label>Date of Event</label>
            <div className="date-input-row">
              <div className="date-input">
                <span className="date-label">From</span>
                <input
                  type="date"
                  value={eventDateFrom}
                  onChange={(e) => setEventDateFrom(e.target.value)}
                />
              </div>
              <div className="date-input">
                <span className="date-label">To</span>
                <input
                  type="date"
                  value={eventDateTo}
                  onChange={(e) => setEventDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="filter-group full-width">
            <label>Uploaded Date</label>
            <div className="date-input-row">
              <div className="date-input">
                <span className="date-label">From</span>
                <input
                  type="date"
                  value={uploadedDateFrom}
                  onChange={(e) => setUploadedDateFrom(e.target.value)}
                />
              </div>
              <div className="date-input">
                <span className="date-label">To</span>
                <input
                  type="date"
                  value={uploadedDateTo}
                  onChange={(e) => setUploadedDateTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="filter-group search-group full-width">
            <label>Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search title, regulation, file name"
            />
          </div>

          <div className="filter-actions full-width">
            <button className="reset-button small" onClick={handleResetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      )}
      
      <div className="validation-table-container">
        <table className="validation-table">
          <thead>
            <tr>
              <th>Announcement Title</th>
              <th>Date of Event</th>
              <th>Regulations</th>
              <th>Request ID</th>
              <th>Status</th>
              <th>Compliance Score</th>
            </tr>
          </thead>
          <tbody>
            {currentPageData.map((item) => {
              const isClickable = item.fileStatus === 'Completed';
              // Generate dummy data if missing
              const displayTitle = item.announcementTitle || `Disclosure - ${item.fileName?.replace('.pdf', '') || 'Document'}`;
              const displayDate = item.dateOfEvent || new Date().toISOString().split('T')[0];
              return (
                <tr key={item.id}>
                  <td>
                    <div className="announcement-cell">
                      <button
                        className={`disclosure-link ${!isClickable ? 'disabled' : ''}`}
                        onClick={() =>
                          isClickable && navigate(`/validation/${item.id}`, { state: { from: 'validation' } })
                        }
                        disabled={!isClickable}
                      >
                        {displayTitle}
                      </button>
                      <button
                        type="button"
                        className="info-tooltip"
                        aria-label={`File name ${item.fileName || 'not available'}, uploaded ${item.uploadedDate ? formatDisplayDate(item.uploadedDate) : 'date not available'}`}
                        data-tooltip={`File: ${item.fileName || 'Not available'} • Uploaded: ${item.uploadedDate ? formatDisplayDate(item.uploadedDate) : 'Not available'}`}
                      >
                        i
                      </button>
                    </div>
                  </td>
                  <td>{formatDisplayDate(displayDate)}</td>
                  <td>
                    {item.regulations.map((reg) => (
                      <span key={`${item.id}-${reg}`} className="regulation-tag">
                        {reg}
                      </span>
                    ))}
                  </td>
                  <td>{requestIds[item.id] || '-'}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(item.fileStatus)}`}>
                      {item.fileStatus}
                    </span>
                  </td>
                  <td>
                    {item.fileStatus === 'Completed' && item.complianceScore != null ? (
                      <span className="compliance-score">
                        <span
                          className={`score-indicator ${getScoreIndicatorClass(item.complianceScore)}`}
                        />
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

      <div className="pagination-bar">
        <button
          className="pagination-button"
          onClick={() => handlePageChange('prev')}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="pagination-info">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="pagination-button"
          onClick={() => handlePageChange('next')}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
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

const generateRequestId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i += 1) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

export default ValidationHistory;
