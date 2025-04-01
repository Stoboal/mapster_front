import React from 'react';
import '../styles/mainMenu.css';

function MainMenu({onStartGame, onShowProfile, onShowLeaderboard}) {
    return (
        <div className="main-menu">
            <div className="main-menu-content">
                <h1 className="main-menu-title">Mapster</h1>
                <p className="main-menu-subtitle">Guess where you are!</p>

                <button
                    className="main-menu-button play-button"
                    onClick={onStartGame}
                >
                    Play
                </button>

                <button
                    className="main-menu-button profile-button"
                    onClick={onShowProfile}
                >
                    Profile
                </button>

                <button
                    className="main-menu-button leaderboard-button"
                    onClick={onShowLeaderboard}
                >
                    Leaderboard
                </button>
            </div>
        </div>
    );
}

export default MainMenu;