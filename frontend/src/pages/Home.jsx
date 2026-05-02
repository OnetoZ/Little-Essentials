export default function Home() {
  return (
    <main className="min-h-screen bg-cream">
      <section className="flex min-h-[64vh] items-center justify-center bg-espresso px-6 pt-20 text-center text-cream">
        <div>
          <p className="font-dm text-xs font-medium uppercase tracking-ultra text-caramel">
            Little Essentials
          </p>
          <h1 className="mt-4 font-playfair text-5xl font-bold leading-tight md:text-7xl">
            Home
          </h1>
        </div>
      </section>
      <section className="min-h-[60vh] bg-cream-light px-6 py-16">
        <p className="mx-auto max-w-2xl text-center font-dm text-sm text-mocha">
          Premium commerce foundation ready for Day 02.
        </p>
      </section>
    </main>
  )
}
