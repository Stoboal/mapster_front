import React, { useState, useEffect } from 'react';
import { locationService } from '../services/api';
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

    return (
        <div className="profile-page">
            <div className="profile-header">
                <div className="username">{profile.username}</div>
                <div className="profile-join-date">
                    Playing since {new Date(profile.date_joined).toLocaleDateString('en-EN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </div>
            </div>

            <div className="profile-cards-container">
                <div className="profile-card">
                    <div className="profile-card-header">
                        <div className="profile-card-icon">📊</div>
                        <div className="profile-card-title">General statistics</div>
                    </div>

                    <div className="stat-group">
                        <div className="stat-item">
                            <div className="stat-label">Games played</div>
                            <div className="stat-value highlight-stat">{profile.games}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Total score</div>
                            <div className="stat-value highlight-stat">{profile.total_score}</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Average score per game</div>
                            <div className="stat-value">{avgScore}</div>
                        </div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="profile-card-header">
                        <div className="profile-card-icon">🎯</div>
                        <div className="profile-card-title">Accuracy</div>
                    </div>

                    <div className="stat-group">
                        <div className="stat-item">
                            <div className="stat-label">Average error</div>
                            <div className="stat-value highlight-stat">{profile.avg_error?.toFixed(1)} km</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Total errors</div>
                            <div className="stat-value">{profile.total_errors?.toFixed(0)} km</div>
                        </div>
                    </div>

                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{width: `${100 - errorPercentage}%`}}
                            title="Less error - better accuracy"
                        ></div>
                    </div>
                </div>

                <div className="profile-card">
                    <div className="profile-card-header">
                        <div className="profile-card-icon">⏱️</div>
                        <div className="profile-card-title">Time</div>
                    </div>

                    <div className="stat-group">
                        <div className="stat-item">
                            <div className="stat-label">Average time per game</div>
                            <div className="stat-value highlight-stat">{profile.avg_time?.toFixed(1)} s</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-label">Total guessing time</div>
                            <div className="stat-value">
                                {Math.floor(profile.total_time / 60)}:{(profile.total_time % 60).toFixed(0).padStart(2, '0')}
                            </div>
                        </div>
                    </div>

                    <div className="progress-bar-container">
                        <div
                            className="progress-bar"
                            style={{width: `${100 - timePercentage}%`}}
                            title="Less time - better"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;