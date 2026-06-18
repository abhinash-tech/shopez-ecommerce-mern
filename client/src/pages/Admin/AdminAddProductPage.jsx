import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import styles from './Admin.module.css';

const AdminAddProductPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    basePrice: '',
    stockQuantity: '',
    image: '',
    avgRating: '0',
    status: 'active'
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data.data);
        if (res.data.data.length > 0) {
          setFormData(prev => ({ ...prev, category: res.data.data[0]._id }));
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Could not load categories.');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const productPayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        basePrice: Number(formData.basePrice),
        stockQuantity: Number(formData.stockQuantity),
        images: [formData.image],
        avgRating: Number(formData.avgRating),
        sku: `SKU-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        status: formData.status
      };

      await api.post('/products', productPayload);
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerActions}>
        <h1 className={styles.pageTitle}>Add New Product</h1>
        <button className={styles.btnSecondary} onClick={() => navigate('/admin/products')}>Cancel</button>
      </div>

      <div className={styles.formContainer}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.adminForm}>
          <div className={styles.formGroup}>
            <label>Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} required>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Price (₹)</label>
              <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} required min="1" />
            </div>

            <div className={styles.formGroup}>
              <label>Stock Quantity</label>
              <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleChange} required min="0" />
            </div>

            <div className={styles.formGroup}>
              <label>Rating (0-5)</label>
              <input type="number" name="avgRating" value={formData.avgRating} onChange={handleChange} min="0" max="5" step="0.1" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Product Image URL</label>
            <input type="url" name="image" value={formData.image} onChange={handleChange} required placeholder="https://example.com/image.jpg" />
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.addBtn} disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProductPage;
