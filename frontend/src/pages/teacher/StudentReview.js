import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { teacherAPI } from '../../services/api';

const StudentReview = () => {
  const { studentId } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [testResults, setTestResults] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testDetails, setTestDetails] = useState(null);
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  useEffect(() => {
    if (selectedTest) {
      fetchTestDetails();
    }
  }, [selectedTest]);

  const fetchStudentData = async () => {
    try {
      const response = await teacherAPI.getStudentResults(studentId);
      setStudentData(response.data.student);
      
      // Set the test results from the API instead of using mock data
      const realTestResults = response.data.results || [];
      setTestResults(realTestResults);
      
    } catch (err) {
      setError('Failed to load student data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestDetails = async () => {
    try {
      const response = await teacherAPI.getStudentTestAnswers(studentId, selectedTest.test_id);
      setTestDetails(response.data);
      setRecommendation(response.data.result?.recommendation || '');
    } catch (err) {
      setError('Failed to load test details');
      console.error(err);
    }
  };

  const handleSaveRecommendation = async () => {
    if (!testDetails?.result?.id) {
      setError('No test result found to update');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await teacherAPI.updateRecommendation(testDetails.result.id, recommendation);
      setSuccess('Recommendation saved successfully');
      
      // Update the local state
      setTestDetails(prev => ({
        ...prev,
        result: {
          ...prev.result,
          recommendation: recommendation
        }
      }));
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save recommendation');
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getCategoryPerformance = () => {
    if (!testDetails?.result?.category_breakdown) return [];
    
    return Object.entries(testDetails.result.category_breakdown).map(([category, data]) => ({
      category,
      ...data
    }));
  };

  if (loading) return <div className="loading">Loading student data...</div>;

  if (error && !studentData) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
        <Link to="/teacher/dashboard" className="btn btn-primary">Back to Dashboard</Link>
      </div>
    );
  }



  return (
    <div className="container">
      <div className="page-header">
        <h1>Student Review: {studentData.name}</h1>
        <Link to="/teacher/dashboard" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="student-overview">
        <div className="card">
          <h2>Student Information</h2>
          <div className="student-info">
            <div className="info-item">
              <strong>Name:</strong> {studentData.name}
            </div>
            <div className="info-item">
              <strong>Username:</strong> @{studentData.username}
            </div>
            <div className="info-item">
              <strong>Role:</strong> {studentData.role}
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Test Results</h2>
          {testResults.length === 0 ? (
            <p>No test results available for this student.</p>
          ) : (
            <div className="results-list">
              {testResults.map(result => (
                <div
                  key={result.id}
                  className={`result-item ${selectedTest?.id === result.id ? 'selected' : ''}`}
                  onClick={() => setSelectedTest(result)}
                >
                  <div className="result-info">
                    <h4>{result.test_title}</h4>
                    <span className="test-date">
                      {new Date(result.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div
                    className="result-score"
                    style={{ color: getScoreColor(result.score) }}
                  >
                    {result.score.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedTest && testDetails && (
        <div className="test-details">
          <div className="card">
            <h2>Test Details: {testDetails.test.title}</h2>
            
            <div className="test-summary">
              <div className="summary-item">
                <strong>Score:</strong>
                <span style={{ color: getScoreColor(testDetails.result.score) }}>
                  {testDetails.result.score.toFixed(1)}%
                </span>
              </div>
              <div className="summary-item">
                <strong>Completed:</strong>
                <span>{new Date(testDetails.result.timestamp).toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <strong>Total Questions:</strong>
                <span>{testDetails.questions.length}</span>
              </div>
            </div>

            {getCategoryPerformance().length > 0 && (
              <div className="category-performance">
                <h3>Результаты по разделам</h3>
                <div className="category-grid">
                  {getCategoryPerformance().map((cat, index) => (
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
              <h3>Student Answers</h3>
              {testDetails.questions.map((question, index) => {
                const studentAnswer = testDetails.answers.find(a => a.question_id === question.id);
                return (
                  <div key={question.id} className="answer-review">
                    <div className="question-header">
                      <h4>Question {index + 1}</h4>
                      <span className={`result-badge ${studentAnswer?.is_correct ? 'correct' : 'incorrect'}`}>
                        {studentAnswer?.is_correct ? '✅ Correct' : '❌ Incorrect'}
                      </span>
                    </div>
                    
                    <div className="question-content">
                      <p className="question-text">{question.text}</p>
                      
                      {question.image_url && (
                        <div className="question-image">
                          <img src={question.image_url} alt="Question" />
                        </div>
                      )}

                      <div className="answer-comparison">
                        <div className="answer-row">
                          <strong>Student Answer:</strong>
                          <span className={studentAnswer?.is_correct ? 'correct-answer' : 'wrong-answer'}>
                            {studentAnswer?.answer || 'No answer provided'}
                          </span>
                        </div>
                        
                        {!studentAnswer?.is_correct && (
                          <div className="answer-row">
                            <strong>Correct Answer:</strong>
                            <span className="correct-answer">{question.correct_answer}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="recommendation-section">
              <h3>Teacher's Recommendation</h3>
              <textarea
                className="recommendation-textarea"
                value={recommendation}
                onChange={(e) => setRecommendation(e.target.value)}
                placeholder="Write your recommendation for this student based on their performance..."
                rows="5"
              />
              <button
                className="btn btn-primary"
                onClick={handleSaveRecommendation}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Recommendation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTest && !testDetails && (
        <div className="loading">Loading test details...</div>
      )}

      <style jsx>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .student-overview {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .student-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .info-item {
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .results-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .result-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 2px solid #e0e6ed;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
        }

        .result-item:hover {
          border-color: #3498db;
          background: #f8f9fa;
        }

        .result-item.selected {
          border-color: #3498db;
          background: #ebf3fd;
        }

        .result-info h4 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }

        .test-date {
          color: #7f8c8d;
          font-size: 0.9rem;
        }

        .result-score {
          font-size: 1.5rem;
          font-weight: bold;
        }

        .test-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-item strong {
          color: #2c3e50;
        }

        .category-performance {
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

        .answer-review {
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
          padding: 1.5rem;
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

        .answer-comparison {
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

        .recommendation-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e0e6ed;
        }

        .recommendation-textarea {
          width: 100%;
          min-height: 120px;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.5;
          resize: vertical;
          margin-bottom: 1rem;
        }

        .recommendation-textarea:focus {
          outline: none;
          border-color: #3498db;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .student-overview {
            grid-template-columns: 1fr;
          }

          .test-summary {
            grid-template-columns: 1fr;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .question-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .answer-row {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentReview;