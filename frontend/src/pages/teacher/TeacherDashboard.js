import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../../services/api';

const TeacherDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'student',
    name: ''
  });

  const [newCategory, setNewCategory] = useState({
    name: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, testsResponse, categoriesResponse] = await Promise.all([
        teacherAPI.getUsers(),
        teacherAPI.getTests(),
        teacherAPI.getCategories()
      ]);
      
      setUsers(usersResponse.data);
      setTests(testsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await teacherAPI.createUser(newUser);
      setSuccess(`${newUser.role === 'student' ? 'Student' : 'Teacher'} created successfully`);
      setNewUser({ username: '', password: '', role: 'student', name: '' });
      setShowCreateUser(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create user');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      await teacherAPI.createCategory(newCategory);
      setSuccess('Category created successfully');
      setNewCategory({ name: '' });
      setShowCreateCategory(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create category');
    }
  };

  const students = users.filter(user => user.role === 'student');
  const teachers = users.filter(user => user.role === 'teacher');

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="container">
      <h1>Teacher Dashboard</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="dashboard-grid">
        {/* Quick Stats */}
        <div className="card stats-card">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{students.length}</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{tests.length}</div>
              <div className="stat-label">Tests</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{categories.length}</div>
              <div className="stat-label">Categories</div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="card">
          <div className="card-header">
            <h2>User Management</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateUser(!showCreateUser)}
            >
              Add User
            </button>
          </div>

          {showCreateUser && (
            <form onSubmit={handleCreateUser} className="create-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">Create User</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateUser(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="user-lists">
            <div className="user-section">
              <h3>Students ({students.length})</h3>
              <div className="user-list">
                {students.map(student => (
                  <div key={student.id} className="user-item">
                    <div className="user-info">
                      <strong>{student.name}</strong>
                      <span className="username">@{student.username}</span>
                    </div>
                    <Link 
                      to={`/teacher/student/${student.id}`}
                      className="btn btn-primary btn-sm"
                    >
                      View
                    </Link>
                  </div>
                ))}
                {students.length === 0 && <p>No students yet</p>}
              </div>
            </div>

            <div className="user-section">
              <h3>Teachers ({teachers.length})</h3>
              <div className="user-list">
                {teachers.map(teacher => (
                  <div key={teacher.id} className="user-item">
                    <div className="user-info">
                      <strong>{teacher.name}</strong>
                      <span className="username">@{teacher.username}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Management */}
        <div className="card">
          <div className="card-header">
            <h2>Categories</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateCategory(!showCreateCategory)}
            >
              Add Category
            </button>
          </div>

          {showCreateCategory && (
            <form onSubmit={handleCreateCategory} className="create-form">
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({name: e.target.value})}
                  placeholder="e.g., Genetics, Cell Biology"
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-success">Create Category</button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateCategory(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="category-list">
            {categories.map(category => (
              <div key={category.id} className="category-item">
                {category.name}
              </div>
            ))}
            {categories.length === 0 && <p>No categories yet</p>}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/teacher/tests" className="btn btn-primary">
              Manage Tests
            </Link>
            <Link to="/teacher/tests/new/edit" className="btn btn-success">
              Create New Test
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }

        .stats-card {
          grid-column: 1 / -1;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #3498db;
        }

        .stat-label {
          color: #7f8c8d;
          margin-top: 0.5rem;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-header h2 {
          margin: 0;
        }

        .create-form {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .user-lists {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .user-section h3 {
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 0.5rem;
        }

        .user-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .user-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .username {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .category-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .category-item {
          background: #e8f4f8;
          color: #0c5460;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }

          .user-lists {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;