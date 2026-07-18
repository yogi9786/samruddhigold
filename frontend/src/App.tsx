import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import AdminPanel from './pages/admin';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import NewArrivals from './pages/NewArrivals';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import VirtualShopping from './pages/VirtualShopping';
import Checkout from './pages/Checkout';
import Shipping from './pages/Shipping';
import { ErrorBoundary } from './components/ErrorBoundary';
import PageLoader from './components/PageLoader';
import GoldRates from './pages/GoldRates';
import Account from './pages/Account';
import Success from './pages/Success';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <>
      {loading && <PageLoader onFinished={() => setLoading(false)} />}
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/siriadmin" element={
            <ErrorBoundary>
              <AdminPanel />
            </ErrorBoundary>
          } />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/:id" element={<ProductDetails />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/virtual-shopping" element={<VirtualShopping />} />
          <Route path="/gold-rates" element={<GoldRates />} />
          <Route path="/account" element={<Account />} />
          <Route path="/success/:orderId" element={<Success />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;

