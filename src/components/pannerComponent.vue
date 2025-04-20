<template>
  <div class="container mt-4">
    <Sidebar />
    <div class="mb-3">
      <input type="file" ref="fileInput" class="form-control mb-2" />
      <button @click="addImage" class="btn btn-primary w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        <span v-if="!loading">Add</span>
      </button>
    </div>
    <div class="row">
      <div class="col-md-4 mb-4" v-for="(image, index) in images" :key="index">
        <div class="card">
          <img :src="image" class="card-img-top" alt="image" />
          <div class="card-body text-center">
            <button @click="deleteImage(index)" class="btn btn-danger w-100">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="loading" class="text-center mt-3">
      <p>Uploading image... Please wait.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Sidebar from './sidebarComponent.vue';
export default {
  name: "pannerComponent",
  data() {
    return {
      images: [],
      baseUrl: "https://fliegertechnology-production-6024.up.railway.app",
      loading: false, // Loading state
    };
  },
  components: {
    Sidebar
  },
  created() {
    this.getPanners();
  },
  methods: {
    addImage() {
      const formData = new FormData();
      const file = this.$refs.fileInput.files[0];

      if (!file) {
        alert("Please select a file to upload.");
        return;
      }

      formData.append('images', file);
      formData.append('id', '66fa9e2bd0cad8f72e47fb52');

      this.loading = true; // Start loading

      axios.patch(`${this.baseUrl}/admin/patch-panners`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(() => {
        alert('Panner added successfully');
        this.getPanners();
      })
      .catch(error => {
        console.error('Error adding panner:', error);
      })
      .finally(() => {
        this.loading = false; // Stop loading
      });
    },

    deleteImage(index) {
      const imageUrl = this.images[index];

      axios.delete(`${this.baseUrl}/admin/delete/66fa9e2bd0cad8f72e47fb52`, {
        data: {
          imageUrl: imageUrl
        }
      })
      .then(() => {
        alert('Image deleted successfully');
        this.getPanners(); // Refresh images after deletion
      })
      .catch(error => {
        console.error('Error deleting image:', error);
      });
    },

    getPanners() {
      axios.get(`${this.baseUrl}/admin/get-panner/66fa9e2bd0cad8f72e47fb52`)
        .then(response => {
          this.images = response.data.panners.images || [];
          console.log(this.images); // Debugging instead of using alert
        })
        .catch(error => {
          console.error('Error fetching panners:', error);
        });
    },
  },
};
</script>

<style scoped>
.card-img-top {
  height: 200px;
  object-fit: cover; /* Ensures the image covers the card space nicely */
}
</style>
