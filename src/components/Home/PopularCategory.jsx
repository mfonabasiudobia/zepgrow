// 'use client'
// import Image from 'next/image'
// import { placeholderImage, t } from '@/utils'
// import { useSelector } from 'react-redux'
// import { getCityData } from '@/redux/reuducer/locationSlice'
// import toast from 'react-hot-toast'
// import { useRouter } from 'next/navigation'

// const PopularCategory = ({ data }) => {
//     const router = useRouter();
//     const cityData = useSelector(getCityData);

//     const handleCategoryClick = (e) => {
//         e.preventDefault();
//         if (!cityData?.city) {
//             toast.error(t('pleaseAddYourLocation'));
//             return;
//         }
//         router.push(`/category/${data?.slug}`);
//     };

//     return (
//         <a href={`/category/${data?.slug}`} onClick={handleCategoryClick} className='pop_cat_cont'>
//             <div className="pop_cat_icon_cont">
//                 <Image src={data?.image} width={65} height={58.5} alt='Category Icon' className='pop_cat_icon' onErrorCapture={placeholderImage} />
//             </div>
//             <h6 className='pop_cat_name'>{data?.translated_name}</h6>
//         </a>
//     )
// }

// export default PopularCategory


'use client'
import Image from 'next/image'
import { placeholderImage, t } from '@/utils'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import LocationModal from '@/components/LandingPage/LocationModal'

const PopularCategory = ({ data }) => {
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCategoryClick = (e) => {
        e.preventDefault();
        setIsModalOpen(true);
    };

    const handleLocationSelected = () => {
        router.push(`/category/${data?.slug}?withRange=true`);
    };

    return (
        <>
            <a href={`/category/${data?.slug}`} onClick={handleCategoryClick} className='pop_cat_cont'>
                <div className="pop_cat_icon_cont">
                    <Image src={data?.image} width={65} height={58.5} alt='Category Icon' className='pop_cat_icon' onErrorCapture={placeholderImage} />
                </div>
                <h6 className='pop_cat_name'>{data?.translated_name}</h6>
            </a>
            <LocationModal
                IsLocationModalOpen={isModalOpen}
                OnHide={() => setIsModalOpen(false)}
                onLocationSelected={handleLocationSelected}
            />
        </>
    )
}

export default PopularCategory