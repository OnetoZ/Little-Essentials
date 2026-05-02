import { create } from 'zustand'
import { useToast } from './useToast'

const useStore = create((set, get) => ({
  cartItems: [],
  cartOpen: false,

  addToCart: (product) => {
    const quantity = product.qty ?? 1
    const existing = get().cartItems.find((item) => item.id === product.id)

    if (existing) {
      set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + quantity }
            : item,
        ),
      }))
    } else {
      set((state) => ({
        cartItems: [...state.cartItems, { ...product, qty: quantity }],
      }))
    }

    useToast.getState().show('Added to bag ✓', 'success')
  },

  removeFromCart: (id) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    }))
    useToast.getState().show('Item removed', 'info')
  },

  updateQty: (id, qty) => {
    set((state) => ({
      cartItems:
        qty < 1
          ? state.cartItems.filter((item) => item.id !== id)
          : state.cartItems.map((item) =>
              item.id === id ? { ...item, qty } : item,
            ),
    }))

    if (qty < 1) {
      useToast.getState().show('Item removed', 'info')
    }
  },

  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),

  cartTotal: () =>
    get().cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
  cartCount: () => get().cartItems.reduce((sum, item) => sum + item.qty, 0),

  wishlist: [],
  toggleWishlist: (id) => {
    const adding = !get().wishlist.includes(id)

    set((state) => ({
      wishlist: state.wishlist.includes(id)
        ? state.wishlist.filter((item) => item !== id)
        : [...state.wishlist, id],
    }))

    if (adding) {
      useToast.getState().show('Saved to wishlist ♡', 'success')
    }
  },

  mobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}))

export default useStore
