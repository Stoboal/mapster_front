import React, { useState, useEffect, memo } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMapsApi } from '../services/mapsLoader';
import { useCountdownTimer } from './timer';
import { GAME_CONFIG } from '../config/config';
import { MdExpandLess, MdExpandMore } from 'react-icons/md';
import '../styles/mapGuess.css';

const TimerWidget = memo(({ seconds }) => {
    const totalSeconds = GAME_CONFIG.DEFAULT_TIMER_SECONDS;
    const radius = 36;
    const circumference = 2 * Math.PI * radius;

    const safeTotalSeconds = totalSeconds > 0 ? totalSeconds : 1;
    const safeSeconds = Math.max(0, seconds);
    const progress = safeSeconds / safeTotalSeconds;

    const offset = circumference * (1 - Math.min(progress, 1));

    let progressColorClass = '';
    if (safeSeconds <= 10) {
        progressColorClass = 'danger';
    } else if (safeSeconds <= 30) {
        progressColorClass = 'warning';
    }

    const formattedTime = `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, '0')}`;

    return (
        <div className="timer-widget">
            <svg className="timer-svg" viewBox="0 0 80 80">
                <circle
                    className="timer-circle-bg"
                    cx="40"
                    cy="40"
                    r={radius}
                />
                <circle
                    className={`timer-circle-progress ${progressColorClass}`}
                    cx="40"
                    cy="40"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                />
            </svg>
            <div className="timer-text">{formattedTime}</div>
        </div>
    );
});

const mapOptionsConfig = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    clickableIcons: false,
};
const mapOptionsSmall = { ...mapOptionsConfig, zoomControl: false };
const mapOptionsLarge = { ...mapOptionsConfig, zoomControl: true };


function MapGuess({ center, locationId, onSubmitGuess, isExpanded, toggleMapSize }) {
    const [marker, setMarker] = useState(null);
    const { isLoaded } = useGoogleMapsApi();
    const { seconds, startTimer, stopTimer } = useCountdownTimer();

    useEffect(() => {
        if (center) {
            startTimer();
        }
    }, [center]);

    const handleMapClick = (event) => {
        if (event.latLng && typeof event.latLng.lat === 'function' && typeof event.latLng.lng === 'function') {
           setMarker({
                lat: event.latLng.lat(),
                lng: event.latLng.lng()
            });
        } else {
            console.error("Invalid map click event:", event);
        }
    };

    const handleConfirmGuess = () => {
        if (marker) {
            const currentTime = stopTimer();
            const duration = GAME_CONFIG.DEFAULT_TIMER_SECONDS - seconds;

            onSubmitGuess({
                lat: marker.lat,
                lng: marker.lng,
                duration: Math.max(0, duration),
                location_id: locationId
            });
            setMarker(null);
        }
    };

    const handleCancelGuess = () => {
        setMarker(null);
    }

    if (!isLoaded || !center) {
        return null;
    }

    return (
        <div className="map-guess-ui-container">
            <TimerWidget seconds={seconds} />

            <div className={`map-container ${isExpanded ? 'map-large' : 'map-small'}`}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
                    center={center}
                    zoom={isExpanded ? 3 : 1}
                    onClick={handleMapClick}
                    options={isExpanded ? mapOptionsLarge : mapOptionsSmall}
                >
                    {marker && <Marker position={marker} />}
                </GoogleMap>

                <button
                    className="btn map-toggle-button"
                    onClick={toggleMapSize}
                    title={isExpanded ? 'Collapse Map' : 'Expand Map'}
                >
                    {isExpanded ? <MdExpandLess size="1.5em"/> : <MdExpandMore size="1.5em"/>}
                </button>
            </div>

            {marker && (
                <div className="confirmation-panel">
                    <p>Confirm?</p>
                    <button className="btn btn-secondary btn-sm" onClick={handleCancelGuess}>
                        Cancel
                    </button>
                    <button className="btn btn-success btn-sm" onClick={handleConfirmGuess}>
                        Confirm
                    </button>
                </div>
            )}
        </div>
    );
}

export default MapGuess;