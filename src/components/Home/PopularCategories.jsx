'use client'
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { RiArrowLeftLine, RiArrowRightLine } from "react-icons/ri";
import { t, useIsRtl } from "@/utils";
import { categoryApi } from "@/utils/api";
import { useDispatch, useSelector } from "react-redux";
import { CategoryData, CurrentPage, LastPage, setCatCurrentPage, setCatLastPage, setCateData } from "@/redux/reuducer/categorySlice";
import { CurrentLanguageData } from "@/redux/reuducer/languageSlice";
import PopularCategoriesSkeleton from "../Skeleton/PopularCategoriesSkeleton";
import PopularCategory from "./PopularCategory";

const PopularCategories = () => {
  const dispatch = useDispatch();
  const swiperRef = useRef();
  const isRtl = useIsRtl();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  
  // Redux state
  const cateData = useSelector(CategoryData);
  const currentPage = useSelector(CurrentPage);
  const lastPage = useSelector(LastPage);
  const CurrentLanguage = useSelector(CurrentLanguageData);
  
  useEffect(() => {
    // Only fetch if we don't have data
    if (cateData.length === 0) {
      getCategoriesData(1);
    } else {
      setIsLoading(false);
    }
  }, [cateData.length]);

  // this api call only in pop cate swiper 
  const getCategoriesData = async (page) => {
    setIsLoadingMore(true);
    try {
      const response = await categoryApi.getCategory({ page: `${page}` });
      const { data } = response.data;
      
      if (data && Array.isArray(data.data)) {
        if (page === 1) {
          dispatch(setCateData(data.data));
        } else {
          // Create a map of existing IDs to detect duplicates
          const existingIds = new Set(cateData.map(cat => cat.id));
          // Filter out duplicates from the new data
          const uniqueNewData = data.data.filter(cat => !existingIds.has(cat.id));
          // Only append unique new data items
          dispatch(setCateData([...cateData, ...uniqueNewData]));
        }
        
        dispatch(setCatLastPage(data.last_page));
        dispatch(setCatCurrentPage(data.current_page));
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleNextPage = useCallback(() => {
    if (currentPage < lastPage) {
      getCategoriesData(currentPage + 1);
    }
    if (swiperRef?.current) swiperRef?.current?.slideNext();
  }, [currentPage, lastPage]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      getCategoriesData(currentPage - 1);
    }
    if (swiperRef?.current) swiperRef?.current?.slidePrev();
  }, [currentPage]);

  const handleLoadMore = useCallback(() => {
    if (currentPage < lastPage && !isLoadingMore) {
      getCategoriesData(currentPage + 1);
    }
  }, [currentPage, lastPage, isLoadingMore]);

  const handleSlideChange = useCallback((swiper) => {
    setIsEnd(swiper.isEnd);
    setIsBeginning(swiper.isBeginning);
    if (swiper.isEnd) {
      handleLoadMore();
    }
  }, [handleLoadMore]);

  const breakpoints = {
    0: { slidesPerView: 1 },
    320: { slidesPerView: 3 },
    400: { slidesPerView: 3 },
    576: { slidesPerView: 4 },
    768: { slidesPerView: 5 },
    992: { slidesPerView: 7 },
    1200: { slidesPerView: 8 },
    1400: { slidesPerView: 9 }
  };

  return isLoading ? (
    <PopularCategoriesSkeleton />
  ) : (
    <div className="container main_padding">
      {cateData?.length > 0 && (
        <>
          <div className="row mrg_btm">
            <div className="col-12">
              <div className="pop_cat_header">
                <h4 className="pop_cat_head">{t("popularCategories")}</h4>

                <div className="pop_cat_arrow">
                  <button
                    className={`pop_cat_btns ${
                      isBeginning && "PagArrowdisabled"
                    }`}
                    onClick={handlePrevPage}
                  >
                    <RiArrowLeftLine size={24} color="white" />
                  </button>
                  <button
                    className={`pop_cat_btns ${isEnd && "PagArrowdisabled"}`}
                    onClick={handleNextPage}
                  >
                    <RiArrowRightLine size={24} color="white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <Swiper
                dir={isRtl ? "rtl" : "ltr"}
                spaceBetween={30}
                slidesPerView={9}
                onSlideChange={handleSlideChange}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                  setIsEnd(swiper?.isEnd);
                  setIsBeginning(swiper?.isBeginning);
                }}
                breakpoints={breakpoints}
                className="popular_cat_slider"
                key={isRtl}
              >
                {cateData?.map((ele, index) => (
                  <SwiperSlide key={index}>
                    <PopularCategory data={ele} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PopularCategories;