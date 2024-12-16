import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAxios } from '../utils/axiosConfig';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const getEndpoint = (path) => {
        const prodUrl = 'https://login.swipetofit.com';
        const devUrl = 'http://localhost:8001';
        
        // Try environment variable first
        if (process.env.REACT_APP_API_URL) {
            return `${process.env.REACT_APP_API_URL}/${path}`;
        }

        // Try production URL
        try {
            return `${window.location.hostname.includes('localhost') ? devUrl : prodUrl}/${path}`;
        } catch (error) {
            console.warn('Error determining environment:', error);
            return `${prodUrl}/${path}`; // Fallback to production
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        const endpoint = getEndpoint(isLogin ? 'login' : 'register');
        const payload = isLogin
            ? { email: formData.email, password: formData.password }
            : { 
                firstname: formData.firstname, 
                lastname: formData.lastname, 
                email: formData.email, 
                password: formData.password 
              };

        setIsLoading(true);
        try {
            const response = await loginAxios.post(endpoint, payload);
            console.log('Auth response:', response.data);
            
            if (isLogin && response.data.token) {
                try {
                    const token = response.data.token;
                    
                    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                    const userId = tokenPayload.userId;

                    if (!userId) {
                        console.error('User ID not found in token payload:', tokenPayload);
                        setError("Login successful but user ID not found. Please try again.");
                        return;
                    }

                    await onLogin(token, userId);
                    navigate('/home');
                } catch (loginError) {
                    console.error("Login error:", loginError);
                    setError("Login successful but authentication failed. Please try again.");
                }
            } else if (!isLogin && response.data.message) {
                setError(response.data.message || "Account created successfully. Please log in.");
                setIsLogin(true);
            }
        } catch (error) {
            console.error("Request error:", error);
            setError(error.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="login-container">
                <div className="login-form-container">
                    <h2>{isLogin ? 'Login to Your Account' : 'Sign Up for Workout App'}</h2>
                    {error && <div className="error-message">{error}</div>}
                    <form onSubmit={handleSubmit} className="login-form">
                        {!isLogin && (
                            <>
                                <input
                                    type="text"
                                    name="firstname"
                                    placeholder="First Name"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="text"
                                    name="lastname"
                                    placeholder="Last Name"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        )}
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        {!isLogin && (
                            <input
                                type="password"
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                            />
                        )}
                        <button
                            type="submit"
                            className={isLogin ? 'login-button' : 'signup-button'}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : (isLogin ? 'Login' : 'Sign Up')}
                        </button>
                    </form>
                    {isLogin && <a href="/forgot-password" className="forgot-password">Forgot your password?</a>}
                </div>
                <div className="side-panel">
                    <h3>Don't Have an Account?</h3>
                    <p>Create a <strong>FREE</strong> account and enjoy the following benefits:</p>
                    <ul>
                        <li>Access to workout plans</li>
                        <li>Personalized recommendations</li>
                        <li>Progress tracking</li>
                        <li>Exclusive content</li>
                    </ul>
                    <button className="create-account-button" onClick={() => {
                        setIsLogin(false);
                        setError('');
                    }}>
                        Create an Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;