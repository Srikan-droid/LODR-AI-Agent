import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();

  const handleMicrosoftLogin = () => {
    // Dummy authentication - just navigate to the app
    onLogin();
    navigate('/home');
  };

  const handlePasswordLogin = () => {
    // Dummy authentication - just navigate to the app
    onLogin();
    navigate('/home');
  };

  const handleGuestAccess = () => {
    // Dummy authentication - just navigate to the app
    onLogin();
    navigate('/home');
  };

  return (
    <div className="login-page">
      <div className="language-selector">
        <button className="lang-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
          EN
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      <div className="login-card">
        <div className="logo-section">
          <div className="iris-logo">
            <img src="/iris logo.png" alt="iRIS Logo" className="logo-image" />
          </div>
        </div>

        <div className="welcome-section">
          <h1 className="welcome-title">Welcome to LODR AI Agent</h1>
          <p className="service-description">
            AI based automated compliance monitoring
          </p>
        </div>

        <div className="login-options">
          <button className="login-button microsoft-button" onClick={handleMicrosoftLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="8" y1="4" x2="8" y2="20"></line>
              <line x1="2" y1="12" x2="8" y2="12"></line>
            </svg>
            Continue with Microsoft
          </button>

          <button className="login-button password-button" onClick={handlePasswordLogin}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            Login with Password
          </button>

          <div className="separator">
            <div className="separator-line"></div>
            <span className="separator-text">or</span>
            <div className="separator-line"></div>
          </div>

          <button className="guest-option" onClick={handleGuestAccess}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Continue as Guest
          </button>
        </div>

        <div className="features-section">
          <div className="feature-item">
            <div className="feature-icon fast-processing">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polyline>
              </svg>
            </div>
            <p className="feature-text">Fast Processing</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon secure">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </div>
            <p className="feature-text">Secure</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon ai-powered">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <p className="feature-text">AI Powered</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

