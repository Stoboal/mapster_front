import React, {useState, useEffect, useMemo} from 'react';
import {locationService} from "../services/api";
import '../styles/leaderboard.css';

function Leaderboard({user}) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [filter, setFilter] = useState('score');
    const [sortOrder, setSortOrder] = useState('desc')

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

    const sortedLeaderboard = useMemo(() => {
        if (!Array.isArray(leaderboard)) return [];

        const sorted = [...leaderboard].sort((a, b) => {
            let compareA, compareB;
            switch (filter) {
                case 'games':
                    compareA = a.games || 0;
                    compareB = b.games || 0;
                    break;
                case 'average':
                    compareA = a.score_for_game || 0;
                    compareB = b.score_for_game || 0;
                    break;
                case 'score':
                default:
                    compareA = a.score || 0;
                    compareB = b.score || 0;
                    break;
            }
            return compareB - compareA;
        });
        return sorted;

    }, [leaderboard, filter, sortOrder]);

    if (loading) return (
        <div className="leaderboard-loading">
            <div className="loader-spinner"></div>
            <p>Loading Leaderboard...</p>
        </div>
    );
    if (error) return <div className="leaderboard-error">{error}</div>;

    const currentUsername = user ? user.username : null;

    return (
        <div className="leaderboard-container">
            <div className="leaderboard-header">
                <h2 className="leaderboard-title">🏆Leaderboard</h2>
                <div className="leaderboard-controls">
                    <div className="leaderboard-filters">
                        <span className="filter-label">Sort:</span>
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
                    {lastUpdated && (
                        <p className="last-updated">
                            Updated: {new Date(lastUpdated).toLocaleString('en-EN')}
                        </p>
                    )}
                </div>
            </div>

            <div className="leaderboard-list">
                {sortedLeaderboard.length > 0 ? (
                    sortedLeaderboard.map((player, index) => {
                        // Проверяем, является ли эта строка строкой текущего пользователя
                        const isCurrentUser = currentUsername && player.username === currentUsername;

                        return (
                            <div
                                key={player.username} // Или player.id
                                className={
                                    `leaderboard-row ${index < 3 ? `rank-${index + 1}` : ''}` +
                                    // Добавляем класс 'is-current-user' если условие истинно
                                    `${isCurrentUser ? ' is-current-user' : ''}`
                                }
                            >
                                <div className="leaderboard-rank">{index + 1}</div>
                                <div className="leaderboard-player">{player.username}</div>
                                <div className="leaderboard-stat score">{player.score || 0}</div>
                                <div className="leaderboard-stat games">{player.games || 0}</div>
                                <div className="leaderboard-stat average">
                                    {(player.score_for_game || 0).toFixed(1)}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div style={{
                        padding: 'var(--spacing-lg)',
                        textAlign: 'center',
                        color: 'var(--color-text-secondary)'
                    }}>
                        Leaderboard is empty.
                    </div>
                )}
            </div>
        </div>
    );
}

export default Leaderboard;
