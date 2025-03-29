<template>
  <div class="register-container">
    <h2>Đăng ký</h2>
    <form @submit.prevent="register">
      <div class="form-group">
        <label>Tên người dùng:</label>
        <input type="text" v-model="userName" required />
      </div>

      <div class="form-group">
        <label>Email:</label>
        <input type="email" v-model="email" required />
      </div>

      <div class="form-group">
        <label>Mật khẩu:</label>
        <input type="password" v-model="password" required />
      </div>

      <div class="form-group">
        <label>Chọn vai trò:</label>
        <select v-model="role">
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div v-if="role === 'admin'" class="form-group">
        <label>Admin Code:</label>
        <input type="password" v-model="adminCode" required />
      </div>

      <button type="submit">Đăng ký</button>
    </form>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: 'Register',
  data() {
    return {
      userName: "", 
      email: "",
      password: "",
      role: "user",
      adminCode: "",
      errorMessage: "",
    };
  },
  methods: {
    async register() {
      try {
        const payload = {
          userName: this.userName, 
          email: this.email,
          password: this.password,
          role: this.role,
        };

        if (this.role === "admin") {
          payload.adminCode = this.adminCode;
        }

        const response = await axios.post("http://localhost:5000/api/auth/register", payload);

        if (response.status === 200) {
          alert("Đăng ký thành công!");
          this.$router.push("/login");
        }
      } catch (error) {
        if (error.response) {
          this.errorMessage = error.response.data.msg || error.response.data.message || "Lỗi khi đăng ký";
        } else {
          this.errorMessage = "Lỗi kết nối đến server";
        }
      }
    },
  },
};
</script>

<style scoped>
* {
  font-family: 'Montserrat', sans-serif;
}

.register-container {
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

input, select {
  width: 95%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

select {
  width: 100%;
  background-color: white;
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
  margin-top: 10px;
}

button:hover {
  background-color: #45a049;
}

.error-message {
  color: #f44336;
  margin-top: 10px;
  text-align: center;
}
</style>
