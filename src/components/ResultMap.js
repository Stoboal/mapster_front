import React, {useEffect, useState, useRef, useMemo} from 'react';
import {GoogleMap, Marker, Polyline} from '@react-google-maps/api';
import '../styles/resultMap.css';

const styles = {
    mapContainer: {
        width: '100%',
        height: '400px',
    },
    resultMapContainer: {
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
    },
    loadingMap: {
        height: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
    }
};

const markers = {
    actual: {
        icon: {
            path: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
            fillColor: '#4285F4',
            fillOpacity: 1,
            scale: 1.5,
            strokeWeight: 1,
            strokeColor: '#000000',
            anchor: {x: 12, y: 22},
        },
        label: {
            text: "Original",
            color: "#000000",
            className: "marker-label"
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
            anchor: {x: 12, y: 22},
        },
        label: {
            text: "Your choice",
            color: "#000000",
            className: "marker-label"
        }
    }
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
};

function ResultMap({actualLocation, guessedLocation, gameStats}) {
    const [animationProgress, setAnimationProgress] = useState(0);
    const animationRef = useRef(null);

    const {center, bounds} = useMemo(() => {
        if (!actualLocation || !guessedLocation) {
            return {center: null, bounds: null};
        }

        const center = {
            lat: (actualLocation.lat + guessedLocation.lat) / 2,
            lng: (actualLocation.lng + guessedLocation.lng) / 2
        };

        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(new window.google.maps.LatLng(actualLocation.lat, actualLocation.lng));
        bounds.extend(new window.google.maps.LatLng(guessedLocation.lat, guessedLocation.lng));

        return {center, bounds};
    }, [actualLocation, guessedLocation]);

    useEffect(() => {
        if (actualLocation && guessedLocation) {
            const startTime = Date.now();
            const duration = 1500;

            const animate = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);

                setAnimationProgress(progress);

                if (progress < 1) {
                    animationRef.current = requestAnimationFrame(animate);
                }
            };

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            animationRef.current = requestAnimationFrame(animate);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [actualLocation, guessedLocation]);

    const animatedPath = useMemo(() => {
        if (!actualLocation || !guessedLocation || animationProgress === 0) {
            return [];
        }

        const start = {lat: actualLocation.lat, lng: actualLocation.lng};
        const end = {lat: guessedLocation.lat, lng: guessedLocation.lng};

        const currentLat = start.lat + (end.lat - start.lat) * animationProgress;
        const currentLng = start.lng + (end.lng - start.lng) * animationProgress;

        return [
            start,
            {lat: currentLat, lng: currentLng}
        ];
    }, [actualLocation, guessedLocation, animationProgress]);

    if (!actualLocation || !guessedLocation || !center) {
        return <div style={styles.loadingMap}>Loading map...</div>;
    }

    return (
        <div className="result-map-container" style={styles.resultMapContainer}>
            {actualLocation && guessedLocation ? (
                <>
                    <GoogleMap
                        mapContainerStyle={styles.mapContainer}
                        center={center}
                        zoom={10}
                        options={mapOptions}
                        onLoad={(map) => {
                            if (bounds) {
                                map.fitBounds(bounds);
                            }
                        }}
                    >
                        <Marker
                            position={actualLocation}
                            icon={markers.actual.icon}
                            label={markers.actual.label}
                            animation={window.google.maps.Animation.DROP}
                        />

                        <Marker
                            position={guessedLocation}
                            icon={markers.guessed.icon}
                            label={markers.guessed.label}
                            animation={window.google.maps.Animation.DROP}
                        />

                        <Polyline
                            path={animatedPath}
                            options={{
                                strokeColor: '#FF0000',
                                strokeOpacity: 0.8,
                                strokeWeight: 3,
                                geodesic: true
                            }}
                        />
                    </GoogleMap>

                    <div className="result-stats">
                        <h3>Game results</h3>
                        <div className="stats-grid">
                            <div className="stat-item">
                                <p>Error:</p>
                                <p><strong>{gameStats?.distance} km</strong></p>
                            </div>
                            <div className="stat-item">
                                <p>Average player's error:</p>
                                <p><strong>{gameStats?.averageError?.toFixed(2) || 0} km</strong></p>
                            </div>
                            <div className="stat-item">
                                <p>Your time:</p>
                                <p><strong>{gameStats?.duration} s</strong></p>
                            </div>
                            <div className="stat-item">
                                <p>Average player's time:</p>
                                <p><strong>{gameStats?.averageTime || 0} s</strong></p>
                            </div>
                            <div className="stat-item score">
                                <p>Your score:</p>
                                <p><strong>{gameStats?.score || 0}</strong></p>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div style={styles.loadingMap}>Results loading...</div>
            )}
        </div>
    );
}

export default ResultMap;