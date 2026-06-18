import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';

/**
 * The main structural layout for customer-facing pages.
 * Contains the shared Navbar and Footer.
 */
const MainLayout = () => {
  const { user } = useContext(AuthContext);

  // Strict Segregation: Admins must never see customer shopping pages after login.
  if (user && user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#fcfcfd' }}>
      
      <Navbar />

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1536px', margin: '0 auto', padding: '0 4%', boxSizing: 'border-box' }}>
        {/* Renders the child route matched by React Router */}
        <Outlet />
      </main>

      <Footer />

    </div>
  );
};

export default MainLayout;
