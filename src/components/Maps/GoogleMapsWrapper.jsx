"use client";
import React, { useState } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { t } from "@/utils";

const libraries = ['places', 'geometry'];

const GoogleMapsWrapper = ({ children }) => {
    const [loadError, setLoadError] = useState(null);

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="alert alert-danger">
                {t("googleMapsApiKeyMissing")}
            </div>
        );
    }

    const handleError = (error) => {
        console.error('Google Maps loading error:', error);
        setLoadError(error);
    };

    if (loadError) {
        return (
            <div className="alert alert-danger">
                {t("errorLoadingGoogleMaps")}
            </div>
        );
    }

    return (
        <LoadScript
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            libraries={libraries}
            onError={handleError}
        >
            {children}
        </LoadScript>
    );
};

export default GoogleMapsWrapper; 