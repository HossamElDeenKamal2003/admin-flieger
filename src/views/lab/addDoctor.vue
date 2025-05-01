<template>
  <lab-navbar />
  <div class="add-doctor-container">
    <h1 class="page-title">Add a Doctor</h1>

    <div class="form-card">
      <form @submit.prevent="submitDoctor">
        <fieldset>
          <legend>Doctor Information</legend>

          <!-- Username -->
          <div class="form-group">
            <label for="username" style="font-weight: bold">UID:</label>
            <input
                type="text"
                id="username"
                v-model.trim="doctorData.id"
                required
                placeholder="Enter doctor's UID"
            />
            <span class="error" v-if="errors.username">{{ errors.username }}</span>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="loading">Adding...</span>
              <span v-else>Add Doctor</span>
            </button>
            <router-link to="/lab/doctors" class="cancel-btn">Cancel</router-link>
          </div>
        </fieldset>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import LabNavbar from "@/components/navbars/labsNavbar.vue";

export default {
  name: "AddDoctor",
  components: {
    LabNavbar,
  },
  data() {
    return {
      doctorData: {
       id: ''
      },
      errors: {},
      loading: false,
      baseUrl: "https://rr-5d46.onrender.com/labdash",
    };
  },
  methods: {
    async submitDoctor() {

      this.loading = true;

      try {
        const token = localStorage.getItem("token");

        const response = await axios.post(
            `${this.baseUrl}/add-doctor/${this.doctorData.id}`,
            this.doctorData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
        );

        console.log(response);
        alert(`Doctor ${this.doctorData.id} added successfully`);
        this.$router.push("/my-doctors");

      } catch (error) {
        console.error("Error adding doctor:", error);
        alert(error.response?.data?.message || "Failed to add doctor");

      } finally {
        this.loading = false;
      }
    }
  },
};
</script>

<style scoped>
.add-doctor-container {
  padding: 20px;
  max-width: 1200px;
  margin: 80px auto 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.form-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

fieldset {
  border: none;
  padding: 0;
}

legend {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #6c757d;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 1rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.file-input {
  padding: 5px 0;
}

.error {
  display: block;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 5px;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
}

.submit-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn {
  background-color: #28a745;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background-color: #218838;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #6c757d;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cancel-btn:hover {
  background-color: #5a6268;
}

@media (max-width: 768px) {
  .add-doctor-container {
    padding: 15px;
    margin-top: 70px;
  }

  .form-card {
    padding: 15px;
  }

  .form-actions {
    flex-direction: column;
    gap: 10px;
  }

  .submit-btn, .cancel-btn {
    width: 100%;
  }
}
</style>