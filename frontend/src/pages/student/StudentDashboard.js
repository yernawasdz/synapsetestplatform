import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const [tests, setTests] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsResponse, resultsResponse] = await Promise.all([
        studentAPI.getAvailableTests(),
        studentAPI.getMyResults()
      ]);
      
      setTests(testsResponse.data);
      setResults(resultsResponse.data);
    } catch (err) {
      setError('Не удалось загрузить данные панели управления');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasCompletedTest = (testId) => {
    return results.some(result => result.test_id === testId);
  };

  if (loading) return <div className="loading">Загрузка панели управления...</div>;

  return (
    <div className="container">
      <h1>Добро пожаловать, {user.name}!</h1>
      
      {error && <div className="alert alert-error">{error}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h2>Доступные экзамены</h2>
          {tests.length === 0 ? (
            <p>В данный момент нет доступных экзаменов.</p>
          ) : (
            <div className="test-list">
              {tests.map(test => (
                <div key={test.id} className="test-item">
                  <h3>{test.title}</h3>
                  <p>{test.description}</p>
                  <div className="test-actions">
                    {hasCompletedTest(test.id) ? (
                      <div>
                        <span className="completed-badge">✅ Завершено</span>
                        <Link 
                          to={`/result/${test.id}`} 
                          className="btn btn-secondary"
                        >
                          Посмотреть результаты
                        </Link>
                      </div>
                    ) : (
                                              <Link 
                          to={`/test/${test.id}`} 
                          className="btn btn-primary"
                        >
                          Пройти экзамен
                        </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2>Последние результаты</h2>
          {results.length === 0 ? (
            <p>Результатов экзаменов пока нет.</p>
          ) : (
            <div className="results-list">
              {results.slice(0, 5).map(result => (
                <div key={result.id} className="result-item">
                  <div className="result-info">
                    <strong>Экзамен #{result.test_id}</strong>
                    <span className="score">{result.score.toFixed(1)}%</span>
                  </div>
                  <div className="result-date">
                    {new Date(result.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
              {results.length > 5 && (
                <Link to="/my-results" className="btn btn-secondary">
                  Посмотреть все результаты
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .test-list, .results-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .test-item {
          border: 1px solid #e0e6ed;
          border-radius: 4px;
          padding: 1rem;
        }

        .test-item h3 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }

        .test-item p {
          margin: 0 0 1rem 0;
          color: #7f8c8d;
        }

        .test-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .completed-badge {
          color: #27ae60;
          font-weight: 500;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .result-item:last-child {
          border-bottom: none;
        }

        .result-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .score {
          font-size: 1.2em;
          font-weight: bold;
          color: #27ae60;
        }

        .result-date {
          color: #7f8c8d;
          font-size: 0.9em;
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;