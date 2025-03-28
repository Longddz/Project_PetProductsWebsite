import { createStore } from "vuex";
import axios from "axios";

const store = createStore({
  state() {
    return {
      user: null,
      cartItems: [],
      initialized: false
    };
  },
  mutations: {
    initializeStore(state) {
      try {
        const userData = localStorage.getItem("user");
        const cartData = localStorage.getItem("cart");
        
        if (userData) {
          state.user = JSON.parse(userData);
          console.log('Initialized user:', state.user);
        }
        
        if (cartData) {
          state.cartItems = JSON.parse(cartData);
        }
        
        state.initialized = true;
      } catch (error) {
        console.error('Lỗi khi khởi tạo store:', error);
        state.user = null;
        state.cartItems = [];
        localStorage.removeItem("user");
        localStorage.removeItem("cart");
      }
    },
    setUser(state, user) {
      try {
        state.user = user;
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
          console.log('Set user in store:', user);
        } else {
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error('Lỗi khi lưu user:', error);
      }
    },
    logout(state) {
      state.user = null;
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },
    addToCart(state, product) {
      const existingItem = state.cartItems.find(item => item._id === product._id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        let imageURL = product.imageURL || '';
        imageURL = imageURL.split('/').pop();
        
        state.cartItems.push({
          _id: product._id,
          productName: product.productName,
          productPrice: Number(product.productPrice),
          quantity: 1,
          productType: product.productType || '',
          productDescription: product.productDescription || '',
          imageURL: imageURL
        });
      }
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
    updateCartItemQuantity(state, { productId, quantity }) {
      console.log('Updating quantity:', { productId, quantity });
      const item = state.cartItems.find(item => item._id === productId);
      if (item) {
        console.log('Found item:', item);
        item.quantity = quantity;
        console.log('New quantity:', item.quantity);
        localStorage.setItem("cart", JSON.stringify(state.cartItems));
      }
    },
    removeFromCart(state, productId) {
      state.cartItems = state.cartItems.filter(item => item._id !== productId);
      localStorage.setItem("cart", JSON.stringify(state.cartItems));
    },
    clearCart(state) {
      state.cartItems = [];
      localStorage.removeItem("cart");
    }
  },
  actions: {
    initializeStore({ commit }) {
      commit("initializeStore");
    },
    login({ commit }, user) {
      console.log('Login action with user:', user);
      commit("setUser", user);
    },
    logout({ commit }) {
      commit("logout");
      commit("clearCart");
    },
    addToCart({ commit }, product) {
      commit("addToCart", product);
    },
    async updateCartItemQuantity({ commit }, payload) {
      console.log('Action updateCartItemQuantity:', payload);
      commit("updateCartItemQuantity", payload);
    },
    removeFromCart({ commit }, productId) {
      commit("removeFromCart", productId);
    },
    async createOrderFromCart({ commit, state }) {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Vui lòng đăng nhập');
      }

      const cartItems = state.cartItems;
      if (cartItems.length === 0) {
        throw new Error('Giỏ hàng trống');
      }

      const item = cartItems[0];
      const data = {
        productName: item.productName,
        productQuantity: parseInt(item.quantity),
        totalAmount: parseFloat(item.productPrice * item.quantity),
        productId: item._id,
        customerAddress: "Địa chỉ mặc định",
        phoneNumber: "0987654321",
        imageURL: item.imageURL
      };

      console.log('Sending data:', data);

      const response = await axios.post('http://localhost:5000/api/invoice', data, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data) {
        commit('clearCart');
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    isAdmin: state => {
      console.log('Checking admin, user:', state.user);
      return state.user?.role === "admin";
    },
    cartItems: state => state.cartItems,
    totalQuantity: state => {
      return state.cartItems.reduce((total, item) => total + item.quantity, 0);
    },
    totalAmount: state => {
      return state.cartItems.reduce((total, item) => {
        const price = item.discount 
          ? item.productPrice * (1 - item.discount / 100)
          : item.productPrice;
        return total + price * item.quantity;
      }, 0);
    },
    isInitialized: state => state.initialized,
    currentUser: state => state.user
  }
});

export default store;