import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import reportWebVitals from './reportWebVitals.js';
import {authService, setAuthToken} from "./services/api";

const TelegramAppInitializer = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const initApp = async () => {
            try {
                if (!window.Telegram || !window.Telegram.WebApp) {
                    throw new Error('This app requires Telegram WebApp');
                }

                const tg = window.Telegram.WebApp;

                tg.ready();

                const initData = tg.initData;

                if (!initData) {
                    throw new Error('Error during getting init data from Telegram WebApp');
                }
                console.log(window.Telegram.WebApp.initData)
                const queryString = new URLSearchParams(initData).toString();
                const authResult = await authService.telegramAuth({ initData: queryString });

                setAuthToken(authResult.token);
                setUserData(authResult.user);
                setIsLoading(false);

            } catch (err) {
                console.error('Initialization error:', err);
                setError(err.message || 'Initialization error');
                setIsLoading(false);
            }
        };

        initApp();
    }, []);

    if (isLoading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return <App user={userData}/>;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <TelegramAppInitializer/>
    </React.StrictMode>
);

reportWebVitals();
