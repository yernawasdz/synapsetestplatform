import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, isTeacher } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated()) {
    return <Navigate to={isTeacher() ? "/teacher/dashboard" : "/dashboard"} replace />;
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials);
    
    if (result.success) {
      // Navigation will be handled by the redirect above after re-render
      navigate(isTeacher() ? "/teacher/dashboard" : "/dashboard");
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <img 
            src={process.env.PUBLIC_URL + '/logo.png'} 
            alt="Logo" 
            className="logo-image" 
            onError={(e) => {
              console.log('Logo failed to load:', e.target.src);
              e.target.style.display = 'none';
            }}
          />
        </div>
        <h1>synapsekz: Exam Platform</h1>
        <h2>Вход</h2>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
        

      </div>
    </div>
  );
};

export default Login;