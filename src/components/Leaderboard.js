import React, {useState, useEffect} from 'react';
import {locationService} from "../services/api";
import '../styles/leaderboard.css';

function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [filter, setFilter] = useState('score');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await locationService.getRating();

                if (response && response.data) {
                    setLeaderboard(response.data);
                    setLastUpdated(response.updated_at);
                } else {
                    setLeaderboard([]);
                }
                setLoading(false);
            } catch (err) {
                setError('Error during loading leaderboard data');
                setLeaderboard([]);
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    const sortedLeaderboard = React.useMemo(() => {
        if (!Array.isArray(leaderboard)) return [];

        return [...leaderboard].sort((a, b) => {
            if (filter === 'score') return b.score - a.score;
            if (filter === 'games') return b.games - a.games;
            if (filter === 'average') return b.score_for_game - a.score_for_game;
            return 0;
        });
    }, [leaderboard, filter]);

    if (loading) return (
        <div className="leaderboard-loading">
            <div className="loader-spinner"></div>
            <p>Loading...</p>
        </div>
    );

    if (error) return <div className="leaderboard-error">{error}</div>;

    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-title">🏆 Leaderboard</h2>

            {lastUpdated && (
                <p className="last-updated">
                    Last update: {new Date(lastUpdated).toLocaleString('ru-RU')}
                </p>
            )}

            <div className="leaderboard-filters">
                <span>Sorting: </span>
                <button
                    className={`filter-btn ${filter === 'score' ? 'active' : ''}`}
                    onClick={() => setFilter('score')}
                >
                    Score
                </button>
                <button
                    className={`filter-btn ${filter === 'games' ? 'active' : ''}`}
                    onClick={() => setFilter('games')}
                >
                    Games
                </button>
                <button
                    className={`filter-btn ${filter === 'average' ? 'active' : ''}`}
                    onClick={() => setFilter('average')}
                >
                    Average
                </button>
            </div>

            <div className="leaderboard-wrapper">
                {sortedLeaderboard.map((player, index) => (
                    <div
                        key={`${player.username}-${index}`}
                        className={`leaderboard-card ${index < 3 ? `top-player rank-${index + 1}` : ''}`}
                    >
                        <div className="rank-badge">{index + 1}</div>
                        <div className="player-info">
                            <h3 className="player-name">{player.username}</h3>
                            <div className="player-stats">
                                <div className="stat">
                                    <span className="stat-value">{player.score}</span>
                                    <span className="stat-label">points</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-value">{player.games}</span>
                                    <span className="stat-label">Games</span>
                                </div>
                                <div className="stat">
                                            <span
                                                className="stat-value">{player.score_for_game ? player.score_for_game.toFixed(1) : '0.0'}</span>
                                    <span className="stat-label">Average score</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Leaderboard;