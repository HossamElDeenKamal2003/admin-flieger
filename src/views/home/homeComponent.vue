<template>
  <div>
    <!-- Navbar Component -->
    <NavbarComponent />

    <!-- Hero Section -->
    <section id="home" class="hero-section">
      <img
          src="../../assets/homeImage.jpg"
          alt="Home Banner"
          class="hero-image"
      >
    </section>

    <section id="services">
      <ServicesComponent />
    </section>

    <!-- Footer Component -->
    <footerComponent />
  </div>
</template>

<script>
import NavbarComponent from '../../components/navbars/homeNavbar.vue';
import ServicesComponent from './servicesComponent.vue';
import footerComponent from './footerSection.vue';

export default {
  name: 'homeComponent',
  components: {
    NavbarComponent,
    ServicesComponent,
    footerComponent,
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  scroll-behavior: smooth;
}

.hero-section {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
}

/* For taller screens where you want the image to fill height */
@media (min-aspect-ratio: 16/9) {
  .hero-image {
    height: 100vh;
    width: auto;
    min-width: 100%;
    object-position: center;
  }
}

section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(1.5rem, 4vw, 2.5rem); /* Responsive font size */
}

#services {
  padding: 2rem;
  background-color: #f8f9fa; /* Example background */
}

/* Optional: Add smooth transition for image loading */
.hero-image {
  transition: opacity 0.3s ease;
}

.hero-image.loading {
  opacity: 0;
}

.hero-image.loaded {
  opacity: 1;
}
</style>