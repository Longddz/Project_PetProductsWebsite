<template>
  <header class="navbar">
    <div class="navbar-left">
      <router-link to="/" class="logo">Patti.vn</router-link>
    </div>

    <nav class="menu">
      <router-link :to="{ path: '/products', query: { type: 'dogs' }}">Chó</router-link>
      <router-link :to="{ path: '/products', query: { type: 'cats' }}">Mèo</router-link>
      <router-link :to="{ path: '/products', query: { type: 'smart-devices' }}">Thiết bị thông minh</router-link>
      <router-link to="/new-arrivals">Hàng mới về</router-link>
      <router-link v-if="isAdmin" to="/product-management" class="admin-link">Quản lý sản phẩm</router-link>
    </nav>

    <div class="search-bar">
      <input 
        type="text" 
        placeholder="Tìm kiếm sản phẩm..." 
        v-model="localSearchQuery" 
        @keyup.enter="search"
        @input="handleSearchInput"
        @focus="showSuggestions = true"
        @blur="handleBlur"
      />
      <button @click="search" class="search-button">
        <i class="fas fa-search"></i>
      </button>
      <div v-if="showSuggestions && searchQuery.trim()" class="search-suggestions">
        <div v-if="loading" class="suggestion-loading">
          <i class="fas fa-spinner fa-spin"></i> Đang tìm kiếm...
        </div>
        <div v-else-if="suggestions.length === 0" class="no-suggestions">
          Không tìm thấy sản phẩm
        </div>
        <div v-else class="suggestions-list">
          <div 
            v-for="product in suggestions" 
            :key="product._id"
            class="suggestion-item"
            @mousedown="selectProduct(product)"
            @mouseenter="hoveredIndex = suggestions.indexOf(product)"
          >
            <img :src="getImageUrl(product)" :alt="product.productName" />
            <div class="suggestion-info">
              <div class="suggestion-name">{{ product.productName }}</div>
              <div class="suggestion-price">{{ formatPrice(product.productPrice) }}đ</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="navbar-right">
      <router-link to="/login" v-if="!isAuthenticated">Đăng Nhập</router-link>
      <router-link to="/register" v-if="!isAuthenticated">Đăng Ký</router-link>
      <router-link to="/cart" class="cart-icon">
        <i class="fas fa-shopping-cart"></i>
        <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
      </router-link>

      <div v-if="isAuthenticated" class="user-dropdown">
        <button class="dropdown-toggle" @click="toggleDropdown">
          <i class="fas fa-user-circle"></i>
          <span>Tài khoản</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        <div v-if="showDropdown" class="dropdown-menu">
          <router-link to="/profile" class="dropdown-item">
            <i class="fas fa-user"></i> Thông tin người dùng
          </router-link>
          <router-link to="/orders" class="dropdown-item">
            <i class="fas fa-file-invoice"></i> Quản lý hóa đơn
          </router-link>
          <a href="#" @click.prevent="logout" class="dropdown-item">
            <i class="fas fa-sign-out-alt"></i> Đăng xuất
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import axios from 'axios';

export default {
  name: 'Navbar',
  data() {
    return {
      localSearchQuery: "",
      showSuggestions: false,
      suggestions: [],
      loading: false,
      hoveredIndex: -1,
      searchTimeout: null,
      showDropdown: false
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'isAdmin', 'totalQuantity']),
    cartCount() {
      return this.totalQuantity;
    }
  },
  methods: {
    ...mapActions(['logout']),
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    async handleSearchInput() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      
      if (!this.searchQuery.trim()) {
        this.suggestions = [];
        this.showSuggestions = false;
        return;
      }

      this.loading = true;
      this.showSuggestions = true;
      
      this.searchTimeout = setTimeout(async () => {
        try {
          console.log('Searching for:', this.searchQuery); // Debug log
          const response = await axios.get(`http://localhost:5000/api/product/search?name=${encodeURIComponent(this.searchQuery)}`);
          console.log('Search response:', response.data); // Debug log
          
          if (response.data && Array.isArray(response.data)) {
            this.suggestions = response.data.slice(0, 5);
          } else {
            console.error('Invalid response format:', response.data);
            this.suggestions = [];
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          this.suggestions = [];
          if (error.response) {
            console.error('Error response:', error.response.data);
            // Hiển thị thông báo lỗi từ server
            if (error.response.data.message) {
              this.$toast?.error(error.response.data.message);
            }
          }
        } finally {
          this.loading = false;
        }
      }, 300);
    },
    handleBlur() {
      // Tăng thời gian delay để người dùng có thể click vào suggestion
      setTimeout(() => {
        this.showSuggestions = false;
      }, 300);
    },
    selectProduct(product) {
      if (!product || !product._id) {
        console.error('Invalid product:', product);
        return;
      }
      console.log('Selected product:', product); // Debug log
      this.$router.push(`/product/${product._id}`);
      this.searchQuery = '';
      this.showSuggestions = false;
    },
    search() {
      if (this.searchQuery.trim()) {
        console.log('Searching for:', this.searchQuery); // Debug log
        this.$router.push(`/search?name=${encodeURIComponent(this.searchQuery)}`);
        this.showSuggestions = false;
      }
    },
    getImageUrl(product) {
      if (!product) return '/default-product.jpg';
      
      if (!product.imageURL) return '/default-product.jpg';
      
      if (product.imageURL.startsWith('http')) return product.imageURL;
      
      if (product.imageURL.startsWith('/uploads')) {
        return `http://localhost:5000${product.imageURL}`;
      }
      
      return `http://localhost:5000/uploads/${product.imageURL}`;
    },
    formatPrice(price) {
      return Number(price).toLocaleString('vi-VN');
    }
  },
  mounted() {
    // Thêm Font Awesome
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    document.head.appendChild(link);

    // Thêm Google Fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Pacifico&display=swap';
    document.head.appendChild(fontLink);

    // Đóng dropdown khi click ra ngoài
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.user-dropdown')) {
        this.showDropdown = false;
      }
    });
  },
  beforeDestroy() {
    // Xóa event listener khi component bị hủy
    document.removeEventListener('click', this.closeDropdown);
  }
};
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to right, #1a237e, #283593);
  padding: 15px 40px;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-left .logo {
  font-family: 'Pacifico', cursive;
  font-size: 32px;
  font-weight: normal;
  margin-right: 10px;
  color: #ffd700;
  text-decoration: none;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.navbar-left .logo:hover {
  transform: scale(1.05);
  color: #fff7aa;
}

.menu {
  margin-top: 6px;
  display: flex;
  gap: 25px;
  align-items: center;
}

.menu a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  font-size: 15px;
  padding: 16px 2px;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  letter-spacing: 0.3px;
}

