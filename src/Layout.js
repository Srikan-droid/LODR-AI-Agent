import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';
import PortalModeContext from './context/PortalModeContext';

const getMenuKeyFromPath = (path) => {
  if (path === '/home' || path === '/') {
    return 'dashboard';
  }
  if (path.startsWith('/upload')) {
    return 'upload';
  }
  if (path.startsWith('/validation')) {
    return 'validation';
  }
  if (path.startsWith('/rkb') || path.startsWith('/regulation')) {
    return 'rkb';
  }
  if (path.startsWith('/feedback')) {
    return 'feedback';
  }
  if (path.startsWith('/regulator/live-feed')) {
    return 'live';
  }
  if (path.startsWith('/regulator/review')) {
    return 'review';
  }
  if (path.startsWith('/regulator/entity-master')) {
    return 'entity';
  }
  return 'dashboard';
};

const enterpriseNavItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/home',
    title: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
  },
  {
    key: 'upload',
    label: 'AI Agent',
    path: '/upload',
    title: 'AI Agent',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
    ),
  },
  {
    key: 'validation',
    label: 'Validation History',
    path: '/validation',
    title: 'Validation History',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ),
  },
  {
    key: 'rkb',
    label: 'Knowledge Center',
    path: '/rkb',
    title: 'Knowledge Center',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
  },
  {
    key: 'feedback',
    label: 'Feedback',
    path: '/feedback',
    title: 'Feedback',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
];

const regulatorNavItems = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    path: '/home',
    title: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
  },
  {
    key: 'live',
    label: 'Live Feed',
    path: '/regulator/live-feed',
    title: 'Live Feed',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M4 12h1"></path>
        <path d="M19 12h1"></path>
        <path d="M12 4v1"></path>
        <path d="M12 19v1"></path>
        <path d="M12 12l4 3"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
  },
  {
    key: 'review',
    label: 'Review',
    path: '/regulator/review',
    title: 'Review',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="14" rx="2"></rect>
        <path d="M7 21h10"></path>
        <path d="M12 17v4"></path>
        <path d="M7 7h10"></path>
        <path d="M7 11h6"></path>
      </svg>
    ),
  },
  {
    key: 'entity',
    label: 'Entity Master',
    path: '/regulator/entity-master',
    title: 'Entity Master',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="7" r="4"></circle>
        <path d="M5.5 21a6.5 6.5 0 0 1 13 0"></path>
      </svg>
    ),
  },
  {
    key: 'rkb',
    label: 'Knowledge Center',
    path: '/rkb',
    title: 'Knowledge Center',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
  },
];

function Layout({ children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Collapse sidebar by default on home page
    return location.pathname === '/home' || location.pathname === '/';
  });
  const [activeMenu, setActiveMenu] = useState(() => getMenuKeyFromPath(location.pathname));
  const [portalMode, setPortalMode] = useState(() => {
    return localStorage.getItem('portal_mode') || 'Enterprise';
  });
  const previousModeRef = useRef(portalMode);
  const profileMenuRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleMenuClick = (menuItem, path) => {
    setActiveMenu(menuItem);
    navigate(path);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogoutClick = () => {
    try {
      localStorage.removeItem('ai_agent_chat_history');
    } catch (error) {
      console.error('Failed to clear AI agent chat history', error);
    }
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

  useEffect(() => {
    localStorage.setItem('portal_mode', portalMode);
  }, [portalMode]);

  // Update sidebar state when navigating to/from home page
  useEffect(() => {
    const isHomePage = location.pathname === '/home' || location.pathname === '/';
    setIsCollapsed(isHomePage);
  }, [location.pathname]);

  useEffect(() => {
    setActiveMenu(getMenuKeyFromPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    if (previousModeRef.current !== portalMode) {
      setActiveMenu('dashboard');
      if (portalMode === 'Regulator') {
        navigate('/home', { replace: true, state: { from: 'portal-switch' } });
      } else {
        navigate('/home', { replace: true, state: { from: 'portal-switch' } });
      }
      previousModeRef.current = portalMode;
    }
  }, [portalMode, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navItems = portalMode === 'Regulator' ? regulatorNavItems : enterpriseNavItems;

  const handlePortalSwitch = (mode) => {
    if (mode !== portalMode) {
      setPortalMode(mode);
    }
    setIsProfileMenuOpen(false);
  };

  return (
    <PortalModeContext.Provider value={{ portalMode, setPortalMode }}>
      <div className="app-layout">
      {/* Left Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src={`${process.env.PUBLIC_URL || ''}/iris logo.png`} alt="IRIS Logo" className="sidebar-logo-image" />
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {isCollapsed ? (
                <polyline points="9 18 15 12 9 6"></polyline>
              ) : (
                <polyline points="15 18 9 12 15 6"></polyline>
              )}
            </svg>
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-item ${activeMenu === item.key ? 'active' : ''}`}
              onClick={() => handleMenuClick(item.key, item.path)}
              title={item.title}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`main-content-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <div className="header-logo-text">
              <div className="header-logo-main">IRIS RegAI</div>
              <div className="header-logo-sub">Smart, Regulatory AI engine for continuous monitoring and early warning system on non-compliance.</div>
            </div>
          </div>
          <div className="header-right">
            <div className="utility-buttons">
              <button className="header-button" aria-label="Notifications">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </button>
              <button className="header-button" aria-label="Help">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </button>
            </div>
            <div className="user-profile-wrapper" ref={profileMenuRef}>
              <button
                className="user-profile-button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Admin</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
              {isProfileMenuOpen && (
                <div className="user-dropdown" role="menu">
                  <button
                    type="button"
                    className="user-dropdown-item"
                    onClick={() => handlePortalSwitch(portalMode === 'Enterprise' ? 'Regulator' : 'Enterprise')}
                  >
                    {portalMode === 'Enterprise' ? 'Switch to Regulator view' : 'Switch to Enterprise view'}
                  </button>
                  <button type="button" className="user-dropdown-item" onClick={handleLogoutClick}>
                    Logout
                  </button>
                </div>
              )}
            </div>
            <button
              className="header-button logout-button desktop-logout"
              onClick={handleLogoutClick}
              aria-label="Logout"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1-2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
      </div>
    </PortalModeContext.Provider>
  );
}

export default Layout;