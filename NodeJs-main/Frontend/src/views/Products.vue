<template>
  <div class="products-page">
    <h2>{{ pageTitle }}</h2>
    
    <div class="search-container">
      <div class="search-box">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          v-model="searchQuery" 
          placeholder="Tìm kiếm sản phẩm..."
          @input="handleSearch"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>
    <div v-else-if="error" class="error-message">{{ error }}</div>
    <div v-else-if="filteredProducts.length === 0" class="no-products">
      {{ searchQuery ? 'Không tìm thấy sản phẩm phù hợp' : 'Không có sản phẩm nào thuộc loại này' }}
    </div>
    <div v-else class="products-grid">
      <div v-for="product in filteredProducts" :key="product._id" class="product-card">
        <router-link :to="'/product/' + product._id" class="product-link">
          <img 
            :src="getImageUrl(product)" 
            :alt="product.productName"
            @error="handleImageError"
          />
          <div class="product-info">
            <h3>{{ product.productName }}</h3>
            <p class="price">{{ formatPrice(product.productPrice) }}đ</p>
            <p class="description">{{ truncateDescription(product.productDescription) }}</p>
            <p class="stock">Còn lại: {{ product.productQuantity }} sản phẩm</p>
          </div>
        </router-link>
        <div class="product-actions">
          <button @click="addToCartWithQuantity(product)" class="btn-add-cart" :disabled="product.productQuantity === 0">
            <i class="fas fa-shopping-cart"></i>
            {{ product.productQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapActions } from 'vuex';

export default {
  name: 'Products',
  data() {
    return {
      products: [],
      loading: true,
      error: null,
      searchQuery: ''
    };
  },
  computed: {
    productType() {
      return this.$route.query.type;
    },
    pageTitle() {
      const titles = {
        'dogs': 'Sản phẩm cho Chó',
        'cats': 'Sản phẩm cho Mèo',
        'smart-devices': 'Thiết bị thông minh'
      };
      return titles[this.productType] || 'Sản phẩm';
    },
    filteredProducts() {
      let filtered = this.products.filter(product => product.productType === this.productType);
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
          product.productName.toLowerCase().includes(query) ||
          product.productDescription.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    }
  },
  methods: {
    ...mapActions(['addToCart']),
    async fetchProducts() {
      try {
        this.loading = true;
        console.log('Fetching products...'); // Debug log
        const response = await axios.get('http://localhost:5000/api/product');
        console.log('Products response:', response.data); // Debug log
        this.products = response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        this.error = 'Không thể tải danh sách sản phẩm';
      } finally {
        this.loading = false;
      }
    },
    getImageUrl(product) {
      if (!product?.imageURL) return '/default-product.jpg';
      if (product.imageURL.startsWith('http')) return product.imageURL;
      if (product.imageURL.startsWith('/uploads')) {
        return `http://localhost:5000${product.imageURL}`;
      }
      return `http://localhost:5000/uploads/${product.imageURL}`;
    },
    handleImageError(e) {
      e.target.src = '/default-product.jpg';
    },
    formatPrice(price) {
      return Number(price).toLocaleString('vi-VN');
    },
    truncateDescription(description) {
      if (!description) return '';
      return description.length > 100 
        ? description.substring(0, 100) + '...'
        : description;
    },
    getStockStatus(quantity) {
      if (quantity === 0) return 'Hết hàng';
      if (quantity < 10) return `Chỉ còn ${quantity} sản phẩm`;
      return 'Còn hàng';
    },
    addToCartWithQuantity(product) {
      if (product.productQuantity === 0) return;
      
      const productToAdd = {
        ...product,
        quantity: 1
      };
      
      this.addToCart(productToAdd);
      this.$toast?.success('Đã thêm vào giỏ hàng!');
    },
    handleSearch() {
      // Có thể thêm debounce ở đây nếu cần
      this.fetchProducts();
    }
  },
  async created() {
    await this.fetchProducts();
  },
  watch: {
    '$route.query.type': {
      handler() {
        this.fetchProducts();
      }
    }
  }
};
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}


.products-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #333;
  margin-bottom: 30px;
  text-align: center;
  font-size: 28px;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 20px;
}

.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.product-card img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover img {
  transform: scale(1.05);
}

.product-info {
  flex: 1;
  padding: 20px;
}

.product-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
  font-weight: 600;
}

.price {
  font-size: 20px;
  color: #e44d26;
  font-weight: bold;
  margin: 10px 0;
}

.description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin: 10px 0;
}

.stock {
  color: #4CAF50;
  font-size: 14px;
  font-weight: 500;
}

.low-stock {
  color: #f44336;
}

.product-actions {
  padding: 0 20px 20px;
}

.btn-add-cart {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to right, #1a237e, #283593);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-add-cart:hover:not(:disabled) {
  background: linear-gradient(to right, #283593, #1a237e);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.btn-add-cart:disabled {
  background: #cccccc;
  cursor: not-allowed;
  transform: none;
}

.loading {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.error-message {
  color: #f44336;
  text-align: center;
  padding: 40px;
  font-size: 16px;
}

.no-products {
  text-align: center;
  padding: 40px;
  font-size: 18px;
  color: #666;
}

.product-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
    padding: 10px;
  }

  .product-card img {
    height: 200px;
  }

  .product-info {
    padding: 15px;
  }

  .product-info h3 {
    font-size: 16px;
  }

  .price {
    font-size: 18px;
  }
}

.search-container {
  max-width: 600px;
  margin: 0 auto 30px;
  padding: 0 20px;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-box i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-box input {
  width: 100%;
  padding: 12px 20px 12px 45px;
  border: 2px solid #eee;
  border-radius: 25px;
  font-size: 16px;
  transition: all 0.3s ease;
  font-family: 'Montserrat', sans-serif;
}

.search-box input:focus {
  outline: none;
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
}

.search-box input::placeholder {
  color: #999;
}
</style> 