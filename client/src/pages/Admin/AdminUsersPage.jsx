import { useState, useEffect } from 'react';
import styles from './Admin.module.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Fetching
    setTimeout(() => {
      setUsers([
        { id: 'USR-101', name: 'Admin Root', email: 'admin@shopez.com', role: 'admin', joined: '2025-01-10', status: 'Active' },
        { id: 'USR-102', name: 'TechHub Ltd', email: 'sales@techhub.com', role: 'vendor', joined: '2025-03-22', status: 'Active' },
        { id: 'USR-103', name: 'John Doe', email: 'john@example.com', role: 'customer', joined: '2026-05-11', status: 'Active' },
        { id: 'USR-104', name: 'Spammer Bot', email: 'spam@botnet.xyz', role: 'customer', joined: '2026-06-16', status: 'Banned' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <span className={`${styles.badge} ${styles.badgeError}`}>Admin</span>;
      case 'vendor': return <span className={`${styles.badge} ${styles.badgeInfo}`}>Vendor</span>;
      default: return <span className={`${styles.badge} ${styles.badgeSuccess}`}>Customer</span>;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <h1 className={styles.pageTitle}>User Management</h1>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableToolbar}>
          <input type="text" placeholder="Search users by email..." className={styles.tableSearch} />
          <select className={styles.tableSearch}>
            <option>All Roles</option>
            <option>Admin</option>
            <option>Vendor</option>
            <option>Customer</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className={styles.userCell}>
                        <div className={styles.userAvatar}>{user.name.charAt(0)}</div>
                        <div>
                          <p className={styles.cellTitle}>{user.name}</p>
                          <p className={styles.cellSub}>{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>{user.joined}</td>
                    <td>
                      <span className={`${styles.badge} ${user.status === 'Active' ? styles.badgeSuccess : styles.badgeError}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.btnEdit}>Edit Role</button>
                        {user.status === 'Active' ? (
                          <button className={styles.btnDelete}>Ban</button>
                        ) : (
                          <button className={styles.btnEdit} style={{color: '#059669'}}>Unban</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to 4 of 890 entries</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} disabled>Previous</button>
            <button className={styles.pageBtn}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
