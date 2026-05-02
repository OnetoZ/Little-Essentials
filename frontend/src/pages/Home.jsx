import HeroSection from '../components/Hero/HeroSection'
import AvailableNow from '../components/Sections/AvailableNow'
import BrandStory from '../components/Sections/BrandStory'
import FeaturedSpotlight from '../components/Sections/FeaturedSpotlight'
import JournalSection from '../components/Sections/JournalSection'
import NewArrivals from '../components/Sections/NewArrivals'
import PressStrip from '../components/Sections/PressStrip'

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <NewArrivals />
      <BrandStory />
      <AvailableNow />
      <JournalSection />
      <FeaturedSpotlight />
      <PressStrip />
    </main>
  )
}
