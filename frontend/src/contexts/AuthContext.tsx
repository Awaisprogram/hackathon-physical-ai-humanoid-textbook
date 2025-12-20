import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const {
    siteConfig: {customFields},
  } = useDocusaurusContext();

  // Constants
  const API_URL = 'https://textbook-backend.vercel.app';


  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        await fetchUser(token);
      } else {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const fetchUser = async (accessToken) => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setUser(response.data);
      console.log("users:", response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await refreshAccessToken();
      } else {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) throw new Error("No refresh token");

      const response = await axios.post(`${API_URL}/refresh`, {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: new_refresh } = response.data;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', new_refresh);
      
      const userRes = await axios.get(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      setUser(userRes.data);
    } catch (err) {
      logout();
    }
  };

  const register = async (userData) => {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  };

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/token`, formData);
    const { access_token, refresh_token } = response.data;
    
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    
    await fetchUser(access_token);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading ,setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);