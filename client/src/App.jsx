import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts & Guards (Keep static since they wrap everything)
import MainLayout from './layouts/MainLayout';
import ProfileLayout from './pages/Profile/ProfileLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './routes/ProtectedRoute';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home/Home'));
const ProductListingPage = lazy(() => import('./pages/ProductListing/ProductListingPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetail/ProductDetailPage'));
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'));
const CartPage = lazy(() => import('./pages/Cart/CartPage'));
const CheckoutPage = lazy(() => import('./pages/Checkout/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccess/OrderSuccessPage'));

// Profile Pages
const DashboardHome = lazy(() => import('./pages/Dashboard/DashboardHome'));
const AccountPage = lazy(() => import('./pages/Profile/AccountPage'));
const OrdersPage = lazy(() => import('./pages/Profile/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/Profile/OrderDetailPage'));
const WishlistPage = lazy(() => import('./pages/Profile/WishlistPage'));

// Admin Pages
const AdminDashboardPage = lazy(() => import('./pages/Admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/Admin/AdminProductsPage'));
const AdminAddProductPage = lazy(() => import('./pages/Admin/AdminAddProductPage'));
const AdminOrdersPage = lazy(() => import('./pages/Admin/AdminOrdersPage'));
const AdminUsersPage = lazy(() => import('./pages/Admin/AdminUsersPage'));

// Placeholder Pages
const Unauthorized = () => <h1>403 - Forbidden</h1>;
const NotFound = () => <h1>404 - Page Not Found</h1>;

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit' }}><h2>Loading...</h2></div>}>
            <Routes>
              {/* Main Layout Wraps Public Store Pages */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<ProductListingPage />} />
                <Route path="products/:slug" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="order-success" element={<OrderSuccessPage />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Customer Routes (Dashboard) */}
              <Route element={<ProtectedRoute requiredRoles={['customer']} />}>
                <Route path="/dashboard" element={<MainLayout />}>
                  <Route index element={<DashboardHome />} />
                  <Route path="profile" element={<ProfileLayout />}>
                    <Route index element={<AccountPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="orders/:id" element={<OrderDetailPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Protected Admin Routes */}
              <Route element={<ProtectedRoute requiredRoles={['admin', 'super_admin']} />}>
                <Route path="/admin" element={<DashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route path="products/add" element={<AdminAddProductPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Route>
              </Route>

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
