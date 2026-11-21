
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaBookOpen, FaEye, FaEyeSlash } from 'react-icons/fa';
import api from '../../services/api';
import './Login.css';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('accounts/login/', {
        username,
        password,
      });

      const userData = response.data;

   const loggedInUser = {
  user_id: userData.user_id,
  username: userData.username,
  role: userData.role,
};

login(loggedInUser, userData.token);

if (userData.role === 'learner') {
  navigate('/learner/dashboard');
} else if (userData.role === 'mentor') {
  navigate('/mentor/dashboard');
}
    } catch (err) {
      if (err.response?.data?.non_field_errors) {
        setError(err.response.data.non_field_errors[0]);
      } else {
        setError('Login failed. Please check your username and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <div className="brand-icon">
            <FaBookOpen />
          </div>
          <h2>StudyTracker</h2>
          <p>Plan your learning. Track your progress.</p>
        </div>

        <div className="login-card">
          <h3>Welcome Back!</h3>
          <p className="login-subtitle">
            Sign in to continue your learning journey.
          </p>

          {error && (
            <div className="alert alert-danger">{error}</div>
          )}

          {success && (
            <div className="alert alert-success">{success}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control login-input"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn login-button w-100"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="register-text">
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>

        <p className="login-footer">
          © 2026 StudyTracker. Keep learning, keep growing.
        </p>
      </div>
    </div>
  );
}

export default Login;
