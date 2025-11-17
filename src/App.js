import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Layout from './Layout';
import Dashboard from './Dashboard';
import UploadDisclosure from './UploadDisclosure';
import ValidationHistory from './ValidationHistory';
import DisclosureDetailsPage from './pages/DisclosureDetailsPage';
import Feedback from './Feedback';
import { DisclosuresProvider } from './context/DisclosuresContext';

// Sample SEBI Regulations Data - Updated links
const regulationsData = [
  {
    id: 1,
    title: 'Securities and Exchange Board of India (Listing Obligations and Disclosure Requirements) Regulations, 2015 [Last amended on September 08, 2025]',
    category: 'Listing Obligations',
    description: 'Listing Obligations and Disclosure Requirements for all listed entities',
    date: '2015-09-02',
    lastAmended: '2025-09-08',
    keywords: ['listing', 'disclosure', 'corporate governance', 'lodr'],
    events: [
      {
        id: 1,
        name: 'Credit Ratings',
        description: 'Disclosures related to credit ratings of listed entities',
        category: 'Disclosure',
        keywords: ['credit rating', 'CRA', 'rating agency', 'disclosure'],
        regulations: [
          {
            id: 1,
            typeOfEntity: 'Listed entity (wherever applicable)',
            regulation: 'Regulation 8',
            requirement: 'General Obligation / Cooperation',
            text: 'The listed entity shall co-operate with and submit correct and adequate information to intermediaries registered with the Board, such as credit rating agencies, within specified timelines and procedures.',
            format: 'N/A',
            validationCheck: '',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 2,
            typeOfEntity: 'Listed entity with listed specified securities',
            regulation: 'Regulation 30 read with Schedule III, Part A, Para A, Clause 3',
            requirement: 'Event-based disclosure (Deemed Material)',
            text: 'Disclosure of New Rating(s) or Revision in Rating(s) assigned by a credit rating agency to any debt instrument, fixed deposit programme, or scheme/proposal involving fund mobilization (in India or abroad). Downward revision reasons must be intimated.',
            format: 'Disclosure to stock exchanges',
            validationCheck: 'announcement_date - rating_date <= 24H',
            penalty: '',
            source: 'LODR.pdf, Master Circular - Very Imp_Reg 30_LODR_13July2023.pdf, Very Imp_Reg 30_LODR_13July2023.pdf'
          },
          {
            id: 3,
            typeOfEntity: 'Listed entity with listed specified securities',
            regulation: 'Regulation 46(2)(r)',
            requirement: 'Website disclosure',
            text: 'Disclose all credit ratings obtained by the entity for all its outstanding instruments on its functional website.',
            format: 'Disclosed on the entity website',
            validationCheck: 'announcement_date - website_date <= 24H',
            penalty: 'Regulation 46 - Non-compliance results in Advisory/warning letter per instance of non-compliance per item; or ₹ 10,000 per instance for every additional advisory/warning letter exceeding four in a financial year.',
            source: 'LODR.pdf, SEBI_Non-compliance with certain provisions of the SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015 and the Standard Operating Procedure for suspension and revocation of trading of specified securities.pdf'
          },
          {
            id: 4,
            typeOfEntity: 'Listed entity which has listed non-convertible securities',
            regulation: 'Regulation 55 (Chapter V)',
            requirement: 'Review requirement',
            text: 'Each rating obtained by the listed entity with respect to non-convertible securities shall be reviewed by a credit rating agency registered by the Board.',
            format: 'N/A',
            validationCheck: 'announcement_date present in last 12 months',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 5,
            typeOfEntity: 'Listed entity which has listed non-convertible securities',
            regulation: 'Regulation 56(1)(c)(i) (Chapter V)',
            requirement: 'Intimation to Debenture Trustees',
            text: 'The listed entity shall forward intimations regarding any revision in the rating to the debenture trustee.',
            format: 'N/A',
            validationCheck: '',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 6,
            typeOfEntity: 'Listed entity which has listed non-convertible securities',
            regulation: 'Regulation 62(1)(i) (Chapter V)',
            requirement: 'Website disclosure',
            text: 'Maintain a functional website containing all credit ratings obtained by the entity for all its listed non-convertible securities.',
            format: 'Disclosed on the entity website',
            validationCheck: 'announcement_date - website_date <= 24H',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 7,
            typeOfEntity: 'Special Purpose Distinct Entity (issuer of securitised debt instruments) and its Trustees',
            regulation: 'Regulation 84(1) (Chapter VIII)',
            requirement: 'Review requirement',
            text: 'Every rating obtained with respect to securitised debt instruments shall be periodically reviewed by a credit rating agency registered by the Board.',
            format: 'N/A',
            validationCheck: 'announcement_date present in last 12 months',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 8,
            typeOfEntity: 'Recognised Stock Exchange(s)',
            regulation: 'Regulation 84(2) (Chapter VIII)',
            requirement: 'Dissemination',
            text: 'Any revision in rating(s) shall be disseminated by the stock exchange(s).',
            format: 'Disclosure by stock exchanges',
            validationCheck: '',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 9,
            typeOfEntity: 'Special Purpose Distinct Entity (issuer of securitised debt instruments) and its Trustees/Servicer',
            regulation: 'Regulation 85(2) (Chapter VIII)',
            requirement: 'Information to Investors',
            text: 'Provide information regarding revision in rating as a result of credit rating done periodically in terms of regulation 84 to its investors.',
            format: 'Disclosure to investors in electronic form/fax if consented',
            validationCheck: '',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 10,
            typeOfEntity: 'Special Purpose Distinct Entity (issuer of securitised debt instruments) and its Trustees',
            regulation: 'Schedule III, Part D, Para A(7) (Chapter VIII)',
            requirement: 'Disclosure of material information',
            text: 'Disclosure of revision in rating as a result of credit rating done periodically.',
            format: 'Disclosure to stock exchanges',
            validationCheck: 'announcement_date - rating_date <= 24H',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 11,
            typeOfEntity: 'Issuer of security receipts',
            regulation: 'Regulation 87C(2) (Chapter VIII A)',
            requirement: 'Compliance with RBI requirements / NAV Disclosure',
            text: 'Comply with extant RBI requirement of obtaining credit rating of security receipts and declaration of the net asset value thereafter.',
            format: 'In quarters where both external valuation and credit rating are required, issuer shall disclose lower of the two calculated Net Asset Value',
            validationCheck: '',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 12,
            typeOfEntity: 'Issuer of security receipts',
            regulation: 'Schedule III, Part E, A(5) (Chapter VIII A)',
            requirement: 'Disclosure of material event (without materiality test)',
            text: 'Disclosure of periodic rating obtained from credit rating agency or any revision in the rating or any expected revision in rating.',
            format: 'Disclosure to stock exchanges',
            validationCheck: 'announcement_date - rating_date <= 24H',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 13,
            typeOfEntity: 'Issuer of security receipts',
            regulation: 'Schedule III, Part E, A(7) (Chapter VIII A)',
            requirement: 'Disclosure of material event (without materiality test)',
            text: 'Disclosure of any proposal to change or change of credit rating agency or Valuer.',
            format: 'Disclosure to stock exchanges',
            validationCheck: 'announcement_date - rating_date <= 24H',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 14,
            typeOfEntity: 'Asset Management Company (Managing Mutual Fund Scheme)',
            regulation: 'Regulation 90(2)(b) (Chapter IX)',
            requirement: 'Intimation regarding rating',
            text: 'Intimate the recognised stock exchange(s) of the rating of the scheme whose units are listed and any changes in the rating thereof (wherever applicable).',
            format: 'Disclosure to stock exchanges',
            validationCheck: 'announcement_date - rating_date <= 24H',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 15,
            typeOfEntity: 'Listed entity which has listed non-convertible securities',
            regulation: 'Schedule III, Part B, Para A(13) (Chapter V)',
            requirement: 'Disclosure of material information',
            text: 'Disclosure of any revision in the rating.',
            format: 'Disclosure to stock exchanges',
            validationCheck: 'announcement_date - rating_date <= 24H',
            penalty: '',
            source: 'LODR.pdf'
          },
          {
            id: 16,
            typeOfEntity: 'Listed entity with listed specified securities',
            regulation: 'Schedule V, Part C, Clause 9(q)',
            requirement: 'Annual Report Disclosure',
            text: 'Disclosure of list of all credit ratings obtained by the entity along with any revisions thereto during the relevant financial year, for all debt instruments, fixed deposit programmes, or schemes involving mobilization of funds (in India or abroad).',
            format: 'Disclosure in Annual report',
            validationCheck: 'Is annual_report = yes, Within annual_report, is Corp_gov_rep = yes, Within Corp_gov_rep, is Credit_rating = Yes',
            penalty: 'Regulation 27(2) - Non submission of the Corporate governance compliance report within the period provided under this regulation: Rs 2000 per day',
            source: 'LODR.pdf'
          }
        ]
      },
      {
        id: 2,
        name: 'Material Events',
        description: 'Disclosure of material events and information',
        category: 'Disclosure',
        keywords: ['material events', 'material information', 'event disclosure']
      },
      {
        id: 3,
        name: 'Board Meetings',
        description: 'Regulations regarding board meeting procedures and disclosures',
        category: 'Corporate Governance',
        keywords: ['board meeting', 'meeting notice', 'agenda']
      },
      {
        id: 4,
        name: 'Related Party Transactions',
        description: 'Disclosure and approval requirements for related party transactions',
        category: 'Corporate Governance',
        keywords: ['related party', 'transaction', 'RPT']
      },
      {
        id: 5,
        name: 'Corporate Actions',
        description: 'Disclosure requirements for various corporate actions',
        category: 'Corporate Governance',
        keywords: ['corporate action', 'dividend', 'bonus']
      }
    ]
  }
];

