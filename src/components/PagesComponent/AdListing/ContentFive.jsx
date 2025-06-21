'use client'
import MapComponent from '@/components/MyListing/MapComponent';
import { getIsBrowserSupported } from '@/redux/reuducer/locationSlice';
import { t } from '@/utils';
import React, { useState, useEffect } from 'react';
import { BiMapPin } from 'react-icons/bi';
import { GrLocation } from 'react-icons/gr';
import { FaUserCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import AddAddressManuallyModal from './AddAddressManuallyModal';
import { userSignUpData } from '@/redux/reuducer/authSlice';
import GoogleMapsWrapper from '@/components/Maps/GoogleMapsWrapper';
import { settingsData } from '@/redux/reuducer/settingSlice';
import toast from 'react-hot-toast';

const ContentFive = ({ 
    getCurrentLocation, 
    handleGoBack, 
    Location, 
    handleFullSubmission, 
    getLocationWithMap, 
    setAddress, 
    Address, 
    isAdPlaced, 
    CountryStore, 
    setCountryStore, 
    handleCountryScroll,
    handleCountrySearch,
    StateStore, 
    setStateStore, 
    handleStateScroll,
    handleStateSearch,
    setCityStore, 
    CityStore, 
    handleCityScroll,
    handleCitySearch,
    AreaStore, 
    setAreaStore, 
    handleAreaScroll,
    handleAreaSearch,
    setLocation 
}) => {
    const IsBrowserSupported = useSelector(getIsBrowserSupported);
    const systemSettings = useSelector(settingsData);
    const [IsManuallyAddress, setIsManuallyAddress] = useState(false);
    const [isUsingProfileAddress, setIsUsingProfileAddress] = useState(false);
    const userData = useSelector(userSignUpData);

    const useProfileAddress = () => {
        if (userData?.address) {
            setAddress(userData.address);
            setLocation({
                address: userData.address,
                lat: userData.latitude || null,
                long: userData.longitude || null,
                city: userData.city || '',
                state: userData.state || '',
                country: userData.country || ''
            });
            setIsUsingProfileAddress(true);
            setIsManuallyAddress(false);
        }
    };

    const handleAddressChange = (e) => {
        const newAddress = e.target.value;
        setAddress(newAddress);
        setLocation(prev => ({
            ...prev,
            address: newAddress
        }));
    };

    // Check if Google Maps API key is configured
    useEffect(() => {
        if (!systemSettings?.data?.place_api_key) {
            toast.error(t('googleMapsApiKeyMissing'));
        }
    }, [systemSettings]);

    return (
        <>
            <div className="col-12">
                <div className='locationTabHead'>
                    <h2>{t('location')}</h2>
                </div>
            </div>

          

            {!isUsingProfileAddress && (
                <>
                    <div className="col-12">
                        <GoogleMapsWrapper>
                            <MapComponent 
                                getLocationWithMap={getLocationWithMap} 
                                Location={Location}
                                apiKey={systemSettings?.data?.place_api_key}
                            />
                        </GoogleMapsWrapper>
                    </div>

                    <div className="col-12">
                        <div className='locationAddressCont'>
                            <div className='LocationaddressIconCont'>
                                <BiMapPin size={36} color={getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()} />
                            </div>
                            <div className='locAddressContent'>
                                <h6>{t('address')}</h6>
                                <p className="address-text">{Location?.address || Address || t('noAddressSelected')}</p>
                                {userData?.address && !isUsingProfileAddress && (
                                    <div className="col-12 mb-4">
                                        <div className='profile-address-card'>
                                            <div className='profile-address-header'>
                                                <h5>{t('useYourProfileAddress')}</h5>
                                            </div>
                                            <p className="profile-address-text">{userData.address}</p>
                                            
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    
                </>
            )}

            {isUsingProfileAddress && (
                <div className="col-12">
                    <div className='profile-address-display'>
                        <div className='profile-address-header'>
                            <FaUserCircle size={24} />
                            <h5>{t('usingProfileAddress')}</h5>
                        </div>
                        <p className="address-text">{Location?.address || Address}</p>
                        <button className='btn btn-outline-primary mt-3' onClick={() => {
                            setIsUsingProfileAddress(false);
                            setLocation({
                                address: '',
                                lat: null,
                                long: null,
                                city: '',
                                state: '',
                                country: ''
                            });
                            setAddress('');
                        }}>
                            {t('useAnotherAddress')}
                        </button>
                    </div>
                </div>
            )}

            <div className="col-12">
                <div className="formBtns">
                    <button className='backBtn' onClick={handleGoBack}>{t('back')}</button>
                    {isAdPlaced ? (
                        <button className='btn btn-secondary' disabled>{t('posting')}</button>
                    ) : (
                        <button 
                            className='nextBtn' 
                            onClick={handleFullSubmission} 
                            disabled={isAdPlaced || (!Location?.address && !Address)}
                        >
                            {t('postNow')}
                        </button>
                    )}
                </div>
            </div>
            
            <AddAddressManuallyModal 
                isOpen={IsManuallyAddress} 
                OnHide={() => setIsManuallyAddress(false)} 
                setCountryStore={setCountryStore} 
                CountryStore={CountryStore} 
                handleCountryScroll={handleCountryScroll}
                handleCountrySearch={handleCountrySearch}
                StateStore={StateStore} 
                setStateStore={setStateStore} 
                handleStateScroll={handleStateScroll}
                handleStateSearch={handleStateSearch}
                CityStore={CityStore} 
                setCityStore={setCityStore} 
                handleCityScroll={handleCityScroll}
                handleCitySearch={handleCitySearch}
                AreaStore={AreaStore} 
                setAreaStore={setAreaStore} 
                handleAreaScroll={handleAreaScroll}
                handleAreaSearch={handleAreaSearch}
                setAddress={setAddress} 
                Address={Address} 
                setLocation={setLocation}
            />
        </>
    );
};

export default ContentFive;
