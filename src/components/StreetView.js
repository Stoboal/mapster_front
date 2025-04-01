import {useEffect, useState} from "react";
import {useGoogleMapsApi} from '../services/mapsLoader';
import '../styles/streetView.css';

function StreetView({coordinates, locationId}) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [panorama, setPanorama] = useState(null);
    const {isLoaded} = useGoogleMapsApi();

    useEffect(() => {
        if (coordinates) {
            setPanorama(null);
            setLoading(true);
            setError(null);
        }
    }, [coordinates]);

    useEffect(() => {
        if (isLoaded && coordinates && !panorama) {
            const panoramaDiv = document.getElementById('street-view-panorama');
            if (panoramaDiv) {
                try {
                    const newPanorama = new window.google.maps.StreetViewPanorama(
                        panoramaDiv,
                        {
                            position: {lat: coordinates.lat, lng: coordinates.lng},
                            pov: {heading: 210, pitch: 10},
                            zoom: 1,
                            addressControl: false,
                            showRoadLabels: false,
                            fullscreenControl: true,
                        }
                    );
                    setPanorama(newPanorama);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }
        }
    }, [isLoaded, coordinates, panorama]);

    return (
        <div className="street-view-container">
            {loading && (
                <div className="loader">
                    <span></span>
                    <p>Loading location...</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <p>Error: {JSON.stringify(error)}</p>
                </div>
            )}

            <div id="street-view-panorama"></div>
        </div>
    );
}

export default StreetView;
