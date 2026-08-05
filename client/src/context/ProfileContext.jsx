import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
    const { user, updateUser } = useAuth();
    
    // Default to freelance, check local storage or user object for persistence
    const [profileMode, setProfileModeState] = useState(() => {
        return localStorage.getItem('leadflow_profile_mode') || 'freelance';
    });

    // When user loads from backend, sync the mode if it differs
    useEffect(() => {
        if (user && user.activeProfileMode && user.activeProfileMode !== profileMode) {
            setProfileModeState(user.activeProfileMode);
            localStorage.setItem('leadflow_profile_mode', user.activeProfileMode);
        }
    }, [user]);

    const setProfileMode = async (mode) => {
        setProfileModeState(mode);
        localStorage.setItem('leadflow_profile_mode', mode);
        
        // Update local user state if available
        if (user) {
            updateUser({ activeProfileMode: mode });
            
            // Persist to backend
            try {
                const token = localStorage.getItem('token');
                await axios.put(`${import.meta.env.VITE_API_URL}/api/profile`, 
                    { activeProfileMode: mode },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } catch (err) {
                console.error("Failed to sync profile mode to backend", err);
            }
        }
    };

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
