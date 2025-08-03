import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const MyResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await studentAPI.getMyResults();
      setResults(response.data);
    } catch (err) {
      setError('Не удалось загрузить результаты экзаменов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  const calculateAverageScore = () => {
    if (results.length === 0) return 0;
    const total = results.reduce((sum, result) => sum + result.score, 0);
    return total / results.length;
  };

  if (loading) return <div className="loading">Загрузка результатов...</div>;

  return (
    <div className="container">
      <div className="card">
        <h1>Мои результаты экзаменов</h1>

        {error && <div className="alert alert-error">{error}</div>}

        {results.length === 0 ? (
          <div className="no-results">
            <h3>Результатов экзаменов пока нет</h3>
            <p>Вы еще не проходили экзамены.</p>
            <Link to="/dashboard" className="btn btn-primary">Пройти экзамен</Link>
          </div>
        ) : (
          <>
            <div className="results-overview">
              <div className="stat-card">
                <h3>Завершенных экзаменов</h3>
                <div className="stat-value">{results.length}</div>
              </div>
              <div className="stat-card">
                <h3>Средний балл</h3>
                <div 
                  className="stat-value" 
                  style={{ color: getScoreColor(calculateAverageScore()) }}
                >
                  {calculateAverageScore().toFixed(1)}%
                </div>
              </div>
              <div className="stat-card">
                <h3>Лучший результат</h3>
                <div 
                  className="stat-value" 
                  style={{ color: getScoreColor(Math.max(...results.map(r => r.score))) }}
                >
                  {Math.max(...results.map(r => r.score)).toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="results-table">
              <div className="table-header">
                <div className="header-cell">Экзамен</div>
                <div className="header-cell">Балл</div>
                <div className="header-cell">Оценка</div>
                <div className="header-cell">Дата</div>
                <div className="header-cell">Действия</div>
              </div>

              {results
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map(result => (
                <div key={result.id} className="table-row">
                  <div className="cell">
                    <strong>Экзамен #{result.test_id}</strong>
                    {result.recommendation && (
                      <div className="has-recommendation">📝 Есть отзыв</div>
                    )}
                  </div>
                  <div className="cell">
                    <span 
                      className="score-badge" 
                      style={{ 
                        backgroundColor: getScoreColor(result.score), 
                        color: 'white' 
                      }}
                    >
                      {result.score.toFixed(1)}%
                    </span>
                  </div>
                  <div className="cell">
                    <span 
                      className="grade-badge"
                      style={{ color: getScoreColor(result.score) }}
                    >
                      {getScoreGrade(result.score)}
                    </span>
                  </div>
                  <div className="cell">
                    {new Date(result.timestamp).toLocaleDateString()}
                  </div>
                  <div className="cell">
                    <Link 
                      to={`/result/${result.test_id}`} 
                      className="btn btn-primary btn-sm"
                    >
                      Посмотреть детали
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="actions">
              <Link to="/dashboard" className="btn btn-primary">Вернуться к панели управления</Link>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .no-results {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }

        .results-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: #f8f9fa;
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-card h3 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: #2c3e50;
        }

        .results-table {
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e6ed;
        }

        .header-cell {
          padding: 1rem;
          font-weight: bold;
          color: #2c3e50;
          border-right: 1px solid #e0e6ed;
        }

        .header-cell:last-child {
          border-right: none;
        }

        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1.5fr 1fr;
          border-bottom: 1px solid #f0f0f0;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:hover {
          background: #f8f9fa;
        }

        .cell {
          padding: 1rem;
          display: flex;
          align-items: center;
          border-right: 1px solid #f0f0f0;
        }

        .cell:last-child {
          border-right: none;
        }

        .has-recommendation {
          font-size: 0.8rem;
          color: #3498db;
          margin-top: 0.25rem;
        }

        .score-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.9rem;
        }

        .grade-badge {
          font-size: 1.2rem;
          font-weight: bold;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .actions {
          display: flex;
          justify-content: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e0e6ed;
        }

        @media (max-width: 768px) {
          .table-header,
          .table-row {
            grid-template-columns: 1fr;
          }

          .header-cell,
          .cell {
            border-right: none;
            border-bottom: 1px solid #f0f0f0;
          }

          .header-cell:last-child,
          .cell:last-child {
            border-bottom: none;
          }
        }
      `}</style>
    </div>
  );
};

export default MyResults;