import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import './App.css';

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
            regulation: 'Regulation 55',
            requirement: 'Disclosure of Credit Ratings',
            text: 'The listed entity shall disclose all credit ratings obtained by it for all its outstanding instruments, whether listed or unlisted, to the stock exchange(s) where its securities are listed.',
            timeline: 'Ongoing',
            format: 'Disclosure to stock exchanges',
            source: 'https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-listing-obligations-and-disclosure-requirements-regulations-2015-last-amended-on-march-28-2025-_93409.html'
          },
          {
            id: 2,
            regulation: 'Regulation 30(6) & Schedule III Part A',
            requirement: 'Disclosure of Revision In Credit Rating',
            text: 'Any revision in credit rating shall be considered as material information and shall be disclosed to the stock exchange(s) within twenty-four hours from the occurrence of the event.',
            timeline: 'Within 24 hours',
            format: 'Electronic filing with rating rationale',
            source: 'https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-listing-obligations-and-disclosure-requirements-regulations-2015-last-amended-on-march-28-2025-_93409.html'
          },
          {
            id: 3,
            regulation: 'Regulation 62(1)(h)',
            requirement: 'Website Disclosure',
            text: 'The listed entity shall disseminate all credit ratings obtained by it for all its outstanding instruments, whether listed or unlisted, on its website.',
            timeline: 'Ongoing',
            format: 'Dedicated section on website',
            source: 'https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-listing-obligations-and-disclosure-requirements-regulations-2015-last-amended-on-march-28-2025-_93409.html'
          },
          {
            id: 4,
            regulation: 'Regulation 52(5)',
            requirement: 'Submission of Credit Rating Certificate',
            text: 'The listed entity shall submit a certificate from the credit rating agency along with the financial results, confirming the rating.',
            timeline: 'With financial results',
            format: 'Certificate from CRA',
            source: 'https://www.sebi.gov.in/legal/regulations/mar-2025/securities-and-exchange-board-of-india-listing-obligations-and-disclosure-requirements-regulations-2015-last-amended-on-march-28-2025-_93409.html'
          },
          {
            id: 5,
            regulation: 'SEBI Circular Jul 4, 2024',
            requirement: 'Press Release for Rating Action',
            text: 'Must include: Name of issuer, Instrument rated, Rating assigned, Rationale, Link to full rating report.',
            timeline: 'Within 1 working day',
            format: 'Press release by CRA',
            source: 'https://www.sebi.gov.in/legal/circulars/jul-2024/measures-for-ease-of-doing-business-for-credit-rating-agencies-cras-timelines-and-disclosures-_84599.html'
          },
          {
            id: 6,
            regulation: 'SEBI Circular Jul 4, 2024',
            requirement: 'Intimation to Stock Exchange',
            text: 'Through electronic filing system of the exchange; must include rating rationale and instrument details.',
            timeline: 'Within 24 hours',
            format: 'Electronic filing',
            source: 'https://www.sebi.gov.in/legal/circulars/jul-2024/measures-for-ease-of-doing-business-for-credit-rating-agencies-cras-timelines-and-disclosures-_84599.html'
          },
          {
            id: 7,
            regulation: 'SEBI Circular Jul 4, 2024',
            requirement: 'Website Disclosure by CRA',
            text: 'Must be accessible under a dedicated section for "Rating Actions"; archived for minimum 5 years.',
            timeline: 'Simultaneous with press release',
            format: 'CRA website section',
            source: 'https://www.sebi.gov.in/legal/circulars/jul-2024/measures-for-ease-of-doing-business-for-credit-rating-agencies-cras-timelines-and-disclosures-_84599.html'
          },
          {
            id: 8,
            regulation: 'SEBI Circular Jul 4, 2024',
            requirement: 'Submission to SEBI',
            text: 'Summary of all rating actions taken during the month, in prescribed format.',
            timeline: 'Monthly',
            format: 'Prescribed format submission',
            source: 'https://www.sebi.gov.in/legal/circulars/jul-2024/measures-for-ease-of-doing-business-for-credit-rating-agencies-cras-timelines-and-disclosures-_84599.html'
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

function MainContent() {
  const navigate = useNavigate();
  const { regulationId, eventId } = useParams();
  const [searchParams] = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showDirectory, setShowDirectory] = useState(!!regulationId || searchParams.get('view') === 'directory');
  const [selectedRegulation, setSelectedRegulation] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
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
      navigate(`/?search=${encodeURIComponent(searchQuery)}&view=directory`);
      setShowDirectory(true);
      setSelectedRegulation(null);
    }
  };

  const handleOpenDirectory = () => {
    navigate('/?view=directory');
    setShowDirectory(true);
    setSearchQuery('');
    setSelectedRegulation(null);
    setSelectedEvent(null);
  };

  const handleCloseDirectory = () => {
    navigate('/');
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

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-ribbon">
          <h1 className="main-title">Regulations Knowledge Base</h1>
          <p className="subtitle">Your comprehensive guide to regulations</p>
        </div>
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
              <button onClick={() => navigate('/?view=directory')} className="back-button">
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
                            <th>Requirement</th>
                            <th>Exact Regulatory Text</th>
                            <th>Timeline</th>
                            <th>Format / Details</th>
                            <th>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedEvent.regulations.map((reg) => (
                            <tr key={reg.id}>
                              <td>{reg.regulation}</td>
                              <td>{reg.requirement}</td>
                              <td>{reg.text}</td>
                              <td>{reg.timeline}</td>
                              <td>{reg.format}</td>
                              <td>
                                <a href={reg.source} target="_blank" rel="noopener noreferrer" className="source-link">
                                  View Source
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainContent />} />
        <Route path="/regulation/:regulationId" element={<MainContent />} />
        <Route path="/regulation/:regulationId/event/:eventId" element={<MainContent />} />
      </Routes>
    </Router>
  );
}

export default App;
