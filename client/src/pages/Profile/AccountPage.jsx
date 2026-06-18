import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import styles from './Profile.module.css';

const AccountPage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.pageTitle}>Profile Details</h1>
      
      <div className={styles.card}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className={styles.userInfo}>
            <h2>{user?.name || 'Guest User'}</h2>
            <p className={styles.roleBadge}>{user?.role || 'Customer'}</p>
          </div>
        </div>

        <form className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label>Full Name</label>
            <input type="text" defaultValue={user?.name || ''} />
          </div>
          <div className={styles.inputGroup}>
            <label>Email Address</label>
            <input type="email" defaultValue={user?.email || ''} readOnly className={styles.readOnly} />
          </div>
          <div className={styles.inputGroup}>
            <label>Phone Number</label>
            <input type="tel" placeholder="+91 9876543210" />
          </div>
          
          <div className={styles.formActions}>
            <button type="button" className={styles.saveBtn}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPage;
