import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    // Dummy provider to prevent breaking imports that used profileMode
    // Everything is now strictly 'freelance'
    
    // Globally intercept all Axios requests to append the mode query param
    // This ensures the backend always knows which mode we are requesting for
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use((config) => {
            if (!config.params) config.params = {};
            config.params.mode = 'freelance';
            return config;
        });

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    return (
        <ProfileContext.Provider value={{ profileMode: 'freelance', setProfileMode: () => {} }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfileMode = () => useContext(ProfileContext);
