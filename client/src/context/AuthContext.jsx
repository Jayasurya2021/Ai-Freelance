import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
    const { token, profile } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return profile;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, { name, email, password });
    const { token, profile } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return profile;
  };

  const googleLogin = async (credential) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, { credential });
    const { token, profile } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return profile;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const switchProfile = async (mode) => {
    try {
      const token = localStorage.getItem('token');
      // Update backend
      await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, 
        { activeProfileMode: mode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Update local state
      updateUser({ activeProfileMode: mode });
    } catch (error) {
      console.error("Failed to switch profile", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, googleLogin, logout, updateUser, switchProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
