# Little Essentials — Premium Curated Lifestyle Store

<div align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-FF0055?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <img src="https://img.shields.io/badge/Zustand-State-orange?style=for-the-badge" alt="Zustand" />
</div>

<br />

> **Little Essentials** is a premium, curated lifestyle e-commerce frontend built with React, Vite, and TailwindCSS. Every pixel is designed with intentionality — quiet luxury, editorial aesthetics, and buttery smooth interactions.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🛍️ **Product Catalogue** | Browseable collection with category filter, sort, and dual-grid view |
| 🎨 **Editorial Design** | Playfair Display + DM Sans typography, custom colour tokens, micro-animations |
| 🛒 **Cart System** | Persistent cart via Zustand with animated cart drawer |
| 💳 **Checkout Flow** | 3-step checkout (Info → Shipping → Payment) with real-time validation |
| 📖 **Journal** | Editorial blog with category filter, featured article, and article detail view |
| 🌿 **About Page** | Immersive brand story with parallax hero, stats, and values section |
| 📦 **Order Tracking** | Live order status with timeline UI |
| 🔐 **Auth UI** | Login/Register with Google & Apple SSO placeholders |
| ♿ **Accessibility** | ARIA labels, skip-to-content, keyboard navigation, focus management |
| 📱 **Fully Responsive** | Mobile-first design, works on all screen sizes |
| 🎭 **Animations** | Page transitions, scroll-triggered reveals, parallax, hover effects |

---

## 🗂️ Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── components/
│   │   ├── Cart/        # CartDrawer — slide-in cart panel
│   │   ├── Footer/      # Footer with newsletter + links
│   │   ├── Hero/        # Full-viewport parallax hero
│   │   ├── Navbar/      # Sticky navbar with scroll-aware style
│   │   ├── Product/     # Gallery, Info, Related products
│   │   ├── ProductCard/ # Grid + skeleton loading cards
│   │   ├── SEO/         # Meta tags, Open Graph, JSON-LD
│   │   ├── Sections/    # Home page sections
│   │   └── UI/          # Button, Toast, RevealOnScroll, etc.
│   ├── data/
│   │   └── mockProducts.js  # Sample product catalogue (12 items)
│   ├── hooks/           # Custom React hooks
│   ├── pages/
│   │   ├── About.jsx        # Brand story, values, parallax hero
│   │   ├── Cart.jsx         # Shopping bag page
│   │   ├── Checkout.jsx     # 3-step checkout with validation
│   │   ├── Collections.jsx  # Product grid with filter + sort
│   │   ├── Home.jsx         # Landing page
│   │   ├── InfoPage.jsx     # FAQs, Shipping, Returns, etc.
│   │   ├── Journal.jsx      # Editorial blog + article detail
│   │   ├── Login.jsx        # Sign in / Create account
│   │   ├── NotFound.jsx     # 404 page
│   │   ├── OrderTracking.jsx # Order status timeline
│   │   └── ProductDetail.jsx # Product page with gallery
│   ├── store/
│   │   └── useStore.js  # Zustand cart + UI state
│   └── utils/
│       └── sanitize.js  # Input sanitisation helpers
├── index.html
├── tailwind.config.js
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd Little-Essentials/frontend

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

---

## 🔧 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite development server with HMR |
| `npm run build` | Build optimised production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint checks |

---

## 🎨 Design System

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `espresso` | `#3B2A22` | Primary dark, headings |
| `mocha` | `#6B4C3B` | Secondary dark, CTAs |
| `caramel` | `#B88C64` | Accent, underlines, badges |
| `cappuccino` | `#C9A882` | Borders, dividers |
| `cream` | `#F3E9D7` | Background, light text |

### Typography

| Font | Role | Source |
|---|---|---|
| **Playfair Display** | Headings, logos | Google Fonts |
| **DM Sans** | Body, UI, labels | Google Fonts |

---

## 📄 Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/` | Home | Hero, new arrivals, brand story, journal teaser |
| `/about` | About | Brand story, values, team, stats |
| `/collections` | Collections | Product grid with filter/sort |
| `/product/:id` | Product Detail | Gallery, info, add to cart, related |
| `/journal` | Journal | Editorial blog index |
| `/journal/:slug` | Article | Individual journal article |
| `/cart` | Cart | Shopping bag (drawer-based) |
| `/checkout` | Checkout | 3-step checkout flow |
| `/login` | Login | Sign in / Create account |
| `/order/:id/track` | Order Tracking | Order status & timeline |
| `/contact` | Contact | Get in touch |
| `/faqs` | FAQs | Frequently asked questions |
| `/shipping` | Shipping | Shipping policy |
| `/returns` | Returns | Returns policy |
| `/privacy` | Privacy | Privacy policy |
| `/terms` | Terms | Terms of service |

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 18 | UI framework |
| [Vite](https://vitejs.dev) | 5 | Build tool & dev server |
| [TailwindCSS](https://tailwindcss.com) | 3 | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | 11 | Animations & page transitions |
| [Zustand](https://zustand-demo.pmnd.rs) | 4 | Global state (cart, UI) |
| [React Router](https://reactrouter.com) | 6 | Client-side routing |
| [Lucide React](https://lucide.dev) | latest | Icon system |
| [PropTypes](https://www.npmjs.com/package/prop-types) | 15 | Runtime type checking |

---

## 🌐 Deployment

The project is configured for both **Netlify** and **Vercel**:

```toml
# netlify.toml — Handles client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

```json
// vercel.json — Handles client-side routing
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

### Deploy to Netlify

```bash
npm run build
# Drag & drop the `dist/` folder to Netlify, or connect the Git repo
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

---

## 📝 Environment Variables

```env
# .env.example
VITE_API_URL=https://api.littleessentials.in
VITE_SITE_URL=https://www.littleessentials.in
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📜 License

© 2026 Little Essentials. All rights reserved. Made with intention in India. 🇮🇳
