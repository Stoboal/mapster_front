import React, {useState, useEffect} from 'react';
import {locationService} from '../services/api';
import {MdBarChart, MdMyLocation, MdTimer, MdPerson} from 'react-icons/md';
import '../styles/profile.css';

function Profile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await locationService.userProfile();
                setProfile(data);
                setLoading(false);
            } catch (err) {
                setError('Error during loading profile data');
                setLoading(false);
                console.error(err);
            }
        };

        fetchProfile();
    }, []);

    if (loading) return (
        <div className="loader-container">
            <div className="loader"></div>
        </div>
    );

    if (error) return <div className="error">{error}</div>;
    if (!profile) return <div className="error">Oops...can't find your profile</div>;

    const avgScore = profile.total_score && profile.games
        ? (profile.total_score / profile.games).toFixed(1)
        : '0.0';

    const MAX_ERROR_DISTANCE = 2000;
    const errorPercentage = Math.min(100, (profile.avg_error / MAX_ERROR_DISTANCE * 100).toFixed(0));
    const timePercentage = Math.min(100, (profile.avg_time / 60 * 100).toFixed(0));

    const initial = profile.username ? profile.username.charAt(0).toUpperCase() : <MdPerson/>;

    return (
        <div className="profile-page">
            <div className="profile-card-main"> {/* Основная карточка */}

                {/* Верхняя секция */}
                <div className="profile-info-header">
                    <div className="profile-avatar">
                        {initial} {/* Инициалы или иконка */}
                    </div>
                    <div className="profile-user-details">
                        <div className="profile-username">{profile.username}</div>
                        <div className="profile-join-date">
                            Playing since {new Date(profile.date_joined).toLocaleDateString('en-EN', { // Используй 'ru-RU' если нужно
                            year: 'numeric', month: 'long', day: 'numeric'
                        })}
                        </div>
                    </div>
                </div>

                {/* Секция Общей Статистики */}
                <div className="profile-stats-section">
                    <h3 className="profile-stats-title">
                        <MdBarChart className="icon"/> General Statistics
                    </h3>
                    <div className="profile-stats-grid">
                        <div className="stat-block">
                            <span className="stat-label">Games Played</span>
                            <span className="stat-value">{profile.games}</span>
                        </div>
                        <div className="stat-block">
                            <span className="stat-label">Average Score</span>
                            <span className="stat-value">{avgScore}</span>
                        </div>
                        <div className="stat-block">
                            <span className="stat-label">Total Score</span>
                            <span className="stat-value">{profile.total_score}</span>
                        </div>
                        {/* Добавь другие статы, если нужно */}
                    </div>
                </div>

                {/* Секция Точности */}
                <div className="profile-stats-section">
                    <h3 className="profile-stats-title">
                        <MdMyLocation className="icon"/> Accuracy
                    </h3>
                    <div className="profile-stats-grid">
                        <div className="stat-block">
                            <span className="stat-label">Average Error</span>
                            <span className="stat-value">
                                {profile.avg_error?.toFixed(1)}
                                <span className="unit">km</span>
                            </span>
                            {/* Возвращенный прогресс-бар */}
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{width: `${100 - Math.min(100, errorPercentage)}%`}} // Инвертируем для "accuracy"
                                ></div>
                            </div>
                            <div className="progress-bar-label">Lower error = better</div>
                        </div>
                        <div className="stat-block">
                            <span className="stat-label">Total Error Distance</span>
                            <span className="stat-value">
                                {profile.total_errors?.toFixed(0)}
                                <span className="unit">km</span>
                             </span>
                        </div>
                        {/* Добавь другие статы, если нужно */}
                    </div>
                </div>

                {/* Секция Времени */}
                <div className="profile-stats-section">
                    <h3 className="profile-stats-title">
                        <MdTimer className="icon"/> Speed
                    </h3>
                    <div className="profile-stats-grid">
                        <div className="stat-block">
                            <span className="stat-label">Average Time</span>
                            <span className="stat-value">
                                {profile.avg_time?.toFixed(1)}
                                <span className="unit">s</span>
                            </span>
                            {/* Возвращенный прогресс-бар */}
                            <div className="progress-bar-container">
                                <div
                                    className="progress-bar"
                                    style={{width: `${100 - Math.min(100, timePercentage)}%`}} // Инвертируем для "speed"
                                ></div>
                            </div>
                            <div className="progress-bar-label">Lower time = better</div>
                        </div>
                        <div className="stat-block">
                            <span className="stat-label">Total Guessing Time</span>
                            <span className="stat-value">
                                 {Math.floor(profile.total_time / 60)}:{(profile.total_time % 60).toFixed(0).padStart(2, '0')}
                                <span className="unit">m:s</span>
                             </span>
                        </div>
                        {/* Добавь другие статы, если нужно */}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Profile;