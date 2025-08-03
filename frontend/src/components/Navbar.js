import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isTeacher() ? "/teacher/dashboard" : "/dashboard"} className="navbar-brand">
          <img 
            src={process.env.PUBLIC_URL + '/logo.png'} 
            alt="Logo" 
            className="navbar-logo" 
            onError={(e) => {
              console.log('Logo failed to load:', e.target.src);
              e.target.style.display = 'none';
            }}
          />
          <span>synapsekz: Exam Platform</span>
        </Link>
        
        <div className="navbar-menu">
          {isTeacher() && (
            <>
              <Link to="/teacher/dashboard" className="navbar-item">Dashboard</Link>
              <Link to="/teacher/tests" className="navbar-item">Tests</Link>
            </>
          )}
          
          {isStudent() && (
            <>
              <Link to="/dashboard" className="navbar-item">Dashboard</Link>
              <Link to="/my-results" className="navbar-item">My Results</Link>
            </>
          )}
          
          <div className="navbar-user">
            <span className="user-info">{user.name} ({user.role})</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;