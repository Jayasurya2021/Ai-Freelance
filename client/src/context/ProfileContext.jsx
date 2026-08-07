import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    // Initialize from localStorage or default to 'freelance'
    const [profileMode, setProfileMode] = useState(() => {
        const savedMode = localStorage.getItem('profileMode');
        return savedMode === 'job' ? 'job' : 'freelance';
    });

    // Update localStorage when mode changes
    useEffect(() => {
        localStorage.setItem('profileMode', profileMode);
    }, [profileMode]);
    
    // Globally intercept all Axios requests to append the mode query param
    // This ensures the backend always knows which mode we are requesting for
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use((config) => {
            if (!config.params) config.params = {};
            config.params.mode = profileMode;
            return config;
        });

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, [profileMode]);

    return (
        <ProfileContext.Provider value={{ profileMode, setProfileMode }}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfileMode = () => useContext(ProfileContext);
