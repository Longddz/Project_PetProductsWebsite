<template>
  <div class="product-management">
    <h2>Quản lý sản phẩm</h2>
    
    <!-- Form thêm/sửa sản phẩm -->
    <div class="product-form">
      <h3>{{ isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới' }}</h3>
      <form @submit.prevent="handleSubmit" enctype="multipart/form-data">
        <div class="form-group">
          <label>Tên sản phẩm:</label>
          <input v-model="productData.productName" type="text" required />
        </div>
        
        <div class="form-group">
          <label>Loại sản phẩm:</label>
          <select v-model="productData.productType" required>
            <option value="dogs">Chó</option>
            <option value="cats">Mèo</option>
            <option value="smart-devices">Thiết bị thông minh</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Giá:</label>
          <input v-model.number="productData.productPrice" type="number" min="0" required />
        </div>
        
        <div class="form-group">
          <label>Mô tả:</label>
          <textarea v-model="productData.productDescription" required></textarea>
        </div>
        
        <div class="form-group">
          <label>Số lượng:</label>
          <input v-model.number="productData.productQuantity" type="number" min="0" required />
        </div>
        
        <div class="form-group">
          <label>Hình ảnh:</label>
          <input 
            type="file" 
            @change="handleImageChange" 
            accept="image/*"
            :required="!isEditing"
          />
          <img 
            v-if="imagePreview" 
            :src="imagePreview" 
            class="image-preview" 
            alt="Preview"
          />
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Thêm mới') }}
          </button>
          <button type="button" @click="resetForm" class="btn-secondary">
            Hủy
          </button>
        </div>
      </form>
    </div>

    <!-- Danh sách sản phẩm -->
    <div class="product-list">
      <h3>Danh sách sản phẩm</h3>
      <div v-if="loading" class="loading">Đang tải...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else class="products-grid">
        <div v-for="product in products" :key="product._id" class="product-card">
          <img 
            :src="product.imageURL.startsWith('http') ? product.imageURL : `http://localhost:5000${product.imageURL}`" 
            :alt="product.productName"
          />
          <div class="product-info">
            <h4>{{ product.productName }}</h4>
            <p class="price">{{ formatPrice(product.productPrice) }}</p>
            <p class="quantity">Còn lại: {{ product.productQuantity }}</p>
            <p class="type">Loại: {{ product.productType }}</p>
          </div>
          <div class="product-actions">
            <button @click="editProduct(product)" class="btn-edit">
              Sửa
            </button>
            <button @click="confirmDelete(product._id)" class="btn-delete">
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { mapGetters } from 'vuex';

export default {
  name: 'ProductManagement',
  data() {
    return {
      products: [],
      productData: {
        productName: '',
        productType: '',
        productPrice: '',
        productDescription: '',
        productQuantity: '',
      },
      imageFile: null,
      imagePreview: null,
      isEditing: false,
      editingId: null,
      loading: false,
      error: null
    };
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'isAdmin']),
    token() {
      return localStorage.getItem('token');
    }
  },
  methods: {
    async fetchProducts() {
      try {
        this.loading = true;
        const response = await axios.get('http://localhost:5000/api/product');
        this.products = response.data;
      } catch (error) {
        console.error('Error fetching products:', error);
        this.error = 'Không thể tải danh sách sản phẩm';
      } finally {
        this.loading = false;
      }
    },

    handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.imageFile = file;
        this.imagePreview = URL.createObjectURL(file);
      }
    },

    async handleSubmit() {
      try {
        this.loading = true;
        const formData = new FormData();
        
        // Thêm các trường dữ liệu vào formData
        Object.keys(this.productData).forEach(key => {
          if (this.productData[key] !== '') {
            formData.append(key, this.productData[key]);
          }
        });

        // Thêm file hình ảnh nếu có
        if (this.imageFile) {
          formData.append('file', this.imageFile);
        }

        const config = {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${this.token}`
          }
        };

        if (this.isEditing) {
          // Cập nhật sản phẩm
          await axios.put(
            `http://localhost:5000/api/product/${this.editingId}`,
            formData,
            config
          );
        } else {
          // Thêm sản phẩm mới
          await axios.post(
            'http://localhost:5000/api/product',
            formData,
            config
          );
        }

        // Reset form và tải lại danh sách
        this.resetForm();
        await this.fetchProducts();
      } catch (error) {
        console.error('Error saving product:', error);
        this.error = error.response?.data?.message || 'Có lỗi xảy ra khi lưu sản phẩm';
      } finally {
        this.loading = false;
      }
    },

    editProduct(product) {
      this.isEditing = true;
      this.editingId = product._id;
      this.productData = { ...product };
      this.imagePreview = product.imageURL.startsWith('http') 
        ? product.imageURL 
        : `http://localhost:5000${product.imageURL}`;
      window.scrollTo(0, 0);
    },

    async confirmDelete(productId) {
      if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        try {
          this.loading = true;
          await axios.delete(`http://localhost:5000/api/product/${productId}`, {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          });
          await this.fetchProducts();
        } catch (error) {
          console.error('Error deleting product:', error);
          this.error = 'Không thể xóa sản phẩm';
        } finally {
          this.loading = false;
        }
      }
    },

    resetForm() {
      this.productData = {
        productName: '',
        productType: '',
        productPrice: '',
        productDescription: '',
        productQuantity: '',
      };
      this.imageFile = null;
      this.imagePreview = null;
      this.isEditing = false;
      this.editingId = null;
      this.error = null;
    },

    formatPrice(price) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price);
    }
  },
  async created() {
    if (!this.isAuthenticated || !this.isAdmin) {
      this.$router.push('/');
      return;
    }
    await this.fetchProducts();
  }
};
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.product-management {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-form {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.image-preview {
  max-width: 200px;
  max-height: 200px;
  margin-top: 10px;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #f44336;
  color: white;
}

.btn-primary:hover {
  background-color: #45a049;
}

.btn-secondary:hover {
  background-color: #da190b;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-info h4 {
  margin: 0 0 10px 0;
  font-size: 16px;
}

.price {
  color: #e44d26;
  font-weight: bold;
  margin: 5px 0;
}

.quantity {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.type {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.product-actions {
  display: flex;
  gap: 10px;
  padding: 15px;
  border-top: 1px solid #eee;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-edit {
  background-color: #2196F3;
  color: white;
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.btn-edit:hover {
  background-color: #1976D2;
}

.btn-delete:hover {
  background-color: #da190b;
}

.loading {
  text-align: center;
  padding: 20px;
  font-size: 18px;
  color: #666;
}

.error-message {
  color: #f44336;
  text-align: center;
  padding: 20px;
  font-size: 16px;
}

h2 {
  color: #333;
  margin-bottom: 20px;
}

h3 {
  color: #666;
  margin-bottom: 15px;
}
</style> 