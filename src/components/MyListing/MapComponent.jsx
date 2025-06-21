'use client';
import React, { useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const MapComponent = ({ getLocationWithMap, Location }) => {
    const [map, setMap] = useState(null);

    const defaultCenter = {
        lat: -23.8634,
        lng: -69.1328
    };

    const mapStyles = {
        height: "400px",
        width: "100%"
    };

    const handleMapClick = (e) => {
        if (!e || !e.latLng) return;
        
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        
        if (typeof lat === 'number' && typeof lng === 'number') {
            getLocationWithMap({ lat, lng });
        }
    };

    const handleLoad = (mapInstance) => {
        if (mapInstance) {
            setMap(mapInstance);
        }
    };

    const center = Location?.lat && Location?.lng && !isNaN(Location.lat) && !isNaN(Location.lng)
        ? { lat: parseFloat(Location.lat), lng: parseFloat(Location.lng) }
        : defaultCenter;

    const markerPosition = Location?.lat && Location?.lng && !isNaN(Location.lat) && !isNaN(Location.lng)
        ? { lat: parseFloat(Location.lat), lng: parseFloat(Location.lng) }
        : null;

    return (
        <GoogleMap
            mapContainerStyle={mapStyles}
            zoom={13}
            center={center}
            onClick={handleMapClick}
            onLoad={handleLoad}
        >
            {markerPosition && (
                <Marker
                    position={markerPosition}
                    draggable={true}
                    onDragEnd={handleMapClick}
                />
            )}
        </GoogleMap>
    );
};

export default MapComponent;
