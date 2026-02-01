<template>
  <div class="min-h-screen">
    <Navbar />
    <HeroSection />
    <ModelsSection />
    <FeaturesSection />
    <PerformanceSection />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'
import ModelsSection from '../components/ModelsSection.vue'
import FeaturesSection from '../components/FeaturesSection.vue'
import PerformanceSection from '../components/PerformanceSection.vue'
import Footer from '../components/Footer.vue'
</script>

