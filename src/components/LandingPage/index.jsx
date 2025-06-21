'use client'
import AnythingYouWant from './AnythingYouWant'
import WorkProcess from './WorkProcess'
import OurBlogs from './OurBlogs'
import QuickAnswers from './QuickAnswers'
import PopularCategories from '../Home/PopularCategories'

const LandingPage = () => {
  return (
    <>
      <AnythingYouWant />
      <div style={{ marginTop: "100px" }}>
        <PopularCategories />
      </div>
      <WorkProcess />
      <OurBlogs />
      <QuickAnswers />
    </>
  )
}

export default LandingPage
