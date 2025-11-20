import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Layout.css';

function Layout({ children, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Collapse sidebar by default on home page
    return location.pathname === '/home' || location.pathname === '/';
  });
  const [activeMenu, setActiveMenu] = useState(() => {
    // Determine active menu based on current path
    if (location.pathname === '/home' || location.pathname === '/') {
      return 'dashboard';
    } else if (location.pathname.startsWith('/rkb') || location.pathname.startsWith('/regulation')) {
      return 'rkb';
    } else if (location.pathname.startsWith('/upload')) {
      return 'upload';
    } else if (location.pathname.startsWith('/validation')) {
      return 'validation';
    } else if (location.pathname.startsWith('/feedback')) {
      return 'feedback';
    }
    return 'dashboard';
  });

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

  // Update sidebar state when navigating to/from home page
  useEffect(() => {
    const isHomePage = location.pathname === '/home' || location.pathname === '/';
    setIsCollapsed(isHomePage);
  }, [location.pathname]);

  return (
    <div className="app-layout">
      {/* Left Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/iris logo.png" alt="iRIS Logo" className="sidebar-logo-image" />
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
          <button
            className={`nav-item ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleMenuClick('dashboard', '/home')}
            title="Dashboard"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            {!isCollapsed && <span>Dashboard</span>}
          </button>
          
          <button
            className={`nav-item ${activeMenu === 'upload' ? 'active' : ''}`}
            onClick={() => handleMenuClick('upload', '/upload')}
            title="AI Agent"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            {!isCollapsed && <span>AI Agent</span>}
          </button>
          
          <button
            className={`nav-item ${activeMenu === 'validation' ? 'active' : ''}`}
            onClick={() => handleMenuClick('validation', '/validation')}
            title="Validation History"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            {!isCollapsed && <span>Validation History</span>}
          </button>
          
          <button
            className={`nav-item ${activeMenu === 'rkb' ? 'active' : ''}`}
            onClick={() => handleMenuClick('rkb', '/rkb')}
            title="Knowledge Center"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {!isCollapsed && <span>Knowledge Center</span>}
          </button>
          
          <button
            className={`nav-item ${activeMenu === 'feedback' ? 'active' : ''}`}
            onClick={() => handleMenuClick('feedback', '/feedback')}
            title="Feedback"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {!isCollapsed && <span>Feedback</span>}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`main-content-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Header */}
        <header className="top-header">
          <div className="header-left">
            <div className="header-logo-text">
              <div className="header-logo-main">LODR AI Agent</div>
              <div className="header-logo-sub">Enterprise</div>
            </div>
          </div>
          <div className="header-right">
            <button className="header-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              Notifications
            </button>
            <button className="header-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Help
            </button>
            <div className="user-profile">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <span>Admin</span>
            </div>
            <button className="header-button logout-button" onClick={handleLogoutClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;