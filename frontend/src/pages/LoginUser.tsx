import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Login.css";

const LoginUser: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    useEffect(() => {
        document.title = 'User Login';
    }, []);

    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/authRoutes/login", formData);
            const { token, role, email, id } = response.data;
            
            // Check if user is trying to login as admin
            if (role === 'admin') {
                setError("Please use the admin login page");
                return;
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('email', email);
            localStorage.setItem('userId', id);
            navigate('/user');
        } catch (err: any) {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1>Login as a User</h1>
                <form onSubmit={handleLogin}>
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
                    {error && <p className="error-message">{error}</p>}
                    <button className="login-button" type="submit">
                        Login
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

export default LoginUser;
