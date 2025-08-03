import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const TestResult = () => {
  const { testId } = useParams();
  const [detailedResult, setDetailedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDetailedResult();
  }, [testId]);

  const fetchDetailedResult = async () => {
    try {
      const response = await studentAPI.getDetailedResult(testId);
      setDetailedResult(response.data);
    } catch (err) {
      setError('Не удалось загрузить результаты экзамена');
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

  const getCategoryPerformance = () => {
    if (!detailedResult?.result?.category_breakdown) return [];
    
    return Object.entries(detailedResult.result.category_breakdown).map(([category, data]) => ({
      category,
      ...data
    }));
  };

  if (loading) return <div className="loading">Загрузка результатов...</div>;

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }

  const { test, result, questions } = detailedResult;
  const categoryPerformance = getCategoryPerformance();

  return (
    <div className="container">
      <div className="card">
        <h1>Результаты экзамена: {test.title}</h1>
        
        <div className="result-summary">
          <div className="score-display">
            <div className="score-circle" style={{ borderColor: getScoreColor(result.score) }}>
              <span className="score-value" style={{ color: getScoreColor(result.score) }}>
                {result.score.toFixed(1)}%
              </span>
            </div>
          </div>
          
          <div className="result-info">
            <p><strong>Экзамен:</strong> {test.title}</p>
            <p><strong>Завершен:</strong> {new Date(result.timestamp).toLocaleString()}</p>
            <p><strong>Всего вопросов:</strong> {questions.length}</p>
          </div>
        </div>

        {result.recommendation && (
          <div className="recommendation">
            <h3>Рекомендация учителя</h3>
            <p>{result.recommendation}</p>
          </div>
        )}

        {categoryPerformance.length > 0 && (
          <div className="category-breakdown">
            <h3>Результаты по разделам</h3>
            <div className="category-grid">
              {categoryPerformance.map((cat, index) => (
                <div key={index} className="category-item">
                  <h4>{cat.category}</h4>
                  <div className="category-stats">
                    <span className="fraction">{cat.correct}/{cat.total}</span>
                    <span 
                      className="percentage" 
                      style={{ color: getScoreColor(cat.percentage) }}
                    >
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="detailed-answers">
          <h3>Детальные ответы</h3>
          {questions.map((item, index) => (
            <div key={item.question.id} className="answer-item">
              <div className="question-header">
                <h4>Задание {index + 1}</h4>
                <span className={`result-badge ${item.is_correct ? 'correct' : 'incorrect'}`}>
                  {item.is_correct ? '✅ Правильно' : '❌ Неправильно'}
                </span>
              </div>
              
              <div className="question-content">
                <p className="question-text">{item.question.text}</p>
                
                {item.question.image_url && (
                  <div className="question-image">
                    <img src={item.question.image_url} alt="Question" />
                  </div>
                )}

                <div className="answer-details">
                  <div className="answer-row">
                    <strong>Ваш ответ:</strong>
                    <span className={item.is_correct ? 'correct-answer' : 'wrong-answer'}>
                      {item.student_answer || 'Ответ не предоставлен'}
                    </span>
                  </div>
                  
                  {!item.is_correct && (
                    <div className="answer-row">
                      <strong>Правильный ответ:</strong>
                      <span className="correct-answer">{item.correct_answer}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="actions">
          <Link to="/dashboard" className="btn btn-primary">Вернуться к панели управления</Link>
          <Link to="/my-results" className="btn btn-secondary">Посмотреть все результаты</Link>
        </div>
      </div>

      <style jsx>{`
        .result-summary {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border: 4px solid;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
        }

        .score-value {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .result-info p {
          margin: 0.5rem 0;
        }

        .recommendation {
          background: #e8f4f8;
          border: 1px solid #bee5eb;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 2rem 0;
        }

        .recommendation h3 {
          margin-top: 0;
          color: #0c5460;
        }

        .category-breakdown {
          margin: 2rem 0;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .category-item {
          background: white;
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }

        .category-item h4 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
        }

        .category-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .fraction {
          color: #7f8c8d;
        }

        .percentage {
          font-weight: bold;
          font-size: 1.1rem;
        }

        .detailed-answers {
          margin-top: 3rem;
        }

        .answer-item {
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8f9fa;
          padding: 1rem;
          border-bottom: 1px solid #e0e6ed;
        }

        .question-header h4 {
          margin: 0;
        }

        .result-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .result-badge.correct {
          background: #d4edda;
          color: #155724;
        }

        .result-badge.incorrect {
          background: #f8d7da;
          color: #721c24;
        }

        .question-content {
          padding: 1rem;
        }

        .question-text {
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .question-image img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1rem 0;
        }

        .answer-details {
          background: #f8f9fa;
          border-radius: 4px;
          padding: 1rem;
          margin-top: 1rem;
        }

        .answer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .answer-row:last-child {
          margin-bottom: 0;
        }

        .correct-answer {
          color: #27ae60;
          font-weight: 500;
        }

        .wrong-answer {
          color: #e74c3c;
          font-weight: 500;
        }

        .actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e0e6ed;
        }
      `}</style>
    </div>
  );
};

export default TestResult;