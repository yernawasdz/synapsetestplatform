import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../../services/api';

const TestManagement = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await teacherAPI.getTests();
      setTests(response.data);
    } catch (err) {
      setError('Не удалось загрузить экзамены');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTest = async (testId, testTitle) => {
    if (!window.confirm(`Вы уверены, что хотите удалить "${testTitle}"? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      await teacherAPI.deleteTest(testId);
      setSuccess('Тест успешно удален');
      fetchTests();
    } catch (err) {
      setError(err.response?.data?.detail || 'Не удалось удалить тест');
    }
  };

  const handleExportResults = async (testId, testTitle) => {
    try {
      setError('');
      const response = await teacherAPI.exportTestResults(testId);
      
      // Create blob and download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create one
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${testTitle}_results.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename=(.+)/);
        if (filenameMatch) {
          filename = filenameMatch[1].replace(/"/g, '');
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Результаты успешно экспортированы для "${testTitle}"`);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Для этого экзамена пока нет результатов');
      } else {
        setError(err.response?.data?.detail || 'Не удалось экспортировать результаты');
      }
    }
  };

  if (loading) return <div className="loading">Загрузка экзаменов...</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>Управление экзаменами</h1>
        <Link to="/teacher/tests/new/edit" className="btn btn-primary">
          Создать новый экзамен
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {tests.length === 0 ? (
        <div className="card no-tests">
          <h3>Экзамены еще не созданы</h3>
          <p>Начните с создания первого экзамена для оценки знаний студентов.</p>
          <Link to="/teacher/tests/new/edit" className="btn btn-primary">
            Создать первый экзамен
          </Link>
        </div>
      ) : (
        <div className="tests-grid">
          {tests.map(test => (
            <div key={test.id} className="card test-card">
              <div className="test-header">
                <h3>{test.title}</h3>
                <div className="test-actions">
                  <button
                    onClick={() => handleExportResults(test.id, test.title)}
                    className="btn btn-success btn-sm"
                    title="Экспортировать результаты экзамена в CSV"
                  >
                    Экспорт
                  </button>
                  <Link 
                    to={`/teacher/tests/${test.id}/edit`}
                    className="btn btn-secondary btn-sm"
                  >
                    Редактировать
                  </Link>
                  <button
                    onClick={() => handleDeleteTest(test.id, test.title)}
                    className="btn btn-danger btn-sm"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div className="test-content">
                {test.description && (
                  <p className="test-description">{test.description}</p>
                )}

                <div className="test-stats">
                  <div className="stat">
                    <span className="stat-label">Вопросов:</span>
                    <span className="stat-value">{test.questions ? test.questions.length : 0}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Создан:</span>
                    <span className="stat-value">
                      {new Date(test.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="test-footer">
                  <Link 
                    to={`/teacher/tests/${test.id}/edit`}
                    className="btn btn-primary"
                  >
                    Управление вопросами
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="page-actions">
        <Link to="/teacher/dashboard" className="btn btn-secondary">
          Вернуться к панели управления
        </Link>
      </div>

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .no-tests {
          text-align: center;
          padding: 3rem;
        }

        .no-tests h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .no-tests p {
          color: #7f8c8d;
          margin-bottom: 2rem;
        }

        .tests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .test-card {
          border: 1px solid #e0e6ed;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .test-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .test-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        .test-header h3 {
          margin: 0;
          color: #2c3e50;
          flex: 1;
          margin-right: 1rem;
        }

        .test-actions {
          display: flex;
          gap: 0.5rem;
        }

        .test-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .test-description {
          color: #7f8c8d;
          line-height: 1.5;
          margin: 0;
        }

        .test-stats {
          display: flex;
          gap: 2rem;
        }

        .stat {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #7f8c8d;
        }

        .stat-value {
          font-weight: 500;
          color: #2c3e50;
        }

        .test-footer {
          padding-top: 1rem;
          border-top: 1px solid #f0f0f0;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .page-actions {
          display: flex;
          justify-content: center;
          padding-top: 2rem;
          border-top: 1px solid #e0e6ed;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .tests-grid {
            grid-template-columns: 1fr;
          }

          .test-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .test-actions {
            justify-content: flex-end;
          }

          .test-stats {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default TestManagement;