.menu a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background-color: #ffd700;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.menu a:hover::after {
  width: 80%;
}

.menu a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  transform: translateY(-2px);
  padding: 16px 10px;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 25px;
  padding: 5px 5px 5px 20px;
  transition: all 0.3s ease;
  max-width: 400px;
  width: 100%;
}

.search-bar:focus-within {
  background-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
}

.search-bar input {
  flex: 1;
  padding: 8px 15px 8px 0;
  border: none;
  background: transparent;
  color: white;
  font-size: 14px;
  font-weight: 500;
  width: calc(100% - 40px);
}

.search-bar input::placeholder {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
}

.search-bar input:focus {
  outline: none;
}

.search-button {
  background: #ffd700 !important;
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  margin-left: 5px;
}

.search-button i {
  color: #1a237e;
  font-size: 14px;
}

.search-button:hover {
  background: #fff7aa !important;
  transform: scale(1.05);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.navbar-right a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 15px;
  border-radius: 20px;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.1);
  font-size: 14px;
  letter-spacing: 0.3px;
}

.navbar-right a:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.cart-icon {
  font-size: 16px !important;
  padding: 8px 12px !important;
  display: flex;
  align-items: center;
  gap: 5px;
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -8px;
  right: -5px;
  background: #ffd700;
  color: #1a237e;
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  padding: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  animation: cartBadgeAppear 0.3s ease-out;
}

@keyframes cartBadgeAppear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.admin-link {
  color: white !important;
  padding: 16px 10px !important;
  border-radius: 20px !important;
  font-weight: 500 !important;
  margin-bottom: 1px;
}

.admin-link:hover {
  transform: translateY(-2px);
}

button {
  background: linear-gradient(to right, #ff4081, #f50057);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  font-size: 14px;
  letter-spacing: 0.3px;
}

button:hover {
  background: linear-gradient(to right, #f50057, #c51162);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 1200px) {
  .navbar {
    padding: 15px 20px;
  }
  
  .menu {
    gap: 15px;
  }
  
  .search-bar {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .navbar {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .menu {
    order: 3;
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .search-bar {
    order: 2;
    max-width: 100%;
    margin: 10px 0;
  }
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: #f5f5f5;
}

.suggestion-item img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
  margin-right: 12px;
}

.suggestion-info {
  flex: 1;
}

.suggestion-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  font-weight: 500;
}

.suggestion-price {
  font-size: 13px;
  color: #e44d26;
  font-weight: 600;
}

.suggestion-loading,
.no-suggestions {
  padding: 15px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.suggestion-loading i {
  margin-right: 8px;
  color: #1a237e;
}

/* Custom scrollbar cho suggestions */
.suggestions-list::-webkit-scrollbar {
  width: 6px;
}

.suggestions-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.suggestions-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.user-dropdown {
  position: relative;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: white;
  padding: 8px 15px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.dropdown-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dropdown-toggle i {
  font-size: 16px;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: rgb(127, 149, 250);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  margin-top: 5px;
  z-index: 1000;
  animation: dropdownFade 0.2s ease;
}

@keyframes dropdownFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  color: #1a237e;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
  color: #1a237e;
}

.dropdown-item i {
  width: 16px;
  color: #1a237e;
}

.dropdown-item:hover i {
  color: #1a237e;
}
</style>
