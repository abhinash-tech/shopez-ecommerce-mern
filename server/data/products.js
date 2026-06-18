const products = [
  // Electronics
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    slug: 'sony-wh-1000xm5',
    description: 'Industry leading noise canceling headphones with Auto NC Optimizer.',
    basePrice: 2990000,
    stockQuantity: 50,
    sku: 'ELEC-SONY-001',
    category: 'electronics', // Will be replaced with ObjectId in seeder
    brand: 'Sony',
    images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Apple MacBook Pro M3',
    slug: 'apple-macbook-pro-m3',
    description: 'The most advanced Mac ever with the M3 chip.',
    basePrice: 15990000, 
    stockQuantity: 25,
    sku: 'ELEC-AAPL-002',
    category: 'electronics',
    brand: 'Apple',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    slug: 'samsung-galaxy-s24-ultra',
    description: 'Galaxy AI is here. Welcome to the era of mobile AI.',
    basePrice: 12999900,
    stockQuantity: 40,
    sku: 'ELEC-SAMS-003',
    category: 'electronics',
    brand: 'Samsung',
    images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Dell XPS 15 Laptop',
    slug: 'dell-xps-15',
    description: 'Stunning 15.6-inch OLED display packed into a 14-inch footprint.',
    basePrice: 14500000,
    stockQuantity: 15,
    sku: 'ELEC-DELL-004',
    category: 'electronics',
    brand: 'Dell',
    images: ['https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Logitech MX Master 3S',
    slug: 'logitech-mx-master-3s',
    description: 'An iconic mouse remastered for ultimate tactility.',
    basePrice: 999900,
    stockQuantity: 100,
    sku: 'ELEC-LOGI-005',
    category: 'electronics',
    brand: 'Logitech',
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Keychron K2 Mechanical Keyboard',
    slug: 'keychron-k2',
    description: 'A versatile wireless mechanical keyboard tailored for Mac and Windows.',
    basePrice: 750000,
    stockQuantity: 60,
    sku: 'ELEC-KEYC-006',
    category: 'electronics',
    brand: 'Keychron',
    images: ['https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Apple Watch Series 9',
    slug: 'apple-watch-series-9',
    description: 'Smarter. Brighter. Mightier. Double tap gesture.',
    basePrice: 4190000,
    stockQuantity: 30,
    sku: 'ELEC-AAPL-007',
    category: 'electronics',
    brand: 'Apple',
    images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },

  // Fashion
  {
    name: 'Classic White Sneakers',
    slug: 'classic-white-sneakers',
    description: 'Minimalist white sneakers for everyday wear.',
    basePrice: 350000,
    stockQuantity: 120,
    sku: 'FASH-NIKE-001',
    category: 'fashion',
    brand: 'Nike',
    images: ['https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Denim Trucker Jacket',
    slug: 'denim-trucker-jacket',
    description: 'Vintage wash denim jacket with classic fit.',
    basePrice: 450000,
    stockQuantity: 45,
    sku: 'FASH-LEVI-002',
    category: 'fashion',
    brand: 'Levi\'s',
    images: ['https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Leather Messenger Bag',
    slug: 'leather-messenger-bag',
    description: 'Handcrafted full-grain leather messenger bag.',
    basePrice: 850000,
    stockQuantity: 20,
    sku: 'FASH-FOSS-003',
    category: 'fashion',
    brand: 'Fossil',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Polarized Aviator Sunglasses',
    slug: 'polarized-aviator-sunglasses',
    description: 'Classic aviator frames with polarized lenses.',
    basePrice: 1200000,
    stockQuantity: 75,
    sku: 'FASH-RAYB-004',
    category: 'fashion',
    brand: 'Ray-Ban',
    images: ['https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Cotton Crewneck T-Shirt',
    slug: 'cotton-crewneck-tshirt',
    description: 'Premium organic cotton everyday tee.',
    basePrice: 120000,
    stockQuantity: 200,
    sku: 'FASH-UNIQ-005',
    category: 'fashion',
    brand: 'Uniqlo',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Slim Fit Chinos',
    slug: 'slim-fit-chinos',
    description: 'Comfort stretch slim fit chino pants.',
    basePrice: 250000,
    stockQuantity: 80,
    sku: 'FASH-GAP-006',
    category: 'fashion',
    brand: 'Gap',
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Running Shoes X-Speed',
    slug: 'running-shoes-x-speed',
    description: 'Lightweight performance running shoes.',
    basePrice: 550000,
    stockQuantity: 65,
    sku: 'FASH-ADID-007',
    category: 'fashion',
    brand: 'Adidas',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },

  // Home & Living
  {
    name: 'Ceramic Coffee Mug Set',
    slug: 'ceramic-coffee-mug-set',
    description: 'Set of 4 artisan ceramic coffee mugs.',
    basePrice: 180000,
    stockQuantity: 40,
    sku: 'HOME-MUGS-001',
    category: 'home',
    brand: 'HomeGoods',
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Linen Duvet Cover',
    slug: 'linen-duvet-cover',
    description: '100% French flax linen king size duvet cover.',
    basePrice: 1100000,
    stockQuantity: 15,
    sku: 'HOME-LINN-002',
    category: 'home',
    brand: 'Brooklinen',
    images: ['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Aromatherapy Diffuser',
    slug: 'aromatherapy-diffuser',
    description: 'Ultrasonic essential oil diffuser with ambient light.',
    basePrice: 220000,
    stockQuantity: 50,
    sku: 'HOME-DIFF-003',
    category: 'home',
    brand: 'Muji',
    images: ['https://picsum.photos/seed/diffuser/600/600'],
    isApproved: true
  },
  {
    name: 'Monstera Deliciosa Plant',
    slug: 'monstera-deliciosa-plant',
    description: 'Live indoor tropical plant in ceramic pot.',
    basePrice: 350000,
    stockQuantity: 25,
    sku: 'HOME-PLNT-004',
    category: 'home',
    brand: 'The Sill',
    images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80'],
    isApproved: true
  },
  {
    name: 'Woven Storage Basket',
    slug: 'woven-storage-basket',
    description: 'Handwoven seagrass storage basket.',
    basePrice: 150000,
    stockQuantity: 90,
    sku: 'HOME-BASK-005',
    category: 'home',
    brand: 'IKEA',
    images: ['https://picsum.photos/seed/basket/600/600'],
    isApproved: true
  },
  {
    name: 'Cast Iron Skillet',
    slug: 'cast-iron-skillet',
    description: 'Pre-seasoned 10.25-inch cast iron skillet.',
    basePrice: 280000,
    stockQuantity: 45,
    sku: 'HOME-IRON-006',
    category: 'home',
    brand: 'Lodge',
    images: ['https://picsum.photos/seed/skillet/600/600'],
    isApproved: true
  }
];

module.exports = products;
