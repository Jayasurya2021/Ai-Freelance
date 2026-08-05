import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    // Default to freelance, check local storage for persistence
    const [profileMode, setProfileMode] = useState(() => {
        return localStorage.getItem('leadflow_profile_mode') || 'freelance';
    });

    // Sync state changes to local storage and update Axios defaults
    useEffect(() => {
        localStorage.setItem('leadflow_profile_mode', profileMode);
        
        // Globally intercept all Axios requests to append the mode query param
        // This ensures the backend always knows which mode we are requesting for
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
