'use client'
import { Modal } from "antd";
import Link from "next/link";
import { MdClose, MdOutlineLocalPhone } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  getAuth,
  signInWithPhoneNumber,
  signInWithPopup,
} from "firebase/auth";
import toast from "react-hot-toast";
import { handleFirebaseAuthError, t } from "@/utils";
import { getOtpApi, userSignUpApi, verifyOtpApi } from "@/utils/api";
import { useSelector } from "react-redux";
import { Fcmtoken, settingsData } from "@/redux/reuducer/settingSlice";
import { loadUpdateData } from "../../redux/reuducer/authSlice";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { isValidPhoneNumber } from "libphonenumber-js";
import { useRouter } from "next/navigation";

const LoginModal = ({
  IsLoginModalOpen,
  setIsRegisterModalOpen,
  setIsLoginModalOpen,
}) => {
  const router = useRouter();
  const auth = getAuth();
  const numberInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const fetchFCM = useSelector(Fcmtoken);
  const systemSettingsData = useSelector(settingsData);
  const settings = systemSettingsData?.data;
  const otp_service_provider = settings?.otp_service_provider;
  const mobile_authentication = Number(settings?.mobile_authentication);
  const google_authentication = Number(settings?.google_authentication);
  const isDemoMode = settings?.demo_mode;
  const [IsLoginScreen, setIsLoginScreen] = useState(true);
  const [IsOTPScreen, setIsOTPScreen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [number, setNumber] = useState("");
  const [inputType, setInputType] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [resendOtpLoader, setResendOtpLoader] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const OnHide = async () => {
    setIsLoginModalOpen(false);
    setIsLoginScreen(true);
    setIsOTPScreen(false);
    setInputValue("");
    setInputType("");
    setNumber("");
    setOtp("");
    setResendTimer(0);
    await recaptchaClear();
  };

  // Remove any non-digit characters from the country code
  const countryCodeDigitsOnly = countryCode.replace(/\D/g, "");

  // Check if the entered number starts with the selected country code
  const startsWithCountryCode = number.startsWith(countryCodeDigitsOnly);

  // If the number starts with the country code, remove it
  const formattedNumber = startsWithCountryCode
    ? number.substring(countryCodeDigitsOnly.length)
    : number; 

  useEffect(() => {
    if (isDemoMode && IsLoginModalOpen) {
      setInputType("number");
      setInputValue("919876598765");
      setNumber("919876598765");
      setCountryCode("+91");
    }
  }, [isDemoMode, IsLoginModalOpen]);

  useEffect(() => {
    if (IsLoginModalOpen) {
      requestAnimationFrame(() => {
        if (!IsOTPScreen && numberInputRef.current) {
          numberInputRef.current.focus();
        } else if (IsOTPScreen && otpInputRef.current) {
          otpInputRef.current.focus();
        }
      });
    }
  }, [IsLoginModalOpen, IsOTPScreen]);

  // Timer countdown effect
  useEffect(() => {
    let intervalId;
    if (resendTimer > 0) {
      intervalId = setInterval(() => {
        setResendTimer(prevTimer => prevTimer - 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [resendTimer]);

  const handleInputChange = (value, data) => {
    const containsOnlyDigits = /^\d+$/.test(value);
    setInputValue(value);

    if (containsOnlyDigits) {
      setInputType("number");
      setNumber(value);
      setCountryCode("+" + (data?.dialCode || ""));
    } else {
      setInputType("");
    }
  };

  const generateRecaptcha = () => {
    const auth = getAuth();

    if (!window.recaptchaVerifier) {
      const recaptchaContainer = document.getElementById("recaptcha-container");
      if (!recaptchaContainer) {
        console.error("Container element 'recaptcha-container' not found.");
        return null;
      }

      try {
        recaptchaContainer.innerHTML = "";
        window.recaptchaVerifier = new RecaptchaVerifier(
          auth,
          "recaptcha-container",
          {
            size: "invisible",
          }
        );
        return window.recaptchaVerifier;
      } catch (error) {
        console.error("Error initializing RecaptchaVerifier:", error.message);
        return null;
      }
    }
    return window.recaptchaVerifier;
  };

  const sendOTP = async () => {
    setShowLoader(true);
    const PhoneNumber = `${countryCode}${formattedNumber}`;
    if (otp_service_provider === 'twilio') {
      try {
        const response = await getOtpApi.getOtp({ number: PhoneNumber });
        if (response?.data?.error === false) {
          toast.success(t("otpSentSuccess"));
          setResendTimer(60);
        } else {
          toast.error(t("failedToSendOtp"));
        }
      } catch (error) {
        console.error('error', error)
      } finally {
        setShowLoader(false);
      }
    }
    else {
      try {
        const appVerifier = generateRecaptcha();
        const confirmation = await signInWithPhoneNumber(auth, PhoneNumber, appVerifier);
        setConfirmationResult(confirmation);
        toast.success(t("otpSentSuccess"));
        setResendTimer(60);
        if (isDemoMode) {
          setOtp("123456")
        }
      } catch (error) {
        console.log(error)
        const errorCode = error.code;
        handleFirebaseAuthError(errorCode);
      } finally {
        setShowLoader(false);
      }
    }
  };

  const resendOtp = async (e) => {
    e.preventDefault();
    setResendOtpLoader(true);
    const PhoneNumber = `${countryCode}${formattedNumber}`;
    if (otp_service_provider === 'twilio') {
      try {
        const response = await getOtpApi.getOtp({ number: PhoneNumber });
        if (response?.data?.error === false) {
          toast.success(t("otpSentSuccess"));
          setResendTimer(60);
        } else {
          toast.error(t("failedToSendOtp"));
        }
      } catch (error) {
        console.error('error', error)
      } finally {
        setResendOtpLoader(false);
      }
    }
    else {
      try {
        const appVerifier = generateRecaptcha();
        const confirmation = await signInWithPhoneNumber(auth, PhoneNumber, appVerifier);
        setConfirmationResult(confirmation);
        toast.success(t("otpSentSuccess"));
        setResendTimer(60);
        if (isDemoMode) {
          setOtp("123456")
        }
      } catch (error) {
        console.log(error)
        const errorCode = error.code;
        handleFirebaseAuthError(errorCode);
      } finally {
        setResendOtpLoader(false);
      }
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error(t("otpRequired"));
      return;
    }
    setShowLoader(true);
    const PhoneNumber = `${countryCode}${formattedNumber}`;
    if (otp_service_provider === 'twilio') {
      try {
        const response = await verifyOtpApi.verifyOtp({
          number: PhoneNumber,
          otp: otp,
        });
        if (response?.data?.error === false) {
          try {
            const userResponse = await userSignUpApi.userSignup({
              mobile: PhoneNumber,
              fcm_id: fetchFCM ? fetchFCM : "",
              type: "mobile",
            });
            const data = userResponse.data;
            loadUpdateData(data);
            if (data.error === true) {
              toast.error(data.message);
            } else {
              toast.success(data.message);
            }
            OnHide();
          } catch (error) {
            console.error("Error:", error);
          }
        } else {
          toast.error(t("invalidOtp"));
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setShowLoader(false);
      }
    }
    else {
      try {
        const credential = await confirmationResult.confirm(otp);
        const user = credential.user;
        try {
          const response = await userSignUpApi.userSignup({
            mobile: PhoneNumber,
            firebase_id: user?.uid,
            fcm_id: fetchFCM ? fetchFCM : "",
            type: "mobile",
          });
          const data = response.data;
          loadUpdateData(data);
          if (data.error === true) {
            toast.error(data.message);
          } else {
            toast.success(data.message);
          }
          OnHide();
        } catch (error) {
          console.error("Error:", error);
        }
      } catch (error) {
        const errorCode = error.code;
        handleFirebaseAuthError(errorCode);
      } finally {
        setShowLoader(false);
      }
    }
  };

  const handleMobileSubmit = (e) => {
    e.preventDefault();
    if (!number) {
      toast.error(t("mobileRequired"));
      return;
    }
    const PhoneNumber = `${countryCode}${formattedNumber}`;
    if (!isValidPhoneNumber(PhoneNumber)) {
      toast.error(t("invalidMobile"));
      return;
    }
    setIsOTPScreen(true);
    sendOTP();
  };

  const recaptchaClear = async () => {
    if (window.recaptchaVerifier) {
      await window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      try {
        const response = await userSignUpApi.userSignup({
          name: user?.displayName ? user?.displayName : "",
          email: user?.email,
          firebase_id: user?.uid,
          fcm_id: fetchFCM ? fetchFCM : "",
          type: "google",
        });
        const data = response.data;
        loadUpdateData(data);
        if (data.error === true) {
          toast.error(data.message);
        } else {
          toast.success(data.message);
        }
        OnHide();
      } catch (error) {
        console.error("Error:", error);
      }
    } catch (error) {
      const errorCode = error.code;
      handleFirebaseAuthError(errorCode);
    }
  };

  const handleCreateAnAccount = () => {
    OnHide();
    setIsRegisterModalOpen(true);
  };

  const CloseIcon = <div className="close_icon_cont"><MdClose size={24} color="black" /></div>

  return (
    <>
      <Modal
        centered
        open={IsLoginModalOpen}
        closeIcon={CloseIcon}
        colorIconHover="transparent"
        className="ant_register_modal"
        onCancel={OnHide}
        footer={null}
        maskClosable={false}
      >
        {IsLoginScreen && (
          <div className="register_modal">
            <div className="reg_modal_header">
              <h1 className="reg_modal_title">
                {t("loginTo")}
                <span className="brand_name"> {settings?.company_name}</span>
              </h1>
              <p className="signin_redirect">
                {t("newto")} {settings?.company_name}?{" "}
                <span
                  className="main_signin_redirect"
                  onClick={handleCreateAnAccount}
                >
                  {t("createAccount")}
                </span>
              </p>
            </div>

            <form className="auth_form" onSubmit={handleMobileSubmit}>
              <div className="auth_in_cont">
                <label htmlFor="phone" className="auth_label">
                  {t("phoneNumber")}
                </label>
                <PhoneInput
                  country={process.env.NEXT_PUBLIC_DEFAULT_COUNTRY}
                  value={number}
                  onChange={(phone, data) => handleInputChange(phone, data)}
                  onCountryChange={(code) => setCountryCode(code)}
                  inputProps={{
                    name: "phone",
                    required: true,
                    autoFocus: true,
                    ref: numberInputRef,
                  }}
                  enableLongNumbers
                />
              </div>

              <button
                type="submit"
                disabled={showLoader}
                className="verf_email_add_btn"
              >
                {showLoader ? (
                  <div className="loader-container-otp">
                    <div className="loader-otp"></div>
                  </div>
                ) : (
                  t("continue")
                )}
              </button>
            </form>

            {/* {google_authentication === 1 && (
              <>
                <div className="signup_with_cont">
                  <hr className="w-full" />
                  <p>{t("orSignInWith")}</p>
                  <hr className="w-full" />
                </div>

                <button
                  className="reg_with_google_btn"
                  onClick={handleGoogleSignup}
                >
                  <FcGoogle size={24} />
                  {t("google")}
                </button>
              </>
            )} */}

            <div className="auth_modal_footer">
              {t("agreeSignIn")} {settings?.company_name} <br />
              <Link
                href="/terms-and-condition"
                className="link_brand_name"
                onClick={OnHide}
              >
                {t("termsService")}
              </Link>{" "}
              {t("and")}{" "}
              <Link
                href="/privacy-policy"
                className="link_brand_name"
                onClick={OnHide}
              >
                {t("privacyPolicy")}
              </Link>
            </div>
          </div>
        )}

        {IsOTPScreen && (
          <div className="register_modal">
            <div className="reg_modal_header">
              <h1 className="reg_modal_title">{t("verifyOtp")}</h1>
              <p className="signin_redirect">
                {t("sentTo")} {`+${number}`}
              </p>
            </div>
            <form className="auth_form">
              <div className="auth_in_cont">
                <label htmlFor="otp" className="auth_label">
                  {t("otp")}
                </label>
                <input
                  type="text"
                  className="auth_input"
                  placeholder={t("enterOtp")}
                  id="otp"
                  name="otp"
                  value={otp}
                  maxLength="6"
                  onChange={(e) => setOtp(e.target.value)}
                  ref={otpInputRef}
                />
              </div>
              <>
                <button
                  type="submit"
                  disabled={showLoader}
                  className="verf_email_add_btn"
                  onClick={verifyOTP}
                >
                  {showLoader ? (
                    <div className="loader-container-otp">
                      <div className="loader-otp"></div>
                    </div>
                  ) : (
                    t("verify")
                  )}
                </button>

                <button
                  type="submit"
                  className="resend_otp_btn"
                  onClick={resendOtp}
                  disabled={resendTimer > 0}
                  style={{ opacity: resendTimer > 0 ? 0.7 : 1, cursor: resendTimer > 0 ? 'not-allowed' : 'pointer' }}
                >
                  {resendOtpLoader ? (
                    <div className="loader-container-otp">
                      <div className="loader-otp"></div>
                    </div>
                  ) : resendTimer > 0 ? (
                    `${t("resendOtp")} (${resendTimer}s)`
                  ) : (
                    t("resendOtp")
                  )}
                </button>
              </>
            </form>
          </div>
        )}
      </Modal>
      <div id="recaptcha-container"></div>
    </>
  );
};

export default LoginModal;
