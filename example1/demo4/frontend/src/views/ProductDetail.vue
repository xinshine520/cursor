<template>
  <div class="min-h-screen">
    <Navbar />
    <ProductDetailSection :product-id="productId" />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import ProductDetailSection from '../components/ProductDetailSection.vue'
import Footer from '../components/Footer.vue'

const route = useRoute()
const productId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? parseInt(id) : Number(id)
})
</script>

