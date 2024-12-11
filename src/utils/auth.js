// src/utils/auth.js
export const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (!token) return true;

    try {
        // Decode the JWT token
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Check if token has expired
        // Convert expiration time to milliseconds and add a small buffer (e.g., 5 seconds)
        const expirationTime = payload.ExpiresAt * 1000;
        return Date.now() >= expirationTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true;
    }
};