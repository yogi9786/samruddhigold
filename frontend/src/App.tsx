import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminPanel from './pages/AdminPanel';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import NewArrivals from './pages/NewArrivals';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/siriadmin" element={<AdminPanel />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/shop/:id" element={<ProductDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/new-arrivals" element={<NewArrivals />} />
      </Routes>
    </Router>
  );
}

export default App;

