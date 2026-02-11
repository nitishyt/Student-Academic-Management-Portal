import { authAPI } from './api';

export const auth = {
  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  getUserType: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role;
  },

  getCurrentUserId: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.studentId || user.id;
  },

  getCurrentStudentId: () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.studentId;
  },

  login: async (userType, username, password) => {
    try {
      const { data } = await authAPI.login(username, password, userType);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('userType', data.user.role);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  }
};
