"use client";
import ProfileSidebar from "@/components/Profile/ProfileSidebar";
import Image from "next/image";
import { isLogin, placeholderImage, t } from "@/utils";
import { useSelector } from "react-redux";
import { userSignUpData } from "@/redux/reuducer/authSlice";
import { useEffect, useState } from "react";
import { MdAddPhotoAlternate, MdVerifiedUser } from "react-icons/md";
import { getVerificationStatusApi, updateProfileApi } from "@/utils/api";
import { Fcmtoken, settingsData } from "@/redux/reuducer/settingSlice";
import toast from "react-hot-toast";
import { loadUpdateUserData } from "../../../redux/reuducer/authSlice";
import BreadcrumbComponent from "@/components/Breadcrumb/BreadcrumbComponent";
import { CurrentLanguageData } from "@/redux/reuducer/languageSlice";
import { useRouter } from "next/navigation";
import LocationSection from "./LocationSection";
import axios from "axios";

const EditProfile = () => {
  const router = useRouter();
  const CurrentLanguage = useSelector(CurrentLanguageData);
  const systemSettings = useSelector(settingsData);
  const settings = systemSettings?.data;
  const placeholder_image = systemSettings?.data?.placeholder_image;
  const User = useSelector(userSignUpData);
  const UserData = User;
  const fetchFCM = useSelector(Fcmtoken);

  // Add loading and error states
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if required data is available
    if (!isLogin()) {
      router.push('/login');
      return;
    }

    if (!settings) {
      setError("Settings not loaded. Please refresh the page.");
      return;
    }

    if (!UserData) {
      setError("User data not found. Please log in again.");
      return;
    }

    setIsPageLoading(false);
  }, [settings, UserData]);

  const [formData, setFormData] = useState({
    name: UserData?.name || "",
    email: UserData?.email || "",
    phone: UserData?.mobile || "",
    address: UserData?.address || "",
    notification: UserData?.notification,
    show_personal_details: Number(UserData?.show_personal_details),
  });
  const [profileImage, setProfileImage] = useState(
    UserData?.profile || placeholder_image
  );
  const [isLoading, setIsLoading] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [VerificationStatus, setVerificationStatus] = useState("");
  const [RejectionReason, setRejectionReason] = useState("");
  const isAdmin = UserData?.type === "admin";

  // Location states
  const [Location, setLocation] = useState({
    address: UserData?.address || "",
    lat: UserData?.latitude || null,
    long: UserData?.longitude || null,
    city: UserData?.city || "",
    state: UserData?.state || "",
    country: UserData?.country || ""
  });
  const [Address, setAddress] = useState(UserData?.address || "");
  const [CountryStore, setCountryStore] = useState({
    Countries: [],
    SelectedCountry: {},
    CountrySearch: '',
    currentPage: 1,
    hasMore: false,
  });
  const [StateStore, setStateStore] = useState({
    States: [],
    SelectedState: {},
    StateSearch: '',
    currentPage: 1,
    hasMore: false,
  });
  const [CityStore, setCityStore] = useState({
    Cities: [],
    SelectedCity: {},
    CitySearch: '',
    currentPage: 1,
    hasMore: false,
  });
  const [AreaStore, setAreaStore] = useState({
    Areas: [],
    SelectedArea: {},
    AreaSearch: '',
    currentPage: 1,
    hasMore: false,
  });

  const getVerificationProgress = async () => {
    try {
      const res = await getVerificationStatusApi.getVerificationStatus();
      if (res?.data?.error === true) {
        setVerificationStatus("not applied");
      } else {
        const status = res?.data?.data?.status;
        const rejectReason = res?.data?.data?.rejection_reason;
        setVerificationStatus(status);
        setRejectionReason(rejectReason);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isLogin()) {
      getVerificationProgress();
    }
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleChange = () => {
    setFormData((prevData) => ({
      ...prevData,
      notification: prevData.notification === 1 ? 0 : 1,
    }));
  };
  const handlePrivateChange = () => {
    setFormData((prevData) => ({
      ...prevData,
      show_personal_details: prevData.show_personal_details === 1 ? 0 : 1,
    }));
  };

  const getLocationWithMap = async (pos) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${pos.lat},${pos.lng}&key=${settings?.place_api_key}&lang=en`);

      if (response.data.error_message) {
        toast.error(response.data.error_message)
        return
      }

      let city = '';
      let state = '';
      let country = '';
      let address = '';

      response.data.results.forEach(result => {
        const addressComponents = result.address_components;
        const getAddressComponent = (type) => {
          const component = addressComponents.find(comp => comp.types.includes(type));
          return component ? component.long_name : '';
        };

        if (!city) city = getAddressComponent("locality");
        if (!state) state = getAddressComponent("administrative_area_level_1");
        if (!country) country = getAddressComponent("country");
        if (!address) address = result.formatted_address;
      });

      const locationData = {
        lat: pos.lat,
        long: pos.lng,
        city,
        state,
        country,
        address
      };

      setLocation(locationData);
      setAddress(address);
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  const getCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const locationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };

            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${locationData.latitude},${locationData.longitude}&key=${settings?.place_api_key}&lang=en`);

            if (response.data.error_message) {
              toast.error(response.data.error_message)
              return
            }

            let city = '';
            let state = '';
            let country = '';
            let address = '';

            response.data.results.forEach(result => {
              const addressComponents = result.address_components;
              const getAddressComponent = (type) => {
                const component = addressComponents.find(comp => comp.types.includes(type));
                return component ? component.long_name : '';
              };

              if (!city) city = getAddressComponent("locality");
              if (!state) state = getAddressComponent("administrative_area_level_1");
              if (!country) country = getAddressComponent("country");
              if (!address) address = result.formatted_address;
            });

            const cityData = {
              lat: locationData.latitude,
              long: locationData.longitude,
              city,
              state,
              country,
              address
            };

            setLocation(cityData);
            setAddress(address);
          } catch (error) {
            console.error('Error fetching location data:', error);
          }
        },
        (error) => {
          toast.error(t('locationNotGranted'));
        }
      );
    } else {
      toast.error(t('geoLocationNotSupported'));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("mobile", formData.phone);
      formDataToSend.append("notification", formData.notification);
      formDataToSend.append("show_personal_details", formData.show_personal_details);
      formDataToSend.append("fcm_id", fetchFCM);
      formDataToSend.append("address", Location.address || Address);
      formDataToSend.append("latitude", Location.lat);
      formDataToSend.append("longitude", Location.long);
      formDataToSend.append("city", Location.city);
      formDataToSend.append("state", Location.state);
      formDataToSend.append("country", Location.country);

      if (profileFile) {
        formDataToSend.append("profile", profileFile);
      }

      const res = await updateProfileApi.updateProfile(formDataToSend);

      if (res.data.error === true) {
        toast.error(res.data.message);
      } else {
        toast.success(res.data.message);
        loadUpdateUserData(res.data.data);
      }
    } catch (error) {
      console.log(error);
      toast.error(t("somethingWentWrong"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerfiyNow = () => {
    router.push("/user-verification");
  };

  // Add scroll handler functions
  const handleCountryScroll = async () => {
    if (CountryStore.hasMore && !CountryStore.loading) {
      try {
        const nextPage = CountryStore.currentPage + 1;
        const response = await axios.get(`/api/location/countries?page=${nextPage}&search=${CountryStore.CountrySearch}`);
        
        if (response.data.data.length > 0) {
          setCountryStore(prev => ({
            ...prev,
            Countries: [...prev.Countries, ...response.data.data],
            currentPage: nextPage,
            hasMore: response.data.data.length === 10 // Assuming 10 items per page
          }));
        } else {
          setCountryStore(prev => ({
            ...prev,
            hasMore: false
          }));
        }
      } catch (error) {
        console.error('Error fetching more countries:', error);
      }
    }
  };

  const handleStateScroll = async () => {
    if (StateStore.hasMore && !StateStore.loading && CountryStore.SelectedCountry?.id) {
      try {
        const nextPage = StateStore.currentPage + 1;
        const response = await axios.get(`/api/location/states/${CountryStore.SelectedCountry.id}?page=${nextPage}&search=${StateStore.StateSearch}`);
        
        if (response.data.data.length > 0) {
          setStateStore(prev => ({
            ...prev,
            States: [...prev.States, ...response.data.data],
            currentPage: nextPage,
            hasMore: response.data.data.length === 10
          }));
        } else {
          setStateStore(prev => ({
            ...prev,
            hasMore: false
          }));
        }
      } catch (error) {
        console.error('Error fetching more states:', error);
      }
    }
  };

  const handleCityScroll = async () => {
    if (CityStore.hasMore && !CityStore.loading && StateStore.SelectedState?.id) {
      try {
        const nextPage = CityStore.currentPage + 1;
        const response = await axios.get(`/api/location/cities/${StateStore.SelectedState.id}?page=${nextPage}&search=${CityStore.CitySearch}`);
        
        if (response.data.data.length > 0) {
          setCityStore(prev => ({
            ...prev,
            Cities: [...prev.Cities, ...response.data.data],
            currentPage: nextPage,
            hasMore: response.data.data.length === 10
          }));
        } else {
          setCityStore(prev => ({
            ...prev,
            hasMore: false
          }));
        }
      } catch (error) {
        console.error('Error fetching more cities:', error);
      }
    }
  };

  const handleAreaScroll = async () => {
    if (AreaStore.hasMore && !AreaStore.loading && CityStore.SelectedCity?.id) {
      try {
        const nextPage = AreaStore.currentPage + 1;
        const response = await axios.get(`/api/location/areas/${CityStore.SelectedCity.id}?page=${nextPage}&search=${AreaStore.AreaSearch}`);
        
        if (response.data.data.length > 0) {
          setAreaStore(prev => ({
            ...prev,
            Areas: [...prev.Areas, ...response.data.data],
            currentPage: nextPage,
            hasMore: response.data.data.length === 10
          }));
        } else {
          setAreaStore(prev => ({
            ...prev,
            hasMore: false
          }));
        }
      } catch (error) {
        console.error('Error fetching more areas:', error);
      }
    }
  };

  if (isPageLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="edit-profile-container">
      <BreadcrumbComponent title2={t("editProfile")} />
      <div className="container">
        <div className="row my_prop_title_spacing">
          <h4 className="pop_cat_head">{t("myProfile")}</h4>
          {!isAdmin && (
            <p className="text-muted mt-2">
              {t("onlyAdminCanEdit")}
            </p>
          )}
        </div>

        <div className="row profile_sidebar">
          <ProfileSidebar />
          <div className="col-lg-9 p-0">
            <div className="profile_content">
              <div className="userDetCont">
                <div className="user_detail">
                  <div className="profile_image_div">
                    <Image
                      src={profileImage}
                      width={120}
                      height={120}
                      alt="User"
                      className="user_img"
                      onErrorCapture={placeholderImage}
                    />
                    {isAdmin && (
                      <div className="add_profile">
                        <input
                          type="file"
                          id="profileImageUpload"
                          className="upload_input"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <label
                          htmlFor="profileImageUpload"
                          className="upload_label"
                        >
                          <MdAddPhotoAlternate size={22} />
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="user_info">
                    <h5 className="username">{UserData?.name}</h5>
                    <p className="user_email">{UserData?.email}</p>
                  </div>
                </div>

                {/* <button className="verfiyNowBtn pendingVerBtn">{t('pending')}</button> */}

                {VerificationStatus === "approved" ? (
                  <div className="verfied_cont">
                    <MdVerifiedUser size={14} />
                    <p className="verified_text">{t("verified")}</p>
                  </div>
                ) : VerificationStatus === "not applied" ? (
                  <button className="verfiyNowBtn" onClick={handleVerfiyNow}>
                    {t("verfiyNow")}
                  </button>
                ) : VerificationStatus === "rejected" ? (
                  <div className="rejectReasonCont">
                    <p className="rejectedReasonLabel">{RejectionReason}</p>
                    <button
                      className="verfiyNowBtn applyAgain"
                      onClick={handleVerfiyNow}
                    >
                      {t("applyAgain")}
                    </button>
                  </div>
                ) : VerificationStatus === "pending" ||
                  VerificationStatus === "resubmitted" ? (
                  <button className="verfiyNowBtn pendingVerBtn">
                    {t("inReview")}
                  </button>
                ) : null}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="personal_info">
                  <h5 className="personal_info_text">{t("personalInfo")}</h5>
                  <div className="authrow">
                    <div className="auth_in_cont">
                      <label htmlFor="name" className="auth_label">
                        {t("name")}
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="auth_input personal_info_input"
                        value={formData.name}
                        onChange={handleChange}
                        readOnly={!isAdmin}
                      />
                    </div>

                    <div className="privateNotifCont">
                      <div className="auth_in_cont">
                        <label
                          htmlFor="notification"
                          className="auth_pers_label"
                        >
                          {t("notification")}{" "}
                        </label>
                        <span className="switch mt-2">
                          <input
                            id="switch-rounded"
                            type="checkbox"
                            checked={
                              formData.notification === "1" ||
                              formData.notification === 1
                            }
                            onChange={handleToggleChange}
                            disabled={!isAdmin}
                          />
                          <label htmlFor="switch-rounded"></label>
                        </span>
                      </div>
                      <div className="auth_in_cont">
                        <label
                          htmlFor="showContactInfo"
                          className="auth_pers_label"
                        >
                          {t("showContactInfo")}{" "}
                        </label>
                        <span className="switch mt-2">
                          <input
                            id="showContactInfo"
                            type="checkbox"
                            checked={
                              formData.show_personal_details === "1" ||
                              formData.show_personal_details === 1
                            }
                            onChange={handlePrivateChange}
                            disabled={!isAdmin}
                          />
                          <label htmlFor="showContactInfo"></label>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="authrow">
                    <div className="auth_in_cont">
                      <label htmlFor="email" className="auth_label">
                        {t("email")}
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="auth_input personal_info_input"
                        value={formData.email}
                        onChange={handleChange}
                        readOnly={!isAdmin || UserData?.type === "email" || UserData?.type === "google"}
                      />
                    </div>
                    <div className="auth_in_cont">
                      <label htmlFor="phone" className="auth_pers_label">
                        {t("phoneNumber")}
                      </label>
                      <input
                        type="number"
                        id="phone"
                        min={0}
                        className="auth_input personal_info_input"
                        value={formData.phone}
                        onChange={handleChange}
                        readOnly={!isAdmin || UserData?.type === "phone"}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-12">
                  <LocationSection
                    getCurrentLocation={getCurrentLocation}
                    Location={Location}
                    getLocationWithMap={getLocationWithMap}
                    setAddress={setAddress}
                    Address={Address}
                    CountryStore={CountryStore}
                    setCountryStore={setCountryStore}
                    handleCountryScroll={handleCountryScroll}
                    StateStore={StateStore}
                    setStateStore={setStateStore}
                    handleStateScroll={handleStateScroll}
                    setCityStore={setCityStore}
                    CityStore={CityStore}
                    handleCityScroll={handleCityScroll}
                    AreaStore={AreaStore}
                    setAreaStore={setAreaStore}
                    handleAreaScroll={handleAreaScroll}
                    setLocation={setLocation}
                  />
                </div>

                <div className="address">
                  <h5 className="personal_info_text">{t("address")}</h5>
                  <div className="address_wrapper">
                    <div className="auth_in_cont">
                      <label htmlFor="address" className="auth_label">
                        {t("address")}
                      </label>
                      <textarea
                        name="address"
                        id="address"
                        rows="3"
                        className="auth_input personal_info_input"
                        value={Location.address}
                      ></textarea>
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <button
                    type="submit"
                    className="sv_chng_btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="loader-container-otp">
                        <div className="loader-otp"></div>
                      </div>
                    ) : (
                      t("saveChanges")
                    )}
                  </button>
                )}

                {!isAdmin && (
                  <button
                    type="submit"
                    className="sv_chng_btn"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="loader-container-otp">
                        <div className="loader-otp"></div>
                      </div>
                    ) : (
                      t("saveChanges")
                    )}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
