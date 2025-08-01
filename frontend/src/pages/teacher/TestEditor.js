import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../../services/api';
import ImageUpload from '../../components/ImageUpload';

const TestEditor = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const isNewTest = testId === 'new';
  
  const [test, setTest] = useState({ title: '', description: '' });
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(!isNewTest);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [questionForm, setQuestionForm] = useState({
    text: '',
    category_id: '',
    image_url: '',
    table_data: '',
    options: ['', '', '', ''],
    correct_answer: ''
  });

  useEffect(() => {
    fetchCategories();
    if (!isNewTest) {
      fetchTestData();
    }
  }, [testId, isNewTest]);

  const fetchCategories = async () => {
    try {
      const response = await teacherAPI.getCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  const fetchTestData = async () => {
    try {
      const [testResponse, questionsResponse] = await Promise.all([
        teacherAPI.getTest(testId),
        teacherAPI.getQuestions(testId)
      ]);
      
      setTest(testResponse.data);
      setQuestions(questionsResponse.data);
    } catch (err) {
      setError('Failed to load test data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      let savedTest;
      if (isNewTest) {
        const response = await teacherAPI.createTest(test);
        savedTest = response.data;
        navigate(`/teacher/tests/${savedTest.id}/edit`);
      } else {
        const response = await teacherAPI.updateTest(testId, test);
        savedTest = response.data;
        setTest(savedTest);
      }
      setSuccess('Test saved successfully');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save test');
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isNewTest) {
      setError('Please save the test first before adding questions');
      return;
    }

    // Validate form
    const nonEmptyOptions = questionForm.options.filter(opt => opt.trim() !== '');
    if (nonEmptyOptions.length < 2) {
      setError('Please provide at least 2 answer options');
      return;
    }

    if (!questionForm.correct_answer || !nonEmptyOptions.includes(questionForm.correct_answer)) {
      setError('Please select a correct answer from the provided options');
      return;
    }

    try {
      const questionData = {
        ...questionForm,
        test_id: parseInt(testId),
        category_id: parseInt(questionForm.category_id),
        options: nonEmptyOptions,
        table_data: questionForm.table_data ? JSON.parse(questionForm.table_data) : null
      };

      if (editingQuestion) {
        await teacherAPI.updateQuestion(editingQuestion.id, questionData);
        setSuccess('Question updated successfully');
      } else {
        await teacherAPI.createQuestion(questionData);
        setSuccess('Question added successfully');
      }

      // Reset form and refresh questions
      setQuestionForm({
        text: '',
        category_id: '',
        image_url: '',
        table_data: '',
        options: ['', '', '', ''],
        correct_answer: ''
      });
      setShowQuestionForm(false);
      setEditingQuestion(null);
      fetchTestData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save question');
    }
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      text: question.text,
      category_id: question.category_id.toString(),
      image_url: question.image_url || '',
      table_data: question.table_data ? JSON.stringify(question.table_data, null, 2) : '',
      options: [...question.options, '', '', '', ''].slice(0, 4),
      correct_answer: question.correct_answer
    });
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      await teacherAPI.deleteQuestion(questionId);
      setSuccess('Question deleted successfully');
      fetchTestData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete question');
    }
  };

  const updateQuestionOption = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  if (loading) return <div className="loading">Loading test editor...</div>;

  return (
    <div className="container">
      <h1>{isNewTest ? 'Create New Test' : `Edit Test: ${test.title}`}</h1>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Test Details Form */}
      <div className="card">
        <h2>Test Details</h2>
        <form onSubmit={handleSaveTest}>
          <div className="form-group">
            <label>Test Title</label>
            <input
              type="text"
              value={test.title}
              onChange={(e) => setTest({ ...test, title: e.target.value })}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={test.description}
              onChange={(e) => setTest({ ...test, description: e.target.value })}
              rows="3"
            />
          </div>
          
          <button type="submit" className="btn btn-primary">
            {isNewTest ? 'Create Test' : 'Update Test'}
          </button>
        </form>
      </div>

      {/* Questions Section */}
      {!isNewTest && (
        <div className="card">
          <div className="card-header">
            <h2>Questions ({questions.length})</h2>
            <button
              className="btn btn-success"
              onClick={() => {
                setShowQuestionForm(!showQuestionForm);
                setEditingQuestion(null);
                setQuestionForm({
                  text: '',
                  category_id: categories[0]?.id.toString() || '',
                  image_url: '',
                  table_data: '',
                  options: ['', '', '', ''],
                  correct_answer: ''
                });
              }}
            >
              Add Question
            </button>
          </div>

          {/* Question Form */}
          {showQuestionForm && (
            <div className="question-form">
              <h3>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h3>
              <form onSubmit={handleQuestionSubmit}>
                <div className="form-group">
                  <label>Question Text</label>
                  <textarea
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={questionForm.category_id}
                    onChange={(e) => setQuestionForm({ ...questionForm, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Question Image (optional)</label>
                  <ImageUpload
                    currentImageUrl={questionForm.image_url}
                    onImageUploaded={(url, filename) => {
                      setQuestionForm({ ...questionForm, image_url: url });
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Table Data (optional JSON)</label>
                  <textarea
                    value={questionForm.table_data}
                    onChange={(e) => setQuestionForm({ ...questionForm, table_data: e.target.value })}
                    rows="3"
                    placeholder='{"headers": ["Column 1", "Column 2"], "rows": [["Data 1", "Data 2"]]}'
                  />
                </div>

                <div className="form-group">
                  <label>Answer Options</label>
                  {questionForm.options.map((option, index) => (
                    <div key={index} className="option-input">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateQuestionOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label>Correct Answer</label>
                  <select
                    value={questionForm.correct_answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                    required
                  >
                    <option value="">Select Correct Answer</option>
                    {questionForm.options
                      .filter(opt => opt.trim() !== '')
                      .map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-success">
                    {editingQuestion ? 'Update Question' : 'Add Question'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowQuestionForm(false);
                      setEditingQuestion(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Questions List */}
          <div className="questions-list">
            {questions.map((question, index) => (
              <div key={question.id} className="question-item">
                <div className="question-header">
                  <h4>Question {index + 1}</h4>
                  <div className="question-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEditQuestion(question)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteQuestion(question.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="question-content">
                  <p className="question-text">{question.text}</p>
                  
                  {question.image_url && (
                    <div className="question-image">
                      <img src={question.image_url} alt="Question" />
                    </div>
                  )}

                  <div className="question-options">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`option ${option === question.correct_answer ? 'correct' : ''}`}
                      >
                        {option === question.correct_answer && '✓ '}
                        {option}
                      </div>
                    ))}
                  </div>

                  <div className="question-meta">
                    <span className="category-tag">
                      {categories.find(cat => cat.id === question.category_id)?.name || 'Unknown Category'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {questions.length === 0 && (
            <div className="no-questions">
              <p>No questions added yet. Click "Add Question" to get started.</p>
            </div>
          )}
        </div>
      )}

      <div className="page-actions">
        <button
          className="btn btn-secondary"
          onClick={() => navigate('/teacher/tests')}
        >
          Back to Tests
        </button>
      </div>

      <style jsx>{`
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .card-header h2 {
          margin: 0;
        }

        .question-form {
          background: #f8f9fa;
          border: 1px solid #e0e6ed;
          border-radius: 8px;
          padding: 2rem;
          margin-bottom: 2rem;
        }



        .option-input {
          margin-bottom: 0.5rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .questions-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .question-item {
          border: 1px solid #e0e6ed;
          border-radius: 8px;
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

        .question-actions {
          display: flex;
          gap: 0.5rem;
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

        .question-options {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin: 1rem 0;
        }

        .option {
          padding: 0.75rem;
          background: #f8f9fa;
          border: 1px solid #e0e6ed;
          border-radius: 4px;
        }

        .option.correct {
          background: #d4edda;
          border-color: #c3e6cb;
          color: #155724;
          font-weight: 500;
        }

        .question-meta {
          display: flex;
          justify-content: flex-end;
          margin-top: 1rem;
        }

        .category-tag {
          background: #e8f4f8;
          color: #0c5460;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
        }

        .no-questions {
          text-align: center;
          padding: 3rem;
          color: #7f8c8d;
        }

        .btn-sm {
          padding: 0.375rem 0.75rem;
          font-size: 0.875rem;
        }

        .page-actions {
          display: flex;
          justify-content: center;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid #e0e6ed;
        }

        @media (max-width: 768px) {
          .question-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .question-actions {
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default TestEditor;