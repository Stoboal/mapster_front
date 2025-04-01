import React, {useState, useMemo} from 'react';
import './App.css';
import MapGuess from './components/MapGuess';
import StreetView from './components/StreetView';
import MainMenu from './components/MainMenu';
import ResultMap from './components/ResultMap';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import {locationService} from './services/api';


function App({ user }) {
    const [coordinates, setCoordinates] = useState(null);
    const [locationId, setLocationId] = useState(null);
    const [gameActive, setGameActive] = useState(false);
    const [gameStats, setGameStats] = useState(null);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const [showMenu, setShowMenu] = useState(true);
    const [guessedLocation, setGuessedLocation] = useState(null);
    const [currentView, setCurrentView] = useState('menu');
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);


    const center = useMemo(() => {
        return coordinates ? {lat: coordinates.lat, lng: coordinates.lng} : null;
    }, [coordinates]);


    const toggleMapSize = () => {
        setIsMapExpanded(prev => !prev);
    };

    const handleCoordinatesReceived = ({lat, lng, location_id}) => {
        setCoordinates({lat, lng});
        setLocationId(location_id);
        setGameActive(true);
        setGameStats(null);
        setGuessedLocation(null);
    };

    const handleSubmitGuess = async ({lat, lng, duration, location_id}) => {
        try {
            console.log("Sending guess:", {lat, lng, duration, location_id});
            setGuessedLocation({lat, lng});
            const data = await locationService.submitGuess({
                guessed_lat: lat,
                guessed_lng: lng,
                duration,
                location_id,
            });

            console.log("Server response:", data);

            let distance = 'Not available';
            if (data.distance_error) {
                const distanceMatch = data.distance_error.match(/(\d+\.?\d*)/);
                if (distanceMatch) {
                    distance = parseFloat(distanceMatch[0]).toFixed(3);
                }
            }

            const durationValue = data.duration ?
                parseInt(data.duration.replace(' seconds', '')) :
                duration;

            setGameStats({
                duration: durationValue,
                distance: distance,
                score: data.score || 0,
                averageError: data.appr_error || 0,
                averageTime: data.appr_time || 0
            });

            setGameActive(false);
        } catch (error) {
            console.error('Error during sending guess...', error);
            alert('Error during sending guess: ' + (error.message || 'Unknown error') +
                '\nPress OK');
        }
    };

    const startNewGame = async () => {
        setShowMenu(false);
        setCurrentView('game');

        try {
            const data = await locationService.getRandomLocation();

            if (data.lat && data.lng) {
                handleCoordinatesReceived({
                    lat: data.lat,
                    lng: data.lng,
                    location_id: data.id
                });
            }
        } catch (error) {
            console.error('Error during collecting location data...', error);
            alert('Error during collecting location data: ' + (error.message || 'Unknown error') +
                '\nPress OK');
            returnToMainMenu();
        }
    };

    const showProfile = () => {
        setShowProfileModal(true);
        setShowLeaderboardModal(false);
    };

    const showLeaderboard = () => {
        setShowLeaderboardModal(true);
        setShowProfileModal(false);
    };

    const closeModals = () => {
        setShowProfileModal(false);
        setShowLeaderboardModal(false);
    };

    const returnToMainMenu = () => {
        setShowMenu(true);
        setCurrentView('menu');
        setGameActive(false);
        setGameStats(null);
        setCoordinates(null);
        setLocationId(null);
        setGuessedLocation(null);
        closeModals();
    };

    const modalStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    };

    const modalContentStyle = {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '80%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
    };

    const closeButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer'
    };


    const renderContent = () => {
        if (showMenu) {
            return (
                <MainMenu
                    onStartGame={startNewGame}
                    onShowProfile={showProfile}
                    onShowLeaderboard={showLeaderboard}
                />
            );
        }

        switch (currentView) {
            case 'profile':
                return (
                    <>
                        <header className="app-header">
                            <h1 className="app-title">Mapster</h1>
                            <div className="app-controls">
                                <button className="btn btn-primary" onClick={returnToMainMenu}>
                                    Main menu
                                </button>
                            </div>
                        </header>
                        <div className="app-content">
                            <Profile/>
                        </div>
                    </>
                );
            case 'leaderboard':
                return (
                    <>
                        <header className="app-header">
                            <h1 className="app-title">Mapster</h1>
                            <div className="app-controls">
                                <button className="btn btn-primary" onClick={returnToMainMenu}>
                                    Main menu
                                </button>
                            </div>
                        </header>
                        <div className="app-content">
                            <Leaderboard/>
                        </div>
                    </>
                );
            case 'game':
                return (
                    <div className="game-container">
                        {coordinates && (
                            <StreetView
                                coordinates={coordinates}
                                locationId={locationId}
                            />
                        )}

                        {gameActive ? (
                            <MapGuess
                                center={center}
                                locationId={locationId}
                                onSubmitGuess={handleSubmitGuess}
                                isExpanded={isMapExpanded}
                                toggleMapSize={toggleMapSize}
                            />
                        ) : (
                            gameStats && guessedLocation && (
                                <div className="result-overlay">
                                    <ResultMap
                                        actualLocation={coordinates}
                                        guessedLocation={guessedLocation}
                                        gameStats={gameStats}
                                    />
                                    <div className="game-stats">
                                        <h3>Results</h3>
                                        <p>Distance: {gameStats.distance} km</p>
                                        <p>Time: {gameStats.duration} s</p>
                                        <button
                                            className="btn btn-primary"
                                            onClick={startNewGame}
                                        >
                                            New game
                                        </button>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={returnToMainMenu}
                                        >
                                            Main menu
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                );
            default:
                return <MainMenu onStartGame={startNewGame}/>;
        }
    };

    return (
        <div className="App">
            {renderContent()}
            {showProfileModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <button style={closeButtonStyle} onClick={closeModals}>×</button>
                        <header className="modal-header">
                        </header>
                        <div className="app-content">
                            <Profile/>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={closeModals}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showLeaderboardModal && (
                <div style={modalStyle}>
                    <div style={modalContentStyle}>
                        <button style={closeButtonStyle} onClick={closeModals}>×</button>
                        <div className="app-content">
                            <Leaderboard/>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-primary" onClick={closeModals}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