// Component to detect if text is truncated and show "Read more" only when needed
function TextCell({ text, regulation, requirement, onReadMore }) {
  const textRef = useRef(null);
  const containerRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const textElement = textRef.current;
        
        // Store original inline style
        const originalStyle = textElement.style.cssText;
        
        // Temporarily remove max-height to measure full content height
        textElement.style.maxHeight = 'none';
        const fullHeight = textElement.scrollHeight;
        
        // Restore original style
        textElement.style.cssText = originalStyle;
        
        // Get visible height with max-height constraint applied
        const visibleHeight = textElement.clientHeight;
        
        // Check if text is actually truncated (with small tolerance for rounding)
        const isTextTruncated = fullHeight > visibleHeight + 2;
        setIsTruncated(isTextTruncated);
      }
    };

    // Use requestAnimationFrame to ensure DOM is fully rendered
    const rafId = requestAnimationFrame(() => {
      checkTruncation();
      // Also check after a short delay to account for any layout changes
      setTimeout(checkTruncation, 100);
    });
    
    // Recheck on window resize
    window.addEventListener('resize', checkTruncation);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', checkTruncation);
    };
  }, [text]);

  if (!text) return <span>N/A</span>;

  return (
    <div ref={containerRef} className="exact-text-cell">
      <div ref={textRef} className="preview-text">
        {text}
      </div>
      {isTruncated && (
        <button
          type="button"
          className="read-more-link"
          onClick={(e) => {
            e.stopPropagation();
            onReadMore(`${regulation} — ${requirement}`, text);
          }}
        >
          Read more
        </button>
      )}
    </div>
  );
}

