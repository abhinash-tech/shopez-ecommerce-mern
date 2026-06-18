import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import styles from './DashboardLayout.module.css';

const DashboardLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.dashboardContainer}>
      
      {/* ── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <div className={styles.logoSection}>
          <Link to="/" className={styles.logo}>ShopEZ Admin</Link>
        </div>

        <nav className={styles.navMenu}>
          <NavLink 
            to="/admin/dashboard" 
            end
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <span className={styles.icon}>📊</span> Dashboard
          </NavLink>
          <NavLink 
            to="/admin/products" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <span className={styles.icon}>📦</span> Products
          </NavLink>
          <NavLink 
            to="/admin/orders" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <span className={styles.icon}>🛒</span> Orders
          </NavLink>
          <NavLink 
            to="/admin/users" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}
          >
            <span className={styles.icon}>👥</span> Users
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <span className={styles.icon}>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <div className={styles.mainArea}>
        
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.searchBar}>
            <input type="text" placeholder="Search anything..." />
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.iconBtn}>🔔</button>
            <div className={styles.adminProfile}>
              <div className={styles.avatar}>{user?.name?.charAt(0) || 'A'}</div>
              <div className={styles.adminInfo}>
                <span className={styles.adminName}>{user?.name || 'Admin'}</span>
                <span className={styles.adminRole}>Super Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className={styles.content}>
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
