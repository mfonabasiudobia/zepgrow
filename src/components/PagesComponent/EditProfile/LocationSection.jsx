'use client';
import { t } from '@/utils';
import React, { useState, useEffect } from 'react';
import { BiMapPin } from 'react-icons/bi';
import { GrLocation } from 'react-icons/gr';
import { MdOutlineMyLocation } from 'react-icons/md';
import MapComponent from '@/components/MyListing/MapComponent';
import GoogleMapsWrapper from '@/components/Maps/GoogleMapsWrapper';
import AddAddressManuallyModal from '../../PagesComponent/AdListing/AddAddressManuallyModal';
import { useSelector } from 'react-redux';
import { getIsBrowserSupported } from '@/redux/reuducer/locationSlice';
import { settingsData } from '@/redux/reuducer/settingSlice';
import toast from 'react-hot-toast';

const LocationSection = ({ 
    getCurrentLocation, 
    Location, 
    getLocationWithMap, 
    setAddress, 
    Address, 
    CountryStore, 
    setCountryStore, 
    handleCountryScroll, 
    StateStore, 
    setStateStore, 
    handleStateScroll, 
    setCityStore, 
    CityStore, 
    handleCityScroll, 
    AreaStore, 
    setAreaStore, 
    handleAreaScroll, 
    setLocation 
}) => {
    const IsBrowserSupported = useSelector(getIsBrowserSupported);
    const systemSettings = useSelector(settingsData);
    const [IsManuallyAddress, setIsManuallyAddress] = useState(false);
    const [mapError, setMapError] = useState(null);

    useEffect(() => {
        // Validate Google Maps API key
        if (!systemSettings?.data?.place_api_key) {
            setMapError("Google Maps API key is not configured");
            toast.error("Location services are currently unavailable");
        }
    }, [systemSettings]);

    const handleAddressChange = (e) => {
        const newAddress = e.target.value;
        setAddress(newAddress);
        setLocation(prev => ({
            ...prev,
            address: newAddress
        }));
    };

    return (
        <div className="address">
            <div className="locationTabHead">
                <h5 className="personal_info_text">{t('address')}</h5>
                {IsBrowserSupported && !mapError && (
                    <button className="locateMeBtnCont" onClick={getCurrentLocation}>
                        <MdOutlineMyLocation size={18} />
                        <span>{t('locateMe')}</span>
                    </button>
                )}
            </div>

            <div className="address_wrapper">
                <div className="col-12">
                    {mapError ? (
                        <div className="map-error-container">
                            <p className="error-message">{mapError}</p>
                            <p>Please use manual address entry below</p>
                        </div>
                    ) : (
                        <GoogleMapsWrapper>
                            <MapComponent getLocationWithMap={getLocationWithMap} Location={Location} />
                        </GoogleMapsWrapper>
                    )}
                </div>

                <div className="col-12">
                    <div className="locationAddressCont">
                        <div className="LocationaddressIconCont">
                            <BiMapPin size={36} color={getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()} />
                        </div>
                        <div className="locAddressContent">
                            <h6>{t('address')}</h6>
                            <div className="auth_in_cont">
                                <textarea
                                    className="form-control"
                                    value={Location?.address || Address || ''}
                                    onChange={handleAddressChange}
                                    placeholder={t('enterYourAddress')}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="divider-container">
                        <div className="divider-line"></div>
                        <div className="divider-text">{t('or')}</div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="locAddAddresBtnCont">
                        <button className="addAddressBtn" onClick={() => setIsManuallyAddress(true)}>
                            <GrLocation size={18} />
                            <span>{t('addLocation')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <AddAddressManuallyModal
                isOpen={IsManuallyAddress}
                OnHide={() => setIsManuallyAddress(false)}
                setCountryStore={setCountryStore}
                CountryStore={CountryStore}
                handleCountryScroll={handleCountryScroll}
                StateStore={StateStore}
                setStateStore={setStateStore}
                handleStateScroll={handleStateScroll}
                CityStore={CityStore}
                setCityStore={setCityStore}
                handleCityScroll={handleCityScroll}
                AreaStore={AreaStore}
                setAreaStore={setAreaStore}
                handleAreaScroll={handleAreaScroll}
                setAddress={setAddress}
                Address={Address}
                setLocation={setLocation}
            />
        </div>
    );
};

export default LocationSection; 