function MainContent({ onLogout }) {
  const navigate = useNavigate();
  const { regulationId, eventId } = useParams();
  const [searchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showDirectory, setShowDirectory] = useState(!!regulationId || searchParams.get('view') === 'directory');
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalText, setModalText] = useState('');
  
  // Load regulation and event from URL params
  useEffect(() => {
    if (regulationId) {
      const regulation = regulationsData.find(r => r.id === parseInt(regulationId));
      if (regulation) {
        setSelectedRegulation(regulation);
        setShowDirectory(false);
        
        if (eventId) {
          const event = regulation.events?.find(e => e.id === parseInt(eventId));
          if (event) {
            setSelectedEvent(event);
          } else {
            setSelectedEvent(null);
          }
        } else {
          setSelectedEvent(null);
        }
      }
    } else {
      setSelectedRegulation(null);
      setSelectedEvent(null);
      setShowDirectory(searchParams.get('view') === 'directory');
    }
  }, [regulationId, eventId, searchParams]);

  // Filter regulations and events based on search query
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    const results = [];
    
    regulationsData.forEach(regulation => {
      // Check if regulation matches
      const matchesRegulation = 
        regulation.title.toLowerCase().includes(query) ||
        regulation.category.toLowerCase().includes(query) ||
        regulation.description.toLowerCase().includes(query) ||
        regulation.keywords.some(keyword => keyword.toLowerCase().includes(query));
      
      // Check if any event matches
      const matchingEvents = regulation.events && regulation.events.filter(event => 
        event.name.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.category.toLowerCase().includes(query) ||
        (event.keywords && event.keywords.some(keyword => keyword.toLowerCase().includes(query)))
      );
      
      // Add regulation if it matches
      if (matchesRegulation) {
        results.push({ type: 'regulation', data: regulation });
      }
      
      // Add individual matching events
      if (matchingEvents && matchingEvents.length > 0) {
        matchingEvents.forEach(event => {
          results.push({ type: 'event', data: event, regulation });
        });
      }
    });
    
    return results;
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/rkb?search=${encodeURIComponent(searchQuery)}&view=directory`);
      setShowDirectory(true);
      setSelectedRegulation(null);
    }
  };

  const handleOpenDirectory = () => {
    navigate('/rkb?view=directory');
    setShowDirectory(true);
    setSearchQuery('');
    setSelectedRegulation(null);
    setSelectedEvent(null);
  };

  const handleCloseDirectory = () => {
    navigate('/rkb');
    setShowDirectory(false);
    setSelectedRegulation(null);
    setSelectedEvent(null);
  };

  const handleRegulationClick = (regulation) => {
    navigate(`/regulation/${regulation.id}`);
    setSelectedRegulation(regulation);
    setShowDirectory(false);
    setSelectedEvent(null);
  };
  
  const handleEventClick = (regulation, event) => {
    navigate(`/regulation/${regulation.id}/event/${event.id}`);
    setSelectedRegulation(regulation);
    setSelectedEvent(event);
    setShowDirectory(false);
  };

  const handleUpload = (reg) => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.xls,.xlsx';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('Uploading file for regulation:', reg.requirement, file.name);
        // Add your upload logic here
        alert(`File "${file.name}" selected for upload for ${reg.requirement}`);
      }
    };
    input.click();
  };

  const handleGenerate = (reg) => {
    console.log('Generating document for regulation:', reg.requirement);
    // Add your generate logic here
    alert(`Generating document for ${reg.requirement}`);
  };

  const openTextModal = (title, fullText) => {
    setModalTitle(title);
    setModalText(fullText);
    setIsModalOpen(true);
  };

  const closeTextModal = () => {
    setIsModalOpen(false);
    setModalTitle('');
    setModalText('');
  };

  return (
    <div className="App">
      <div className="container">
          
          {!showDirectory && !selectedRegulation && (
            <div className="homepage-content">
              <form onSubmit={handleSearch} className="search-section">
                <div className="search-container">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search regulations by keyword, title, or category..."
                    className="search-input"
                  />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedEvent(null);
                      }}
                      className="clear-search-button"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  )}
                  <button type="submit" className="search-button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    Search
                  </button>
                </div>
              </form>
              
              <div className="divider">
                <span>OR</span>
              </div>
              
              <button onClick={handleOpenDirectory} className="directory-button">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Browse All Regulations
              </button>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && filteredSearchResults.length > 0 && !showDirectory && (
            <div className="search-results">
              <h2 className="results-title">Search Results ({filteredSearchResults.length})</h2>
              <div className="results-grid">
                {filteredSearchResults.map((result, idx) => (
                  <div 
                    key={`${result.type}-${result.data.id}-${idx}`} 
                    className={result.type === 'event' ? 'event-card' : 'regulation-card'}
                    onClick={() => {
                      if (result.type === 'event') {
                        handleEventClick(result.regulation, result.data);
                      } else {
                        handleRegulationClick(result.data);
                      }
                    }}
                  >
                    <span className={result.type === 'event' ? 'event-category-badge' : 'category-badge'}>
                      {result.type === 'event' ? result.data.category : result.data.category}
                    </span>
                    <h3 className={result.type === 'event' ? 'event-name' : 'card-title'}>
                      {result.type === 'event' ? result.data.name : result.data.title}
                    </h3>
                    <p className={result.type === 'event' ? 'event-description' : 'card-description'}>
                      {result.type === 'event' ? result.data.description : result.data.description}
                    </p>
                    {result.type === 'event' && result.data.keywords && (
                      <div className="card-keywords">
                        {result.data.keywords.map((keyword, idx) => (
                          <span key={idx} className="keyword-tag">{keyword}</span>
                        ))}
                      </div>
                    )}
                    {result.type === 'event' && result.data.regulations && (
                      <span className="event-view-details">Click to view details →</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchQuery && filteredSearchResults.length === 0 && !showDirectory && (
            <div className="no-results">
              <p>No regulations found matching "{searchQuery}"</p>
              <button onClick={() => setSearchQuery('')} className="clear-button">
                Clear Search
              </button>
            </div>
          )}

          {/* Directory View */}
          {showDirectory && (
            <div className="directory-view">
              <div className="directory-header">
                <h2 className="directory-title">All Regulations</h2>
                <button onClick={handleCloseDirectory} className="close-button">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                  Close
                </button>
              </div>
              <div className="directory-grid">
                {regulationsData.map(regulation => (
                  <div 
                    key={regulation.id} 
                    className="regulation-card"
                    onClick={() => handleRegulationClick(regulation)}
                  >
                    <span className="category-badge">{regulation.category}</span>
                    <h3 className="card-title">{regulation.title}</h3>
                    <p className="card-description">{regulation.description}</p>
                    <div className="card-footer">
                      <span className="card-date">{regulation.date}</span>
                      <span className="card-keywords">
                        {regulation.keywords.slice(0, 2).map((keyword, idx) => (
                          <span key={idx} className="keyword-tag">{keyword}</span>
                        ))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regulation Detail View */}
          {selectedRegulation && (
            <div className="detail-view">
              <button onClick={() => navigate('/rkb?view=directory')} className="back-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Directory
              </button>
              <div className="detail-content">
                <span className="detail-category">{selectedRegulation.category}</span>
                <h2 className="detail-title">{selectedRegulation.title}</h2>
                <span className="detail-date">Date: {selectedRegulation.date}</span>
                {selectedRegulation.lastAmended && (
                  <span className="detail-date">Last Amended: {selectedRegulation.lastAmended}</span>
                )}
                <p className="detail-description">{selectedRegulation.description}</p>
                
                {!selectedEvent && selectedRegulation.events && selectedRegulation.events.length > 0 && (
                  <div className="detail-events">
                    <h3>Events</h3>
                    <div className="events-grid">
                      {selectedRegulation.events.map((event) => (
                        <div 
                          key={event.id} 
                          className="event-card"
                          onClick={() => event.regulations && handleEventClick(selectedRegulation, event)}
                          style={{ cursor: event.regulations ? 'pointer' : 'default' }}
                        >
                          <span className="event-category-badge">{event.category}</span>
                          <h4 className="event-name">{event.name}</h4>
                          <p className="event-description">{event.description}</p>
                          {event.keywords && (
                            <div className="card-keywords">
                              {event.keywords.map((keyword, idx) => (
                                <span key={idx} className="keyword-tag">{keyword}</span>
                              ))}
                            </div>
                          )}
                          {event.regulations && (
                            <span className="event-view-details">Click to view details →</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent && selectedEvent.regulations && (
                  <div className="event-detail-view">
                    <button onClick={() => navigate(`/regulation/${selectedRegulation.id}`)} className="back-to-events-button">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                      </svg>
                      Back to Events
                    </button>
                    <div className="event-detail-header">
                      <h3>{selectedEvent.name}</h3>
                      <p className="event-detail-subtitle">{selectedEvent.description}</p>
                    </div>
                    <div className="regulations-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Regulation / Clause</th>
                            <th>Type of entity</th>
                            <th>Requirement</th>
                            <th>Summary Regulatory Text</th>
                            <th>Format / Details</th>
                            <th>Validation Check</th>
                            <th>Penalty/Action</th>
                            <th>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEvent.regulations.map((reg) => (
                            <tr key={reg.id}>
                              <td>{reg.regulation || 'N/A'}</td>
                              <td>{reg.typeOfEntity || 'N/A'}</td>
                              <td>{reg.requirement}</td>
                              <td>
                                <TextCell
                                  text={reg.text}
                                  regulation={reg.regulation}
                                  requirement={reg.requirement}
                                  onReadMore={openTextModal}
                                />
                              </td>
                              <td>{reg.format}</td>
                              <td className="validation-check-cell">
                                {reg.validationCheck ? (
                                  <div className="validation-check-content">
                                    {reg.severity && (
                                      <div className={`severity-indicator severity-${reg.severity.toLowerCase()}`}>
                                        <span className="severity-dot"></span>
                                        <span className="severity-text">{reg.severity}</span>
                                      </div>
                                    )}
                                    <ol className="validation-ol">
                                      {reg.validationCheck.split('\n').map((line, idx) => {
                                        const cleaned = line.replace(/^\s*\d+\.\s*/, '');
                                        return (
                                          <li key={idx} className="validation-line">{cleaned}</li>
                                        );
                                      })}
                                    </ol>
                                  </div>
                                ) : (
                                  <span className="no-validation">N/A</span>
                                )}
                              </td>
                              <td className="penalty-cell">
                                {reg.penalty ? (
                                  <div className="penalty-content">{reg.penalty}</div>
                                ) : (
                                  <span className="no-penalty">N/A</span>
                                )}
                              </td>
                              <td className="source-cell">
                                {reg.source ? (
                                  <a 
                                    href={reg.source.startsWith('http') ? reg.source : '#'} 
                                    target={reg.source.startsWith('http') ? '_blank' : undefined}
                                    rel={reg.source.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="source-link"
                                    onClick={!reg.source.startsWith('http') ? (e) => { e.preventDefault(); } : undefined}
                                    title={reg.source}
                                  >
                                    View Source
                                  </a>
                                ) : (
                                  <span className="source-text">N/A</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {isModalOpen && (
                      <div className="modal-overlay" onClick={closeTextModal}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                          <div className="modal-header">
                            <h4 className="modal-title">{modalTitle}</h4>
                            <button className="modal-close" onClick={closeTextModal} aria-label="Close">×</button>
                          </div>
                          <div className="modal-body">
                            <p>{modalText}</p>
                          </div>
                          <div className="modal-footer">
                            <button className="modal-close-button" onClick={closeTextModal}>Close</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {!selectedEvent && (
                  <div className="detail-keywords">
                    <h3>Keywords:</h3>
                    <div className="keywords-container">
                      {selectedRegulation.keywords.map((keyword, idx) => (
                        <span key={idx} className="keyword-tag">{keyword}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Check if user is already logged in (from sessionStorage)
    return sessionStorage.getItem('lodr_authenticated') === 'true';
  });

  const handleLogin = () => {
    // Set authentication state
    setIsAuthenticated(true);
    sessionStorage.setItem('lodr_authenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('lodr_authenticated');
  };

  return (
    <DisclosuresProvider>
      <Router>
        <Routes>
        <Route 
          path="/" 
          element={<Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/login" 
          element={<Login onLogin={handleLogin} />} 
        />
        <Route 
          path="/home" 
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Dashboard />
              </Layout>
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/upload" 
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <UploadDisclosure />
              </Layout>
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/validation" 
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <ValidationHistory />
              </Layout>
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route
          path="/validation/:disclosureId"
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <DisclosureDetailsPage />
              </Layout>
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route 
          path="/rkb/*" 
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <MainContent onLogout={handleLogout} />
              </Layout>
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/feedback" 
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <Feedback />
              </Layout>
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/regulation/:regulationId" 
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <MainContent onLogout={handleLogout} />
              </Layout>
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        <Route 
          path="/regulation/:regulationId/event/:eventId" 
          element={
            isAuthenticated ? (
              <Layout onLogout={handleLogout}>
                <MainContent onLogout={handleLogout} />
              </Layout>
            ) : (
              <Login onLogin={handleLogin} />
            )
          } 
        />
        </Routes>
      </Router>
    </DisclosuresProvider>
  );
}

export default App;
