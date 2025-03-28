<template>
  <div class="image-content">
    <img src="@/assets/banner.jpg" alt="Banner" class="banner-image" />
  </div>
  <div class="home">
    <h1 class="title">Tổng Quan</h1>
    <div v-if="loading" class="loading">Đang tải sản phẩm...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="products-grid">
      <div v-for="product in products" :key="product._id" class="product-card">
        <img :src="`http://localhost:5000${product.imageURL}`" :alt="product.productName" class="product-image">
        <div class="product-info">
          <h3>{{ product.productName }}</h3>
          <p class="description">{{ product.productDescription }}</p>
          <p class="price">{{ formatPrice(product.productPrice) }} VNĐ</p>
          <p class="stock">Còn lại: {{ product.productQuantity }} sản phẩm</p>
          <div class="actions">
            <router-link :to="`/product/${product._id}`" class="view-details">Xem chi tiết</router-link>
            <button @click="addToCart(product)" class="add-to-cart">Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    </div>
    <p v-if="!loading && !products.length" class="no-products">Không có sản phẩm nào</p>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import axios from "axios";

export default {
  data() {
    return {
      products: [],
      loading: false,
      error: null,
    };
  },
  methods: {
    ...mapActions(["addToCart"]),
    async fetchProducts() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:5000/api/product');
        if (response.data) {
          this.products = response.data;
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        this.error = 'Không thể tải danh sách sản phẩm';
      } finally {
        this.loading = false;
      }
    },
    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN').format(price);
    }
  },
  created() {
    this.fetchProducts();
  },
};
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.home {
  padding: 20px;
}

.banner-image {
    max-width: 100%;
    max-height: 100%;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-content {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
}


.title {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s;
  background: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  margin: 0 0 10px;
  font-size: 1.2em;
  color: #333;
}

.description {
  color: #666;
  margin-bottom: 10px;
  font-size: 0.9em;
  height: 40px;
  overflow: hidden;
}

.price {
  font-size: 1.2em;
  color: #e44d26;
  font-weight: bold;
  margin: 10px 0;
}

.stock {
  color: #28a745;
  font-size: 0.9em;
  margin-bottom: 10px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.view-details, .add-to-cart {
  flex: 1;
  padding: 8px 15px;
  border-radius: 5px;
  text-align: center;
  text-decoration: none;
  font-size: 0.9em;
  cursor: pointer;
}

.view-details {
  background-color: #007bff;
  color: white;
}

.add-to-cart {
  background-color: #28a745;
  color: white;
  border: none;
}

.add-to-cart:hover {
  background-color: #218838;
}

.loading, .error, .no-products {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  color: #dc3545;
}
</style>
  