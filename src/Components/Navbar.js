import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';
const Navbar = ({ onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };
    const handleLogout = () => {
        onLogout();
        navigate('/');
    };
    return (
        <nav className="navbar">
            <Link to="/" className="navbar-logo">
                Workout App
            </Link>
            <div className={`navbar-links ${isOpen ? 'open' : ''}`}>
                <Link to="/" className="navbar-link">Home</Link>
                <div className="navbar-link" onClick={handleLogout}>Logout</div>
            </div>
            <div className="navbar-toggle" onClick={toggleMenu}>
                <span className="bar"></span>
                <span className="bar"></span>
                <span className="bar"></span>
            </div>
        </nav>
    );
};
export default Navbar;