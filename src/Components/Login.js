// src/Components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Login.css';

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isLogin && formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const url = isLogin ? 'http://localhost:8001/login' : 'http://localhost:8001/register';
        const payload = isLogin 
            ? { email: formData.email, password: formData.password }
            : { firstname: formData.firstname, lastname: formData.lastname, email: formData.email, password: formData.password };

        try {
            const response = await axios.post(url, payload);
            const { token } = response.data;

            if (isLogin && token) {
                localStorage.setItem('token', token);
                onLogin(token);
            } else if (!isLogin) {
                alert(response.data.message || "Account created successfully. Please log in.");
                setIsLogin(true);
            }
        } catch (error) {
            alert(error.response?.data?.message || "An error occurred. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <h2>{isLogin ? 'Login to Workout App' : 'Sign Up for Workout App'}</h2>
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
                <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
            </form>
            <button className="toggle-button" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
        </div>
    );
};

export default Login;
