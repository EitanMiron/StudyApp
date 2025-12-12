import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Auth.css";

const RegisterUser: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    role: 'user',
    email: '',
  });

  useEffect(() => {
    document.title = 'User Registration';
  }, []);

  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/authRoutes/register", formData);
      
      // Store the token and user data
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('email', user.email);
      localStorage.setItem('userId', user.id);
      
      navigate('/user');
    } catch (err: any) {
      console.error('Registration error:', err.response?.data || err);
      setError("Failed to register as 'User'. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Register as a User</h1>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Role:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-group input"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button className="register-button" type="submit">
            Register
          </button>
        </form>
      </div>
      <div className="back-button-container">
        <button className="button-49" role="button" onClick={() => navigate('/')}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default RegisterUser;
