import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
};

// Teacher API
export const teacherAPI = {
  // User management
  createUser: (userData) => api.post('/teacher/users/', userData),
  getUsers: () => api.get('/teacher/users/'),

  // Category management
  getCategories: () => api.get('/teacher/categories/'),
  createCategory: (categoryData) => api.post('/teacher/categories/', categoryData),
  updateCategory: (id, categoryData) => api.put(`/teacher/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/teacher/categories/${id}`),

  // Test management
  getTests: () => api.get('/teacher/tests/'),
  getTest: (id) => api.get(`/teacher/tests/${id}`),
  createTest: (testData) => api.post('/teacher/tests/', testData),
  updateTest: (id, testData) => api.put(`/teacher/tests/${id}`, testData),
  deleteTest: (id) => api.delete(`/teacher/tests/${id}`),

  // Question management
  getQuestions: (testId) => api.get(`/teacher/questions/`, { params: { test_id: testId } }),
  createQuestion: (questionData) => api.post('/teacher/questions/', questionData),
  updateQuestion: (id, questionData) => api.put(`/teacher/questions/${id}`, questionData),
  deleteQuestion: (id) => api.delete(`/teacher/questions/${id}`),

  // Student review
  getStudentResults: (userId) => api.get(`/teacher/student/${userId}/results`),
  getStudentTestAnswers: (userId, testId) => api.get(`/teacher/student/${userId}/test/${testId}`),
  updateRecommendation: (resultId, recommendation) => 
    api.put(`/teacher/test-result/${resultId}/recommendation`, recommendation, {
      headers: { 'Content-Type': 'text/plain' }
    }),
};

// Student API
export const studentAPI = {
  getAvailableTests: () => api.get('/student/available-tests/'),
  getTestQuestions: (testId) => api.get(`/student/test/${testId}/questions`),
  submitTest: (submission) => api.post('/student/submit-test/', submission),
  getTestResult: (testId) => api.get(`/student/results/${testId}`),
  getDetailedResult: (testId) => api.get(`/student/results/${testId}/detailed`),
  getMyResults: () => api.get('/student/my-results/'),
};

// Upload API
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteImage: (filename) => api.delete(`/upload/image/${filename}`),
};

export default api;