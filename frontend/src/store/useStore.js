import { create } from 'zustand'

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
  },

  removeFromCart: (id) =>
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== id),
    })),

  updateQty: (id, qty) =>
    set((state) => ({
      cartItems:
        qty < 1
          ? state.cartItems.filter((item) => item.id !== id)
          : state.cartItems.map((item) =>
              item.id === id ? { ...item, qty } : item,
            ),
    })),

  toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),

  cartTotal: () =>
    get().cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
  cartCount: () => get().cartItems.reduce((sum, item) => sum + item.qty, 0),

  wishlist: [],
  toggleWishlist: (id) =>
    set((state) => ({
      wishlist: state.wishlist.includes(id)
        ? state.wishlist.filter((item) => item !== id)
        : [...state.wishlist, id],
    })),

  mobileMenuOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen })),
  closeMobileMenu: () => set({ mobileMenuOpen: false }),
}))

export default useStore
