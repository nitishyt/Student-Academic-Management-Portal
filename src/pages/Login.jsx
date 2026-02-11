import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/auth';

const Login = () => {
  const [userType, setUserType] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (auth.isAuthenticated()) {
      const currentUserType = auth.getUserType();
      const routes = {
        admin: '/admin',
        student: '/student',
        faculty: '/faculty',
        parent: '/parent'
      };
      navigate(routes[currentUserType] || '/login');
    }
  }, [navigate]);

  // Handle user type change
  const handleUserTypeChange = (e) => {
    setUserType(e.target.value);
    setUsername('');
    setPassword('');
    setError('');
  };

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    const result = await auth.login(userType, username, password);
    
    if (result.success) {
      const routes = {
        admin: '/admin',
        student: '/student',
        faculty: '/faculty',
        parent: '/parent'
      };
      navigate(routes[userType] || '/login');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Welcome to Student Portal Login</h2>
        
        <select value={userType} onChange={handleUserTypeChange}>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="parent">Parent</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={
            userType === 'admin' ? 'Admin Username' :
            userType === 'faculty' ? 'Faculty Username' :
            userType === 'parent' ? 'Parent Username' :
            'Student Username'
          }
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={
            userType === 'admin' ? 'Admin Password' :
            userType === 'faculty' ? 'Faculty Password' :
            userType === 'parent' ? 'Parent Password' :
            'Student Password'
          }
        />

        <button type="submit">Login</button>

        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default Login;