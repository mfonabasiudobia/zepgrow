'use client'
import { Modal } from 'antd'
import { MdClose } from 'react-icons/md'
import { t } from '@/utils'
import { Select } from 'antd';
import { useState } from 'react';

const AddAddressManuallyModal = ({ 
    isOpen, 
    OnHide, 
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
    Address, 
    setAddress, 
    setLocation 
}) => {
    const CloseIcon = <div className="close_icon_cont"><MdClose size={24} color="black" /></div>
    const [fieldErrors, setFieldErrors] = useState({});
    const [localAddress, setLocalAddress] = useState(Address);

    const validateFields = () => {
        const errors = {};
        if (!CountryStore?.SelectedCountry?.name) errors.country = true;
        return errors;
    };

    const handleCountryChange = (value) => {
        const Country = CountryStore?.Countries.find(country => country.name === value?.label);
        setCountryStore(prev => ({
            ...prev,
            SelectedCountry: Country
        }));
        setFieldErrors({});
    }

    const handleStateChange = (value) => {
        const State = StateStore?.States.find(state => state.name === value?.label);
        setStateStore(prev => ({
            ...prev,
            SelectedState: State
        }));
        setFieldErrors({});
    }

    const handleCityChange = (value) => {
        const City = CityStore?.Cities.find(city => city.name === value?.label);
        setCityStore(prev => ({
            ...prev,
            SelectedCity: City
        }));
        setFieldErrors({});
    }

    const handleAreaChange = (value) => {
        const chosenArea = AreaStore?.Areas.find(item => item.name === value?.label);
        setAreaStore(prev => ({
            ...prev,
            SelectedArea: chosenArea
        }));
        setFieldErrors({});
    }

    const handleLocalAddressChange = (e) => {
        setLocalAddress(e.target.value);
        setFieldErrors({});
    }

    const handleSave = () => {
        const errors = validateFields();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) return;

        // Build address with available components
        const addressComponents = [];
        
        // Add manual address or area if available
        if (localAddress.trim()) {
            addressComponents.push(localAddress.trim());
        } else if (AreaStore?.SelectedArea?.name) {
            addressComponents.push(AreaStore.SelectedArea.name);
        }
        
        // Add city if selected
        if (CityStore?.SelectedCity?.name) {
            addressComponents.push(CityStore.SelectedCity.name);
        }
        
        // Add state if selected
        if (StateStore?.SelectedState?.name) {
            addressComponents.push(StateStore.SelectedState.name);
        }
        
        // Add country (required)
        if (CountryStore?.SelectedCountry?.name) {
            addressComponents.push(CountryStore.SelectedCountry.name);
        }

        const formattedAddress = addressComponents.join(", ");

        const locationData = {
            country: CountryStore?.SelectedCountry?.name || "",
            state: StateStore?.SelectedState?.name || "",
            city: CityStore?.SelectedCity?.name || "",
            address: formattedAddress,
            lat: CityStore?.SelectedCity?.latitude || null,
            long: CityStore?.SelectedCity?.longitude || null,
        };

        setLocation(locationData);
        setAddress(formattedAddress);
        OnHide();
    }

    return (
        <Modal
            centered
            open={isOpen}
            closeIcon={CloseIcon}
            colorIconHover='transparent'
            className="ant_register_modal"
            onCancel={OnHide}
            footer={null}
            maskClosable={false}
        >
            <div className='manuallyAddAddressCont'>
                <h5 className='whoMadePurchase'>{t('manuAddAddress')}</h5>

                <div className='extradet_select_wrap'>
                    <div>
                        <label className='auth_label'>{t('country')} *</label>
                        <Select
                            showSearch
                            style={{ width: "100%" }}
                            placeholder={t('countrySelect')}
                            onChange={handleCountryChange}
                            onSearch={handleCountrySearch}
                            labelInValue
                            filterOption={false}
                            className={`location_select ${fieldErrors.country ? "error-field" : ""}`}
                            value={Object.keys(CountryStore?.SelectedCountry).length !== 0 ? { value: CountryStore?.SelectedCountry?.name, label: CountryStore?.SelectedCountry?.name } : null}
                            onPopupScroll={handleCountryScroll}
                        >
                            {CountryStore?.Countries && CountryStore?.Countries.map((country, index) => (
                                <Option key={index} value={country.name}>
                                    {country.name}
                                </Option>
                            ))}
                        </Select>
                        {fieldErrors.country && <div className="error-message">{t('countryRequired')}</div>}
                    </div>

                    <div>
                        <label className='auth_label'>{t('state')}</label>
                        <Select
                            showSearch
                            style={{ width: "100%" }}
                            placeholder={t('stateSelect')}
                            onChange={handleStateChange}
                            onSearch={handleStateSearch}
                            labelInValue
                            filterOption={false}
                            className="location_select"
                            value={Object.keys(StateStore?.SelectedState).length !== 0 ? { value: StateStore?.SelectedState?.name, label: StateStore?.SelectedState?.name } : null}
                            disabled={Object.keys(CountryStore?.SelectedCountry).length === 0}
                            onPopupScroll={handleStateScroll}
                        >
                            {StateStore?.States && StateStore?.States.map((state, index) => (
                                <Option key={index} value={state.name}>
                                    {state.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <label className='auth_label'>{t('city')}</label>
                        <Select
                            showSearch
                            style={{ width: "100%" }}
                            placeholder={t('citySelect')}
                            onChange={handleCityChange}
                            onSearch={handleCitySearch}
                            labelInValue
                            filterOption={false}
                            className="location_select"
                            value={Object.keys(CityStore?.SelectedCity).length !== 0 ? { value: CityStore?.SelectedCity?.name, label: CityStore?.SelectedCity?.name } : null}
                            disabled={Object.keys(StateStore?.SelectedState).length === 0}
                            onPopupScroll={handleCityScroll}
                        >
                            {CityStore?.Cities && CityStore?.Cities.map((city, index) => (
                                <Option key={index} value={city.name}>
                                    {city.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <label className='auth_label'>{t('area')}</label>
                        <Select
                            showSearch
                            style={{ width: "100%" }}
                            placeholder={t('areaSelect')}
                            onChange={handleAreaChange}
                            onSearch={handleAreaSearch}
                            labelInValue
                            filterOption={false}
                            className="location_select"
                            value={Object.keys(AreaStore?.SelectedArea).length !== 0 ? { value: AreaStore?.SelectedArea?.name, label: AreaStore?.SelectedArea?.name } : null}
                            disabled={Object.keys(CityStore?.SelectedCity).length === 0}
                            onPopupScroll={handleAreaScroll}
                        >
                            {AreaStore?.Areas && AreaStore?.Areas.map((area, index) => (
                                <Option key={index} value={area.name}>
                                    {area.name}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <label className='auth_label'>{t('specificAddress')}</label>
                        <textarea
                            className="auth_input"
                            placeholder={t('enterSpecificAddress')}
                            value={localAddress}
                            onChange={handleLocalAddressChange}
                            rows={3}
                        />
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={OnHide}>
                        {t('cancel')}
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {t('save')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default AddAddressManuallyModal;
