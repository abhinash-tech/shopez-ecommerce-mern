import { NavLink, Outlet } from 'react-router-dom';
import styles from './Profile.module.css';

const ProfileLayout = () => {
  return (
    <div className={styles.profileLayout}>
      
      {/* ── Sidebar Navigation ────────────────────────────────────────────── */}
      <aside className={styles.sidebar}>
        <h2 className={styles.sidebarTitle}>My Account</h2>
        <nav className={styles.navMenu}>
          <NavLink 
            to="/dashboard/profile" 
            end
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
          >
            Profile Details
          </NavLink>
          
          <NavLink 
            to="/dashboard/profile/orders" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
          >
            Order History
          </NavLink>
          
          <NavLink 
            to="/dashboard/profile/wishlist" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
          >
            My Wishlist
          </NavLink>
          
          <NavLink 
            to="/dashboard/profile/addresses" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
          >
            Saved Addresses
          </NavLink>
          
          <NavLink 
            to="/dashboard/profile/settings" 
            className={({ isActive }) => isActive ? `${styles.navItem} ${styles.activeNavItem}` : styles.navItem}
          >
            Settings
          </NavLink>
        </nav>
      </aside>

      {/* ── Main Content Area (Outlet) ────────────────────────────────────── */}
      <main className={styles.mainContent}>
        <Outlet />
      </main>

    </div>
  );
};

export default ProfileLayout;
