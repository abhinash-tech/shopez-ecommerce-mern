import { useState, useEffect } from 'react';
import api from '../../services/api';
import styles from './Admin.module.css';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (err) {
      console.error('Failed to delete user', err);
      alert('Error deleting customer');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <h1 className={styles.pageTitle}>Customer Management</h1>
      </div>

      <div className={styles.tableContainer}>
        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No customers found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div className={styles.productCell}>
                        <div className={styles.productImg} style={{ borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className={styles.cellTitle}>{user.name}</p>
                          <p className={styles.cellSub}>ID: {user._id}</p>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeSuccess : styles.badgeInfo}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.btnEdit} style={{color: '#6b7280'}}>View</button>
                        {user.role !== 'admin' && (
                          <button className={styles.btnDelete} onClick={() => handleDelete(user._id)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
