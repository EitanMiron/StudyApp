import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Register.css";
import InputField from '../components/InputField';
import Button from '../components/Button';

const RegisterAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    role: 'admin',
    email: '',
  });

  useEffect(() => {
    document.title = 'Admin Registration';
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
      await axios.post("/api/authRoutes/register", formData);
      navigate('/');
    } catch (err) {
      setError("Failed to register as 'Admin'. Please try again.");
    }
  };

  return (
    <div className="register-container">
      <h1>Register as an Admin</h1>
      <form className="register-form" onSubmit={handleRegister}>
        <InputField
          label="Name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <InputField
          label="Role"
          name="role"
          type="select"
          value={formData.role}
          onChange={handleChange}
          options={['student', 'admin']}
        />
        {error && <p className="error-message">{error}</p>}
        <Button
          border="none"
          color="#3498db"
          height="50px"
          onClick={() => {}} // Empty handler since form submission is handled by onSubmit
          radius="6px"
          width="100%"
          style={{
            marginTop: "1rem",
            fontSize: "1.1rem"
          }}
          type="submit"
        >
          Register
        </Button>
      </form>
    </div>
  );
};

export default RegisterAdmin;
