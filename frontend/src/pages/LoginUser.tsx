import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Login.css";
import Button from '../components/Button';

const LoginUser: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "User Login Page";
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/authRoutes/login", {
                email,
                password,
            });

            const { token, role, email: returnedEmail } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('email', returnedEmail);

            if (role === 'student') {
                navigate('/user');
            } else if (role === 'admin') {
                navigate('/admin');
            } else {
                setError("User role not detected.");
            }
        } catch (err) {
            setError("Unable to Login - Invalid Email or Password.");
        }
    };

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <Button
                    border="none"
                    color="#3498db"
                    height="30px"
                    onClick={() => {}} // Empty handler since form submission is handled by onSubmit
                    radius="10px"
                    width="30%"
                    style={{
                        marginTop: "1rem",
                        fontSize: "1.1rem"
                    }}
                    type="submit"
                >
                    Login
                </Button>
            </form>
        </div>
    );
};

export default LoginUser;