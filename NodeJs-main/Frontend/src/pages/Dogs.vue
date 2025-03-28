<template>
    <div class="products-page">
      <h1>Sản phẩm</h1>
      <div class="content">
        <!-- Sidebar: Danh mục sản phẩm -->
        <aside class="sidebar">
          <h3>Loại Sản Phẩm</h3>
          <ul>
            <li v-for="category in categories" :key="category.name">
              <input type="checkbox" :id="category.name" v-model="selectedCategories" :value="category.name" />
              <label :for="category.name">{{ category.name }} ({{ category.count }})</label>
            </li>
          </ul>
        </aside>
  
        <!-- Danh sách sản phẩm -->
        <div class="product-list">
          <div class="filters">
            <select v-model="sortOrder">
              <option value="asc">Giá tăng dần</option>
              <option value="desc">Giá giảm dần</option>
            </select>
          </div>
          <div class="products">
            <div v-if="loading" class="loading">Đang tải dữ liệu...</div>
            <div v-else-if="error" class="error">{{ error }}</div>
            <div v-else-if="products.length === 0" class="no-products">Không có sản phẩm nào</div>
            <div v-else class="product" v-for="product in filteredProducts" :key="product._id">
              <img 
                :src="getImageUrl(product)"
                :alt="product.productName"
                @error="handleImageError"
                class="product-image"
              />
              <h2>{{ product.productName || 'Chưa có tên' }}</h2>
              <p class="price">{{ formatPrice(product.productPrice) }}đ</p>
              <p class="description">{{ product.productDescription || 'Chưa có mô tả' }}</p>
              <p class="quantity">Còn lại: {{ product.productQuantity || 0 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";

  // Tạo instance axios với cấu hình mặc định
  const api = axios.create({
    baseURL: 'http://localhost:5000',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });

  export default {
    data() {
      return {
        products: [],
        categories: [],
        selectedCategories: [],
        sortOrder: "asc",
        loading: true,
        error: null
      };
    },
    computed: {
      filteredProducts() {
        try {
          if (!this.products || !Array.isArray(this.products)) {
            return [];
          }

          let filtered = [...this.products];
          
          if (this.selectedCategories.length) {
            filtered = filtered.filter(p => 
              p && 
              p.productType && 
              this.selectedCategories.includes(p.productType)
            );
          }

          return filtered.sort((a, b) => {
            const priceA = Number(a?.productPrice) || 0;
            const priceB = Number(b?.productPrice) || 0;
            return this.sortOrder === "asc" ? priceA - priceB : priceB - priceA;
          });
        } catch (error) {
          console.error('Lỗi khi lọc sản phẩm:', error);
          return [];
        }
      },
    },
    methods: {
      getImageUrl(product) {
        if (!product || !product.imageURL) {
          return '/default-product.jpg';
        }
        try {
          // Nếu imageURL là đường dẫn tương đối, thêm baseURL
          if (product.imageURL.startsWith('/')) {
            return `http://localhost:5000${product.imageURL}`;
          }
          // Nếu imageURL là đường dẫn đầy đủ, sử dụng trực tiếp
          if (product.imageURL.startsWith('http')) {
            return product.imageURL;
          }
          // Trường hợp còn lại, thêm /uploads/
          return `http://localhost:5000/uploads/${product.imageURL}`;
        } catch (error) {
          console.error('Lỗi xử lý đường dẫn hình ảnh:', error);
          return '/default-product.jpg';
        }
      },
      handleImageError(e) {
        console.log('Image load error:', e);
        e.target.src = '/default-product.jpg';
      },
      formatPrice(price) {
        if (!price || isNaN(price)) return '0';
        try {
          return Number(price).toLocaleString('vi-VN');
        } catch (error) {
          console.error('Lỗi format giá:', error);
          return '0';
        }
      },
      async fetchProducts() {
        try {
          this.loading = true;
          this.error = null;
          
          const response = await api.get('/api/product');
          
          if (!response || !response.data) {
            throw new Error('Không có dữ liệu từ server');
          }

          const products = Array.isArray(response.data) ? response.data : [];
          
          // Lọc sản phẩm loại Dogs
          this.products = products.filter(product => 
            product && 
            product.productType && 
            product.productType.toLowerCase() === "dogs"
          );

          // Tạo danh sách categories từ products đã lọc
          if (this.products.length > 0) {
            const types = [...new Set(this.products.map(p => p.productType))];
            this.categories = types.map(type => ({
              name: type,
              count: this.products.filter(p => p.productType === type).length
            }));
          } else {
            this.categories = [];
          }

        } catch (error) {
          console.error("Lỗi khi tải dữ liệu:", error);
          this.error = error.response?.data?.message || "Không thể tải dữ liệu sản phẩm. Vui lòng thử lại sau.";
          this.products = [];
          this.categories = [];
        } finally {
          this.loading = false;
        }
      }
    },
    async created() {
      await this.fetchProducts();
    },
  };
  </script>
  
  <style scoped>
  .products-page {
    padding: 20px;
  }
  .content {
    display: flex;
    gap: 20px;
  }
  .sidebar {
    width: 250px;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
  }
  .product-list {
    flex-grow: 1;
  }
  .products {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    padding: 20px 0;
  }
  .product {
    border: 1px solid #ddd;
    padding: 15px;
    border-radius: 8px;
    background: white;
    transition: transform 0.2s;
  }
  .product:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  .product img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
  }
  .product h2 {
    margin: 10px 0;
    font-size: 1.2em;
  }
  .price {
    color: #e53935;
    font-weight: bold;
    font-size: 1.1em;
  }
  .description {
    color: #666;
    margin: 8px 0;
  }
  .quantity {
    color: #2196f3;
    font-size: 0.9em;
  }
  .loading, .error, .no-products {
    grid-column: 1 / -1;
    text-align: center;
    padding: 20px;
    background: #f5f5f5;
    border-radius: 8px;
  }
  .error {
    color: #e53935;
  }
  .filters {
    margin-bottom: 20px;
  }
  select {
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #ddd;
  }
  .product-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 4px;
    background-color: #f5f5f5;
  }
  </style>
  