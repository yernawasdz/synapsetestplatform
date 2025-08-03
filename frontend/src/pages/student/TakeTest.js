import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const TakeTest = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [testId]);

  const fetchQuestions = async () => {
    try {
      const response = await studentAPI.getTestQuestions(testId);
      setQuestions(response.data);
      // Initialize answers object
      const initialAnswers = {};
      response.data.forEach(question => {
        initialAnswers[question.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError('Failed to load test questions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all questions are answered (including "Не знаю" as a valid answer)
    const unansweredQuestions = questions.filter(q => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      setError(`Please answer all questions (you can select "Не знаю" if you don't know the answer). ${unansweredQuestions.length} questions remaining.`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const submission = {
        test_id: parseInt(testId),
        answers: questions.map(question => ({
          question_id: question.id,
          answer: answers[question.id]
        }))
      };

      await studentAPI.submitTest(submission);
      navigate(`/result/${testId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit test');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading test...</div>;

  return (
    <div className="container">
      <div className="card">
        <h1>Take Test</h1>
        
        {error && <div className="alert alert-error">{error}</div>}

                  <form onSubmit={handleSubmit}>
          {/* Информационный блок в начале экзамена */}
          <div className="exam-info-card">
            <h3>📝 Важная информация</h3>
            <div className="exam-info-text">
              <p>
                Если вы не знаете правильный ответ на вопрос — не стоит гадать. 
                Просто выберите вариант «Не знаю».
              </p>
              <p>
                Это важно для корректной оценки ваших знаний и поможет нам точнее 
                определить темы, которые требуют дополнительного внимания.
              </p>
            </div>
          </div>

            {questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <h3>Question {index + 1}</h3>
              <div className="question-text">{question.text}</div>

              {question.image_url && (
                <div className="question-image">
                  <img src={question.image_url} alt="Question" />
                </div>
              )}

              {question.table_data && (
                <div className="question-table">
                  <pre>{JSON.stringify(question.table_data, null, 2)}</pre>
                </div>
              )}

              <div className="question-options">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="option-label">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={submitting}
                    />
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="submit-section">
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Test'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .exam-info-card {
          border: 2px solid #3498db;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          background: #ebf3fd;
          box-shadow: 0 2px 4px rgba(52, 152, 219, 0.1);
        }

        .exam-info-card h3 {
          color: #2980b9;
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .exam-info-text {
          color: #2c3e50;
          line-height: 1.6;
        }

        .exam-info-text p {
          margin-bottom: 0.75rem;
        }

        .exam-info-text p:last-child {
          margin-bottom: 0;
        }

        .question-card {
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          background: #f8f9fa;
        }

        .question-text {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .question-image img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1rem 0;
        }

        .question-table {
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 1rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .question-table pre {
          margin: 0;
          font-size: 0.9rem;
        }

        .question-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-top: 1rem;
        }

        .option-label {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          background: white;
          border: 2px solid #e0e6ed;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .option-label:hover {
          border-color: #3498db;
        }

        .option-label input[type="radio"] {
          margin-right: 0.75rem;
        }

        .option-label input[type="radio"]:checked {
          accent-color: #3498db;
        }

        .option-label:has(input:checked) {
          border-color: #3498db;
          background-color: #ebf3fd;
        }

        .option-text {
          flex: 1;
        }

        .submit-section {
          text-align: center;
          padding: 2rem 0;
          border-top: 1px solid #e0e6ed;
          margin-top: 2rem;
        }

        .submit-section .btn {
          padding: 1rem 2rem;
          font-size: 1.1rem;
        }
      `}</style>
    </div>
  );
};

export default TakeTest;