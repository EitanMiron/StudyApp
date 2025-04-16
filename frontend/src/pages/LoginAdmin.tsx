import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/Login.css"
import Button from '../components/Button';

const LoginAdmin: React.FC = () => {
    const [Email, setEmail] = useState('');
    const [Password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Admin Login Page";
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/authRoutes/login", {
              email: Email,
              password: Password,
            });
            const { token, role, email: returnedEmail } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('email', returnedEmail);

            if (role === 'admin') {
                navigate('/admin');
            } else if (role === 'student') {
                navigate('/')
            } else {
              setError("Unable to track valid login credentials for user role.");
            }
        }catch(err) {
            setError("Unable to Login - Invalid Email or Password.");
        }
    }

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form className="login-form" onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={Email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input
                        type="password"
                        value={Password}
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
}

export default LoginAdmin;