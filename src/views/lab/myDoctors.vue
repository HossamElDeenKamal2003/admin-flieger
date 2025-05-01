<template>
  <lab-navbar />
  <div class="doctors-container">
    <h1 class="page-title">My Doctors</h1>

    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading doctors...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="getMyDoctors" class="retry-btn">Retry</button>
    </div>

    <div v-else-if="doctors.length === 0" class="empty-state">
      <p>No doctors found</p>
      <router-link to="/lab/add-doctor" class="add-doctor-btn">
        Add a Doctor
      </router-link>
    </div>

    <div v-else class="doctors-grid">
      <div v-for="doctor in doctors" :key="doctor._id" class="doctor-card">
        <div class="card-header">
          <div class="avatar">
            <img v-if="doctor.profileImage" :src="doctor.profileImage" alt="Doctor Avatar">
            <div v-else class="avatar-placeholder">
              {{ doctor.username.charAt(0).toUpperCase() }}
            </div>
          </div>
          <h3>{{ doctor.username }}</h3>
          <span class="specialization">{{ doctor.specialization || 'General Dentist' }}</span>
        </div>

        <div class="card-body">
          <div class="info-row">
            <font-awesome-icon icon="phone" />
            <span style="font-weight: bold">ID: {{ doctor.UID }}</span>
          </div>
          <div class="info-row">
            <font-awesome-icon icon="envelope" />
            <span>username: {{ doctor.username || 'No email provided' }}</span>
          </div>
          <div class="info-row">
            <font-awesome-icon icon="map-marker-alt" />
            <span>Phone Number: {{ doctor.phoneNumber || 'No address provided' }}</span>
          </div>
        </div>

        <div class="card-footer">
          <router-link
              :to="`/doctor-contract/${doctor.UID}`"
              class="view-btn"
          >
            Contract
          </router-link>
          <button
              @click="removeDoctor(doctor.UID)"
              class="remove-btn"
              :disabled="removingDoctor === doctor.UID"
          >
            <span v-if="removingDoctor === doctor._id">Removing...</span>
            <span v-else>Remove</span>
          </button>
        </div>
      </div>
    </div>

    <router-link to="/lab/add-doctor" class="floating-add-btn">
      <font-awesome-icon icon="plus" />
    </router-link>
  </div>
</template>

<script>
import axios from "axios";
import labNavbar from "@/components/navbars/labsNavbar.vue";

export default {
  name: 'MyDoctors',
  data() {
    return {
      doctors: [],
      loading: false,
      error: null,
      removingDoctor: null,
      baseUrl: 'https://rr-5d46.onrender.com/labdash'
    }
  },
  components: {
    labNavbar,
  },
  created() {
    this.getMyDoctors();
  },
  methods: {
    async getMyDoctors() {
      this.loading = true;
      this.error = null;

      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${this.baseUrl}/get-my-doctors`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        this.doctors = response.data.doctors || [];
        console.log(this.doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        this.error = error.response?.data?.message || "Failed to load doctors";
      } finally {
        this.loading = false;
      }
    },

    async removeDoctor(doctorId) {
      if (!confirm("Are you sure you want to remove this doctor?")) return;

      this.removingDoctor = doctorId;

      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${this.baseUrl}/remove-doctor/${doctorId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Remove from local list
        this.doctors = this.doctors.filter(d => d._id !== doctorId);
      } catch (error) {
        console.error("Error removing doctor:", error);
        alert(error.response?.data?.message || "Failed to remove doctor");
      } finally {
        this.removingDoctor = null;
      }
    }
  }
}
</script>

<style scoped>
.doctors-container {
  padding: 20px;
  max-width: 1200px;
  margin: 80px auto 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 20px;
  background-color: #ffeeee;
  border-radius: 8px;
  color: #ff4444;
  margin-bottom: 20px;
}

.retry-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.add-doctor-btn {
  display: inline-block;
  margin-top: 15px;
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.add-doctor-btn:hover {
  background-color: #218838;
}

.doctors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.doctor-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.doctor-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-header {
  padding: 20px;
  text-align: center;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin: 0 auto 15px;
  overflow: hidden;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 32px;
  font-weight: bold;
  color: #6c757d;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
}

.specialization {
  display: block;
  margin-top: 5px;
  color: #6c757d;
  font-size: 14px;
}

.card-body {
  padding: 20px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.info-row svg {
  margin-right: 10px;
  color: #6c757d;
  width: 16px;
}

.card-footer {
  display: flex;
  padding: 15px;
  border-top: 1px solid #eee;
}

.view-btn, .remove-btn {
  flex: 1;
  padding: 10px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.view-btn {
  background-color: #007bff;
  color: white;
  border-radius: 4px 0 0 4px;
}

.view-btn:hover {
  background-color: #0069d9;
}

.remove-btn {
  background-color: #dc3545;
  color: white;
  border-radius: 0 4px 4px 0;
}

.remove-btn:hover:not(:disabled) {
  background-color: #c82333;
}

.remove-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.floating-add-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 60px;
  height: 60px;
  background-color: #28a745;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s, background-color 0.3s;
}

.floating-add-btn:hover {
  background-color: #218838;
  transform: scale(1.1);
}

.floating-add-btn svg {
  font-size: 24px;
}

@media (max-width: 768px) {
  .doctors-container {
    padding: 15px;
    margin-top: 70px;
  }

  .doctors-grid {
    grid-template-columns: 1fr;
  }

  .floating-add-btn {
    bottom: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
  }
}
</style>