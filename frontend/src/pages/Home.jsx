import HeroSection from '../components/Hero/HeroSection'
import AvailableNow from '../components/Sections/AvailableNow'
import BrandStory from '../components/Sections/BrandStory'
import CuratedCollections from '../components/Sections/CuratedCollections'
import FeaturedSpotlight from '../components/Sections/FeaturedSpotlight'
import JournalSection from '../components/Sections/JournalSection'
import NewArrivals from '../components/Sections/NewArrivals'
import PressStrip from '../components/Sections/PressStrip'
import TrustSignals from '../components/Sections/TrustSignals'
import SEO from '../components/SEO/SEO'

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <SEO
        title="Little Essentials - Premium Curated Lifestyle Store India"
        description="Discover premium curated products - skincare, home decor, fragrance and stationery. Handpicked with intention. Free delivery over Rs.999 across India."
        canonical="https://www.littleessentials.in"
        keywords="little essentials, little essentials india, premium lifestyle store india, curated products india, luxury home decor india, premium skincare india"
      />
      <HeroSection />
      <TrustSignals />
      <CuratedCollections />
      <NewArrivals />
      <BrandStory />
      <AvailableNow />
      <JournalSection />
      <FeaturedSpotlight />
      <PressStrip />
    </main>
  )
}
