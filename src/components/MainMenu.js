import React from 'react';
import { MdPlayArrow, MdPerson, MdLeaderboard } from 'react-icons/md';
import '../styles/mainMenu.css';

function MainMenu({ onStartGame, onShowProfile, onShowLeaderboard }) {
    return (
        <div className="main-menu">
            <div className="main-menu-content">
                <h1 className="main-menu-title">Mapster</h1>
                <p className="main-menu-subtitle">Guess where you are!</p>

                <div className="main-menu-actions">
                    <button
                        className="btn btn-primary btn-block btn-lg main-menu-button play-button"
                        onClick={onStartGame}
                    >
                        <MdPlayArrow size="1.5em" />
                        Play
                    </button>

                    <button
                        className="btn btn-secondary btn-block main-menu-button profile-button"
                        onClick={onShowProfile}
                    >
                        <MdPerson size="1.2em"/>
                        Profile
                    </button>

                    <button
                        className="btn btn-secondary btn-block main-menu-button leaderboard-button"
                        onClick={onShowLeaderboard}
                    >
                        <MdLeaderboard size="1.2em"/>
                        Leaderboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MainMenu;