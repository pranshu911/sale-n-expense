import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [loginID, setLoginID] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  // Ensure the dark-mode class is removed when Login component mounts
  // and restore it when the component unmounts if it was active
  useEffect(() => {
    const wasDarkMode = document.body.classList.contains('dark-mode');
    
    // Remove dark-mode class when login page is shown
    document.body.classList.remove('dark-mode');
    
    // Cleanup function - restore dark mode class if it was active before
    return () => {
      if (wasDarkMode) {
        document.body.classList.add('dark-mode');
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginID || !password) {
      setError('Please enter both login ID and password');
      return;
    }

    try {
      const result = await login(loginID, password);
      
      if (result.success) {
        // Redirect to dashboard on successful login
        navigate('/dashboard');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="login-container light-mode-only">
      <div className="login-card">
        <div className="login-header">
          <h1>The Guys</h1>
          <h2>Login</h2>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="loginID">Login ID</label>
            <input
              type="text"
              id="loginID"
              value={loginID}
              onChange={(e) => setLoginID(e.target.value)}
              placeholder="Enter your login ID"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login; 