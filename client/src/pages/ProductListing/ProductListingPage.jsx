import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard/ProductCard';
import styles from './ProductListingPage.module.css';

const ProductListingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Parse initial query params
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState(''); // E.g., '0-5000', '5000-10000'
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // Sync internal state if URL changes externally (e.g., clicking Navbar links)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlCategory = params.get('category') || '';
    const urlSearch = params.get('search') || '';
    
    if (urlCategory !== category) {
      setCategory(urlCategory);
      setPage(1);
    }
    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
      setPage(1);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Map sort frontend values to backend values
        let backendSort = '-createdAt'; // newest
        if (sort === 'price_asc') backendSort = 'basePrice';
        if (sort === 'price_desc') backendSort = '-basePrice';
        if (sort === 'rating_desc') backendSort = '-avgRating';
        if (sort === 'relevance' && searchTerm) backendSort = '';

        // Extract min and max price from string 'min-max'
        let minPrice = undefined;
        let maxPrice = undefined;
        if (priceRange) {
          const [min, max] = priceRange.split('-');
          minPrice = Number(min) * 100; // Convert rupees to paise
          maxPrice = max === '+' ? undefined : Number(max) * 100;
        }

        const res = await api.get('/products', {
          params: {
            q: searchTerm || undefined,
            category: category || undefined,
            'basePrice[gte]': minPrice,
            'basePrice[lte]': maxPrice,
            sort: backendSort,
            page,
            limit: 12
          }
        });

        const mappedProducts = res.data.data.map(p => ({
          id: p._id,
          slug: p.slug,
          name: p.name,
          price: `₹${(p.basePrice / 100).toLocaleString('en-IN')}`,
          rawPrice: p.basePrice / 100, // Numeric value for cart
          oldPrice: p.salePrice ? `₹${(p.salePrice / 100).toLocaleString('en-IN')}` : null,
          rating: p.avgRating || 4.5,
          reviews: p.reviewCount || Math.floor(Math.random() * 100) + 10,
          img: p.images[0],
          badge: p.isFeatured ? 'Featured' : null,
        }));

        setProducts(mappedProducts);
        setTotalPages(res.data.meta.totalPages || 1);
        setTotalResults(res.data.meta.total || 0);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    // Update URL to reflect current state silently
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (category) params.set('category', category);
    navigate({ search: params.toString() }, { replace: true });

    // Debounce API calls slightly
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, category, sort, priceRange, page, navigate]);

  return (
    <div className={styles.pageLayout}>
      
      {/* ── Top Toolbar (Amazon Style) ──────────────────────────────────────── */}
      <div className={styles.topToolbar}>
        <div className={styles.toolbarGroup}>
          <input 
            type="text" 
            placeholder="Search all departments..." 
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            aria-label="Search products"
          />
        </div>

        <div className={styles.toolbarGroup}>
          <select 
            className={styles.filterSelect} 
            value={category} 
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion & Apparel</option>
            <option value="home">Home & Living</option>
          </select>

          <select 
            className={styles.filterSelect} 
            value={priceRange} 
            onChange={(e) => { setPriceRange(e.target.value); setPage(1); }}
            aria-label="Filter by price range"
          >
            <option value="">Any Price</option>
            <option value="0-5000">Under ₹5,000</option>
            <option value="5000-20000">₹5,000 - ₹20,000</option>
            <option value="20000-50000">₹20,000 - ₹50,000</option>
            <option value="50000-+">Over ₹50,000</option>
          </select>

          <select 
            className={styles.filterSelect} 
            value={sort} 
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            aria-label="Sort products"
          >
            <option value="relevance">Sort by: Relevance</option>
            <option value="newest">Sort by: Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Avg. Customer Review</option>
          </select>
        </div>
      </div>

      {/* ── Main Content Area ─────────────────────────────────────────────── */}
      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <h1 className={styles.pageTitle}>
            {searchTerm ? `Results for "${searchTerm}"` : category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'All Products'}
          </h1>
          <span className={styles.resultCount}>Showing 1-{products.length} of {totalResults} results</span>
        </div>

        {/* Product Grid (Full Width 4-2-1) */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: '#6b7280' }}>
            Loading amazing products...
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '1.2rem', color: '#6b7280' }}>
            No products match your current filters. Try adjusting your search!
          </div>
        ) : (
          <div className={styles.productGrid}>
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              disabled={page === 1}
              onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              &larr; Previous Page
            </button>
            <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
            <button 
              className={styles.pageBtn} 
              disabled={page === totalPages}
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Next Page &rarr;
            </button>
          </div>
        )}
      </main>

    </div>
  );
};

export default ProductListingPage;
