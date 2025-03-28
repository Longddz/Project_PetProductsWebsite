<template>
  <div id="app">
    <Navbar />
    <router-view />
    <Footer />

  </div>
</template>

<script setup>
import Navbar from "./components/Navbar.vue";
import Footer from "./components/Footer.vue";
</script>

<style>
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
body {
  margin: 0 !important;
  padding: 0;
  box-sizing: border-box;
}
</style>
