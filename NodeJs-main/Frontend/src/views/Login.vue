<template>
  <div class="login-container">
    <h2>Đăng nhập</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label>Email:</label>
        <input v-model="email" type="email" required />
      </div>
      <div class="form-group">
        <label>Mật khẩu:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
      </button>
    </form>
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: 'Login',
  data() {
    return {
      email: "",
      password: "",
      error: "",
      loading: false
    };
  },
  methods: {
    ...mapActions(["login"]),
    async handleLogin() {
      this.loading = true;
      this.error = "";
      
      try {
        const loginResponse = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: this.email, password: this.password }),
        });

        const loginData = await loginResponse.json();
        console.log('Login Response:', loginData); // Debug

        if (!loginResponse.ok) {
          throw new Error(loginData.message || 'Đăng nhập thất bại');
        }

        if (!loginData.token) {
          throw new Error('Token không hợp lệ');
        }

        // Lưu token
        localStorage.setItem('token', loginData.token);

        // Parse JWT token để lấy thông tin user
        const tokenParts = loginData.token.split('.');
        const tokenPayload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', tokenPayload); // Debug

        // Lưu thông tin user vào store
        const userToStore = {
          id: tokenPayload.id,
          email: this.email,
          role: tokenPayload.role || 'user'
        };

        console.log('User to store:', userToStore); // Debug

        // Lưu vào store
        await this.login(userToStore);

        // Kiểm tra role và chuyển hướng
        console.log('User role:', userToStore.role); // Debug
        
        if (userToStore.role === 'admin') {
          console.log('Redirecting to product management'); // Debug
          await this.$router.push("/product-management");
        } else {
          await this.$router.push("/");
        }
      } catch (err) {
        console.error('Login error:', err);
        this.error = err.message || 'Có lỗi xảy ra khi đăng nhập';
      } finally {
        this.loading = false;
      }
    },
  },
  // Nếu đã đăng nhập thì chuyển hướng
  created() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      if (user.role === 'admin') {
        this.$router.push('/product-management');
      } else {
        this.$router.push('/');
      }
    }
  }
};
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.login-container {
  max-width: 400px;
  margin: 40px auto;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

input {
  width: 95%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

.error-message {
  color: #f44336;
  margin-top: 10px;
  text-align: center;
}
</style>
