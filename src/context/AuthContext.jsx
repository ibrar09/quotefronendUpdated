import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored token on load
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        // --- BYPASS LOGIN (Backend not deployed) ---
        console.warn("LOGIN BYPASS ENABLED: Skipping backend authentication.");

        const mockUser = {
            id: 999,
            name: 'Demo Administrator',
            email: email,
            role: 'ADMIN',
            permissions: ['ALL_ACCESS']
        };

        const mockToken = 'demo-bypass-token-' + Date.now();

        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));

        axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`;
        setUser(mockUser);

        return { success: true };

        /* 
        // ORIGINAL CODE (Restored when backend is live)
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
            if (res.data.success) {
                const { token, user } = res.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setUser(user);
                return { success: true };
            }
        } catch (err) {
            console.error(err);
            return {
                success: false,
                message: err.response?.data?.message || 'Login failed'
            };
        }
        */
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const hasPermission = (requiredPerm) => {
        if (!user) return false;
        if (user.role === 'ADMIN') return true;
        if (user.permissions && user.permissions.includes('ALL_ACCESS')) return true;
        return user.permissions && user.permissions.includes(requiredPerm);
    };

    const updateUserContext = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        login,
        logout,
        hasPermission,
        updateUserContext, // [NEW]
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
