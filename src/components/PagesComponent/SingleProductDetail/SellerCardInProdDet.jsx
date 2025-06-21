'use client'
import { userSignUpData } from "@/redux/reuducer/authSlice"
import { toggleLoginModal } from "@/redux/reuducer/globalStateSlice"
import { saveOfferData } from "@/redux/reuducer/offerSlice"
import { extractYear, isLogin, placeholderImage, t } from "@/utils"
import { itemOfferApi, sendWhatsAppMessageApi } from "@/utils/api"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import toast from "react-hot-toast"
import { BiPhoneCall } from "react-icons/bi"
import { FaArrowRight } from "react-icons/fa6"
import { IoMdStar } from "react-icons/io"
import { IoChatboxEllipsesOutline, IoCartOutline } from "react-icons/io5"
import { MdVerifiedUser } from "react-icons/md"
import { useSelector } from "react-redux"
import Swal from "sweetalert2"

const SellerCardInProdDet = ({ productData, systemSettingsData }) => {
    const router = useRouter()
    const userData = productData && productData?.user
    const placeholder_image = systemSettingsData?.data?.data?.placeholder_image
    const [IsSendingMessage, setIsSendingMessage] = useState(false)
    const loggedInUser = useSelector(userSignUpData)

    const memberSinceYear = userData?.created_at ? extractYear(userData.created_at) : '';

    const handleBuyNow = async () => {
        if (!isLogin()) {
            toggleLoginModal(true)
            return;
        }

        if (!loggedInUser?.mobile) {
            toast.error(t("pleaseAddPhoneNumber"))
            router.push('/profile')
            return;
        }

        try {
            setIsSendingMessage(true)
            const response = await sendWhatsAppMessageApi.sendMessage({
                phone_number: userData?.mobile,
                product_name: productData?.name,
                buyer_phone: loggedInUser?.mobile
            });

            if (response?.data?.error === false) {
                toast.success(t("messageSentToSeller"))
            } else {
                toast.error(response?.data?.message || t("failedToSendMessage"))
            }
        } catch (error) {
            console.error(error)
            toast.error(t("failedToSendMessage"))
        } finally {
            setIsSendingMessage(false)
        }
    }

    return (
        <div className="user_profile_card card">
            {
                (userData?.is_verified === 1 || memberSinceYear) &&
                <div className="seller_verified_cont">
                    {
                        userData?.is_verified === 1 &&
                        <div className="verfied_cont">
                            <MdVerifiedUser size={16} />
                            <p className="verified_text">{t('verified')}</p>
                        </div>
                    }
                    {
                        memberSinceYear &&
                        <p className="member_since">
                            {t('memberSince')}: {memberSinceYear}
                        </p>
                    }
                </div>
            }
            <Link href={`/seller/${productData?.user_id}`} className="card-body">
                <div className="profile_sec">
                    <Image loading='lazy' src={userData?.profile !== null ? userData?.profile : placeholder_image} alt='profile' className="profImage" width={80} height={80} onErrorCapture={placeholderImage} />
                    <div className="user_details">
                        <span className="user_name" title={userData?.name} >
                            {userData?.name}
                        </span>
                        <div className="seller_Rating_cont">
                            {
                                productData?.user?.reviews_count > 0 && productData?.user?.average_rating &&
                                <>
                                    <IoMdStar size={16} />
                                    <p className="seller_rating">{Math.round(productData?.user?.average_rating)} | {productData?.user?.reviews_count} {t('ratings')}</p>
                                </>
                            }
                        </div>
                        {
                            productData?.user?.show_personal_details === 1 && productData?.user?.email &&
                            <a href={`mailto:${productData?.user?.email}`} className="seller_rating">
                                {productData?.user?.email}
                            </a>
                        }
                    </div>
                </div>
                <FaArrowRight size={24} className="arrow_right" />
            </Link>
            <div className="card-footer">
                <button 
                    disabled={IsSendingMessage} 
                    className='buyNowBtn' 
                    onClick={handleBuyNow}
                >
                    <span><IoCartOutline size={20} /></span>
                    {IsSendingMessage ? <span>{t('sending')}</span> : <span>{t('buyNow')}</span>}
                </button>
                {
                    productData?.user?.show_personal_details === 1 && productData?.user?.mobile &&
                    <a href={`tel:${productData?.user?.mobile}`} className='chatBtn'>
                        <BiPhoneCall size={21} />
                        <span>{t('call')}</span>
                    </a>
                }
            </div>
        </div>
    )
}

export default SellerCardInProdDet