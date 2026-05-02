import HeroSection from '../components/Hero/HeroSection'
import RevealOnScroll from '../components/UI/RevealOnScroll'
import SectionHeader from '../components/UI/SectionHeader'

function HomeSections() {
  return (
    <>
      <section className="bg-cream px-8 py-24 lg:px-16">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeader
            number="01"
            label="New Arrivals"
            viewAllLink="/collections?filter=new"
          />
          <RevealOnScroll>
            <div className="flex h-[400px] items-center justify-center rounded-[8px] bg-cappuccino/30">
              <p className="font-dm text-sm text-caramel">
                Product cards — Day 03 & 04
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="bg-espresso py-0">
        <RevealOnScroll>
          <div className="flex h-[480px] items-center justify-center">
            <p className="font-dm text-sm text-caramel">
              Brand Story Strip — Day 04
            </p>
          </div>
        </RevealOnScroll>
      </section>

      <section className="bg-cream px-8 py-24 lg:px-16">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeader
            number="02"
            label="Available Now"
            viewAllLink="/collections"
          />
          <RevealOnScroll>
            <div className="flex h-[400px] items-center justify-center rounded-[8px] bg-cappuccino/30">
              <p className="font-dm text-sm text-caramel">
                Editorial grid — Day 04
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="bg-cappuccino px-8 py-24 lg:px-16">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeader number="03" label="The Journal" />
          <RevealOnScroll>
            <div className="flex h-[360px] items-center justify-center rounded-[8px] bg-cream/25">
              <p className="font-dm text-sm text-mocha">
                Journal cards — Day 04
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      <section className="bg-cream px-8 py-24 lg:px-16">
        <div className="mx-auto max-w-screen-xl">
          <SectionHeader number="04" label="Featured This Week" />
          <RevealOnScroll>
            <div className="flex h-[500px] items-center justify-center rounded-[8px] bg-cappuccino/30">
              <p className="font-dm text-sm text-caramel">
                Featured spotlight — Day 04
              </p>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </>
  )
}

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <HeroSection />
      <HomeSections />
    </main>
  )
}
