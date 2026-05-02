import SEO from '../components/SEO/SEO'

export default function Cart() {
  return (
    <main className="min-h-screen bg-cream px-6 pt-24">
      <SEO
        title="Cart"
        description="Review your Little Essentials shopping bag."
        canonical="https://www.littleessentials.in/cart"
        noIndex
      />
      <h1 className="font-playfair text-[32px] font-bold text-espresso">
        Cart
      </h1>
      <p className="mt-3 font-dm text-sm text-mocha">
        Your shopping bag opens from the navigation.
      </p>
    </main>
  )
}
