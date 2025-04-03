import React, { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { MdOutlineScore, MdStraighten, MdTimer, MdCheckCircleOutline, MdOutlineFreeCancellation } from 'react-icons/md'; // Иконки
import '../styles/resultMap.css';

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    clickableIcons: false,
};

const markerOptions = {
    actual: {
        icon: {
            path: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
            fillColor: '#4285F4',
            fillOpacity: 1,
            scale: 1.5,
            strokeWeight: 1,
            strokeColor: '#000000',
            anchor: { x: 12, y: 22 },
        },
        label: {
            text: "Actual",
            color: "#000000",
            className: "marker-label",
            fontWeight: 'bold',
        }
    },
    guessed: {
        icon: {
            path: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
            fillColor: '#EA4335',
            fillOpacity: 1,
            scale: 1.5,
            strokeWeight: 1,
            strokeColor: '#000000',
            anchor: { x: 12, y: 22 },
        },
        label: {
            text: "Your Guess",
            color: "#000000",
            className: "marker-label",
            fontWeight: 'bold',
        }
    }
};

const polylineOptions = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    geodesic: true
};

function ResultMap({ actualLocation, guessedLocation, gameStats }) {
    const [animationProgress, setAnimationProgress] = useState(0);
    const animationRef = useRef(null);
    const mapRef = useRef(null);

    const { center, bounds } = useMemo(() => {
        if (!actualLocation || !guessedLocation || !window.google) {
            return { center: null, bounds: null };
        }
        const bounds = new window.google.maps.LatLngBounds();
        const actualLatLng = new window.google.maps.LatLng(actualLocation.lat, actualLocation.lng);
        const guessedLatLng = new window.google.maps.LatLng(guessedLocation.lat, guessedLocation.lng);

        bounds.extend(actualLatLng);
        bounds.extend(guessedLatLng);

        const centerLat = (actualLocation.lat + guessedLocation.lat) / 2;
        const centerLng = (actualLocation.lng + guessedLocation.lng) / 2;

        return { center: { lat: centerLat, lng: centerLng }, bounds };
    }, [actualLocation, guessedLocation]);

    useEffect(() => {
        if (actualLocation && guessedLocation) {
            const startTime = Date.now();
            const duration = 1000;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                setAnimationProgress(progress);
                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                }
            };

            cancelAnimationFrame(animationRef.current);
            animationRef.current = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(animationRef.current);
    }, [actualLocation, guessedLocation]);

    const animatedPath = useMemo(() => {
        if (!actualLocation || !guessedLocation || animationProgress === 0) return [];
        const start = { lat: actualLocation.lat, lng: actualLocation.lng };
        const end = { lat: guessedLocation.lat, lng: guessedLocation.lng };
        const currentLat = start.lat + (end.lat - start.lat) * animationProgress;
        const currentLng = start.lng + (end.lng - start.lng) * animationProgress;
        return [start, { lat: currentLat, lng: currentLng }];
    }, [actualLocation, guessedLocation, animationProgress]);

    const onLoad = (map) => {
        mapRef.current = map;
        if (bounds && map.fitBounds) {
            setTimeout(() => {
                 if (mapRef.current && mapRef.current.fitBounds && bounds.getNorthEast() && bounds.getSouthWest()) {
                    try {
                         mapRef.current.fitBounds(bounds, 30);
                    } catch (e) {
                        console.error("Error fitting bounds on load:", e);
                        if (center) mapRef.current.setCenter(center);
                    }
                 } else if (center) {
                     if (mapRef.current) mapRef.current.setCenter(center);
                 }
             }, 100);
        } else if (center) {
            map.setCenter(center);
            map.setZoom(Math.abs(actualLocation.lat - guessedLocation.lat) > 5 || Math.abs(actualLocation.lng - guessedLocation.lng) > 5 ? 3 : 5);
        }
    };


    if (!actualLocation || !guessedLocation || !center || !gameStats) {
        return <div className="loading-map">Loading results map...</div>;
    }

    const distanceComparisonClass = gameStats.distance <= gameStats.averageError ? 'better' : 'worse';
    const timeComparisonClass = gameStats.duration <= gameStats.averageTime ? 'better' : 'worse';

    const ComparisonIcon = ({ comparison }) => {
        if (comparison === 'better') {
            return <MdCheckCircleOutline className="comparison-icon" style={{ color: 'var(--color-success)'}} />;
        }
        if (comparison === 'worse') {
             return <MdOutlineFreeCancellation className="comparison-icon" style={{ color: 'var(--color-danger)'}} />;
        }
        return null;
    }

    return (
        <>
            <div className="result-map-container">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    options={mapOptions}
                    onLoad={onLoad}
                >
                    <Marker position={actualLocation} options={markerOptions.actual} />
                    <Marker position={guessedLocation} options={markerOptions.guessed} />
                    <Polyline path={animatedPath} options={polylineOptions} />
                </GoogleMap>
            </div>

            <div className="result-stats-new">
                <h3><MdOutlineScore /> Your Results</h3>

                <div className="score-highlight">
                    <span className="score-value">
                        {(gameStats.score || 0).toFixed(1)}
                        <span className="unit">pts</span>
                    </span>
                    <span className="score-label">Total Score</span>
                </div>

                <div className="comparison-grid">
                    <div className="comparison-block">
                        <h4 className="comparison-title">
                            <MdStraighten className="icon" /> Distance Error
                        </h4>
                        <div className="comparison-values">
                            <div className="value-group">
                                <span className={`value-player ${distanceComparisonClass}`}>
                                    {gameStats.distance}
                                    <span className="value-unit">km</span>
                                    <ComparisonIcon comparison={distanceComparisonClass} />
                                </span>
                                <span className="comparison-label">Your Guess</span>
                            </div>
                            <div className="value-group">
                                <span className="value-average">
                                    {gameStats.averageError?.toFixed(1) ?? '-'}
                                    <span className="value-unit">km</span>
                                </span>
                                <span className="comparison-label">Average</span>
                            </div>
                        </div>
                    </div>

                    <div className="comparison-block">
                        <h4 className="comparison-title">
                            <MdTimer className="icon" /> Time Taken
                        </h4>
                        <div className="comparison-values">
                            <div className="value-group">
                                <span className={`value-player ${timeComparisonClass}`}>
                                    {gameStats.duration}
                                    <span className="value-unit">s</span>
                                    <ComparisonIcon comparison={timeComparisonClass} />
                                </span>
                                <span className="comparison-label">Your Time</span>
                            </div>
                            <div className="value-group">
                                <span className="value-average">
                                    {gameStats.averageTime ?? '-'}
                                    <span className="value-unit">s</span>
                                </span>
                                <span className="comparison-label">Average</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ResultMap;