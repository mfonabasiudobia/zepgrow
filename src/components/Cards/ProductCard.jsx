"use client";
import Image from "next/image";
import { FaRegHeart } from "react-icons/fa";
import {
  formatDate,
  formatPriceAbbreviated,
  placeholderImage,
  t,
} from "@/utils";
import { BiBadgeCheck } from "react-icons/bi";
import { FaHeart } from "react-icons/fa6";
import { manageFavouriteApi } from "@/utils/api";
import toast from "react-hot-toast";
import { userSignUpData } from "../../redux/reuducer/authSlice";
import { useSelector } from "react-redux";
import { toggleLoginModal } from "@/redux/reuducer/globalStateSlice";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";

const ProductCard = ({ data, handleLike, showManageButtons = false }) => {
  const [IsLiked, setIsLiked] = useState(data?.is_liked);
  const [IsLikeLoading, setIsLikeLoading] = useState(false);
  const userData = useSelector(userSignUpData);
  const dispatch = useDispatch();

  const handleLikeClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLogin()) {
      dispatch(toggleLoginModal(true));
      return;
    }
    setIsLikeLoading(true);
    try {
      const res = await manageFavouriteApi.manageFavourite({
        item_id: data?.id,
      });
      if (res?.data?.error === false) {
        setIsLiked(!IsLiked);
        handleLike(data?.id);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  return (
    <div className="product_card">
      <div className="position-relative">
        <Image
          src={data?.image}
          width={220}
          height={190}
          alt="Product"
          className="product_card_prod_img"
          onErrorCapture={placeholderImage}
        />
        {data?.is_feature && (
          <div className="product_card_featured_cont">
            <BiBadgeCheck size={16} color="white" />
            <p className="product_card_featured">{t("featured")}</p>
          </div>
        )}
        <div className="product_card_like_cont">
          {IsLikeLoading ? (
            <div className="loader"></div>
          ) : (
            <button onClick={handleLikeClick}>
              {IsLiked ? (
                <FaHeart size={16} color="#FF3B30" />
              ) : (
                <FaRegHeart size={16} />
              )}
            </button>
          )}
        </div>
      </div>
      <div className="product_card_content">
        <div className="product_card_title">
          <h3>{data?.name}</h3>
          <p>{data?.category?.name}</p>
        </div>
        <div className="product_card_price">
          <h4>
            {data?.discounted_price ? (
              <>
                <span className="discounted_price">
                  {formatPriceAbbreviated(data?.price)}
                </span>
                <span>{formatPriceAbbreviated(data?.discounted_price)}</span>
              </>
            ) : (
              <span>{formatPriceAbbreviated(data?.price)}</span>
            )}
          </h4>
          <p>{formatDate(data?.created_at)}</p>
        </div>
        {showManageButtons && (
          <div className="product_card_actions">
            <Link
              href={`/edit-listing/${data?.slug}`}
              className="edit_btn"
              onClick={(e) => e.stopPropagation()}
            >
              {t("edit")}
            </Link>
            <Link
              href={`/my-listing/${data?.slug}`}
              className="manage_btn"
              onClick={(e) => e.stopPropagation()}
            >
              {t("manage")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
