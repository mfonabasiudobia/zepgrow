import MapComponent from '@/components/MyListing/MapComponent';
import { getIsBrowserSupported } from '@/redux/reuducer/locationSlice';
import { t } from '@/utils';
import React, { useState } from 'react'
import { useSelector } from 'react-redux';
import AddAddressManuallyModal from '../AdListing/AddAddressManuallyModal';
import { MdOutlineMyLocation } from 'react-icons/md';
import { BiMapPin } from 'react-icons/bi';
import { GrLocation } from 'react-icons/gr';
import { FaUserCircle } from 'react-icons/fa';
import { userSignUpData } from '@/redux/reuducer/authSlice';
import GoogleMapsWrapper from '@/components/Maps/GoogleMapsWrapper';

const ContentFive = ({ getCurrentLocation, handleGoBack, Location, handleFullSubmission, getLocationWithMap, setAddress, Address, isAdPlaced, CountryStore, setCountryStore, handleCountryScroll, StateStore, setStateStore, handleStateScroll, setCityStore, CityStore, handleCityScroll, AreaStore, setAreaStore, handleAreaScroll, setLocation }) => {

    const IsBrowserSupported = useSelector(getIsBrowserSupported)
    const [IsManuallyAddress, setIsManuallyAddress] = useState(false)
    const [isUsingProfileAddress, setIsUsingProfileAddress] = useState(false)
    const userData = useSelector(userSignUpData)

    const useProfileAddress = () => {
        if (userData?.address) {
            setAddress(userData.address);
            setLocation({
                address: userData.address,
                lat: userData.latitude || null,
                long: userData.longitude || null,
                city: Location?.city || '',
                state: Location?.state || '',
                country: Location?.country || ''
            });
            setIsUsingProfileAddress(true);
            setIsManuallyAddress(false);
        }
    };

    return (
        <>
            <div className="col-12">
                <div className='locationTabHead'>
                    <h2>{t('addLocation')}</h2>
                    {!isUsingProfileAddress && IsBrowserSupported && (
                        <button className='locateMeBtnCont' onClick={getCurrentLocation}>
                            <MdOutlineMyLocation size={18} />
                            <span>{t('locateMe')}</span>
                        </button>
                    )}
                </div>
            </div>

            {userData?.address && !isUsingProfileAddress && (
                <div className="col-12 mb-4">
                    <div className='profile-address-card'>
                        <div className='profile-address-header'>
                            <FaUserCircle size={24} />
                            <h5>{t('useYourProfileAddress')}</h5>
                        </div>
                        <p className="profile-address-text">{userData.address}</p>
                        <button className='btn btn-primary w-100' onClick={useProfileAddress}>
                            {t('useThisAddress')}
                        </button>
                    </div>
                </div>
            )}

            {!isUsingProfileAddress && (
                <>
                    <div className="col-12">
                        <GoogleMapsWrapper>
                            <MapComponent getLocationWithMap={getLocationWithMap} Location={Location} />
                        </GoogleMapsWrapper>
                    </div>

                    <div className="col-12">
                        <div className='locationAddressCont'>
                            <div className='LocationaddressIconCont'>
                                <BiMapPin size={36} color={getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim()} />
                            </div>
                            <div className='locAddressContent'>
                                <h6>{t('address')}</h6>
                                {Location?.address ? <p>{Location?.address}</p> : t('addYourAddress')}
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
                        <div className='locAddAddresBtnCont'>
                            <h5>{t('whatLocAdYouSelling')}</h5>
                            <button className='addAddressBtn' onClick={() => setIsManuallyAddress(true)}>
                                <GrLocation size={18} />
                                <span>{t('addLocation')}</span>
                            </button>
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
                        <p className="profile-address-text">{userData.address}</p>
                        <button className='btn btn-outline-primary' onClick={() => {
                            setIsUsingProfileAddress(false);
                            setLocation({
                                address: '',
                                lat: null,
                                long: null,
                                city: '',
                                state: '',
                                country: ''
                            });
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
                        <button className='nextBtn' onClick={handleFullSubmission} disabled={isAdPlaced}>{t('postNow')}</button>
                    )}
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
        </>
    )
}

export default ContentFive
