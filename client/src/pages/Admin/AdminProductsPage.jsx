import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Admin.module.css';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('Error deleting product');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active': return styles.badgeSuccess;
      case 'pending_approval': return styles.badgeWarning;
      case 'out_of_stock': return styles.badgeError;
      default: return styles.badgeInfo;
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <h1 className={styles.pageTitle}>Manage Products</h1>
        <button className={styles.addBtn} onClick={() => navigate('/admin/products/add')}>+ Add Product</button>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableToolbar}>
          <input 
            type="text" 
            placeholder="Search products by name or SKU..." 
            className={styles.tableSearch} 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Product Info</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Loading...</td></tr>
              ) : filteredProducts.length === 0 ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No products found.</td></tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td>
                      <div className={styles.productCell}>
                        <img src={product.images?.[0] || 'https://via.placeholder.com/40'} alt={product.name} className={styles.productImg} />
                        <div>
                          <p className={styles.cellTitle}>{product.name}</p>
                          <p className={styles.cellSub}>SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{fontWeight: 600}}>₹{product.basePrice?.toLocaleString('en-IN')}</td>
                    <td>{product.stockQuantity}</td>
                    <td>
                      <span className={`${styles.badge} ${getStatusBadge(product.status)}`}>
                        {product.status || 'draft'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionBtns}>
                        <button className={styles.btnDelete} onClick={() => handleDelete(product._id)}>Delete</button>
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

export default AdminProductsPage;
