import React, {useState, useEffect} from 'react';
import {GoogleMap, Marker} from '@react-google-maps/api';
import {useGoogleMapsApi} from '../services/mapsLoader';
import {useCountdownTimer} from './timer';
import '../styles/mapGuess.css';

function MapGuess({center, locationId, onSubmitGuess, isExpanded, toggleMapSize}) {
    const [marker, setMarker] = useState(null);
    const {isLoaded} = useGoogleMapsApi();
    const {seconds, startTimer, stopTimer, formattedTime} = useCountdownTimer();

    useEffect(() => {
        if (center && marker === null) {
            startTimer();
        }
    }, [center]);


    const handleMapClick = (event) => {
        setMarker({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        });
    };

    const handleConfirmGuess = () => {
        if (marker) {
            const elapsedTime = stopTimer();

            onSubmitGuess({
                lat: marker.lat,
                lng: marker.lng,
                duration: elapsedTime,
                location_id: locationId
            });
        }
    };

    if (!isLoaded) {
        return <div className="loader"><span></span><p>Map loading...</p></div>;
    }

    return (
        <>
            <div className="stats-panel">
                <p>Time left: {formattedTime}</p>
            </div>

            <div className={`map-container ${isExpanded ? 'map-large' : 'map-small'}`}>
                <GoogleMap
                    mapContainerStyle={{width: '100%', height: '100%'}}
                    center={center}
                    zoom={isExpanded ? 3 : 1}
                    onClick={handleMapClick}
                    options={{
                        zoomControl: false,
                        mapTypeControl: isExpanded,
                        streetViewControl: false,
                        fullscreenControl: false,
                    }}
                >
                    {marker && <Marker position={marker}/>}
                </GoogleMap>

                {isExpanded ? (
                    <button
                        className="btn btn-secondary"
                        style={{position: 'absolute', top: '10px', right: '10px'}}
                        onClick={toggleMapSize}
                    >
                        Collapse
                    </button>
                ) : (
                    <button
                        className="btn btn-secondary"
                        style={{position: 'absolute', top: '10px', right: '10px'}}
                        onClick={toggleMapSize}
                    >
                        Expand
                    </button>
                )}
            </div>

            {marker && (
                <div className="confirmation-panel">
                    <p>Are you sure?</p>
                    <button className="btn btn-success" onClick={handleConfirmGuess}>
                        Accept
                    </button>
                </div>
            )}
        </>
    );
}

export default MapGuess;