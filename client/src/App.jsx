import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CustomOrder from './pages/CustomOrder';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import Policies from './pages/Policies';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppWidget from './components/ui/WhatsAppWidget';

import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import Cart from './pages/Cart';
// InteractiveBackground removed — replaced by CSS grid texture in hero

function App() {
  // Referral handling: parse ref param and store in cookie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      const expires = new Date();
      expires.setDate(expires.getDate() + 30);
      document.cookie = `tork3d_ref=${encodeURIComponent(ref)}; expires=${expires.toUTCString()}; path=/`;
    }
  }, []);

  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Toaster 
            position="bottom-right"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white',
              duration: 3000,
            }} 
          />
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-orange focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content" className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/custom" element={<CustomOrder />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/policies" element={<Policies />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <WhatsAppWidget />
          <Footer />
        </div>
      </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
