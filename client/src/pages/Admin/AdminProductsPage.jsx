import { useState, useEffect } from 'react';
import styles from './Admin.module.css';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock Fetching
    setTimeout(() => {
      setProducts([
        { id: 'PRD-01', name: 'Sony WH-1000XM5', price: 29900, stock: 45, status: 'Active', isApproved: true, vendor: 'TechHub Ltd' },
        { id: 'PRD-02', name: 'Apple Watch Series 9', price: 41900, stock: 12, status: 'Active', isApproved: true, vendor: 'iStore' },
        { id: 'PRD-03', name: 'Unknown Brand Smart Ring', price: 5900, stock: 100, status: 'Pending', isApproved: false, vendor: 'GadgetZone' },
        { id: 'PRD-04', name: 'Nike Air Max 270', price: 12995, stock: 0, status: 'Out of Stock', isApproved: true, vendor: 'Nike Official' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Active': return styles.badgeSuccess;
      case 'Pending': return styles.badgeWarning;
      case 'Out of Stock': return styles.badgeError;
      default: return styles.badgeInfo;
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <h1 className={styles.pageTitle}>Manage Products</h1>
        <button className={styles.addBtn}>+ Add Product</button>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableToolbar}>
          <input type="text" placeholder="Search products..." className={styles.tableSearch} />
          <select className={styles.tableSearch}>
            <option>All Statuses</option>
            <option>Active</option>
            <option>Pending Approval</option>
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Vendor</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product.id}>
                    <td>
                      <div className={styles.productCell}>
                        <div className={styles.productImg}></div>
                        <div>
                          <p className={styles.cellTitle}>{product.name}</p>
                          <p className={styles.cellSub}>ID: {product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td>{product.vendor}</td>
                    <td style={{fontWeight: 600}}>₹{product.price.toLocaleString('en-IN')}</td>
                    <td>{product.stock}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadge(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.btnEdit}>Edit</button>
                        {!product.isApproved && <button className={styles.btnEdit} style={{color: '#059669'}}>Approve</button>}
                        <button className={styles.btnDelete}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to 4 of 4 entries</span>
          <div className={styles.pageControls}>
            <button className={styles.pageBtn} disabled>Previous</button>
            <button className={styles.pageBtn} disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
