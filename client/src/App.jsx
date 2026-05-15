import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import CustomOrder from './pages/CustomOrder';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import ScrollToTop from './components/ScrollToTop';

import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Cart from './pages/Cart';
import InteractiveBackground from './components/ui/InteractiveBackground';

function App() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <InteractiveBackground />
          <Navbar />
          <main className="flex-grow pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/custom" element={<CustomOrder />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
