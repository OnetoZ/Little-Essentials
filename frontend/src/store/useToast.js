import { create } from 'zustand'

export const useToast = create((set) => ({
  toasts: [],
  show: (message, type = 'success', duration = 3000) => {
    const id = Date.now()

    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }))
    }, duration)
  },
  dismiss: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
}))
