<template>
  <div class="app-container">
    <!-- Sidebar -->
    <div :class="['sidebar', { 'sidebar-collapsed': !isSidebarExpanded }]">
      <Sidebar />
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="header-left">
          <i class="fas fa-bars" @click="toggleSidebar"></i>
          <h1>Good morning, MR. Fady 👋</h1>
          <waiting-drivers-number />
        </div>
        <div class="header-right">
          <button class="btn-add" @click="showForm = true">Add New Moderator</button>
        </div>
      </header>

      <!-- Moderators List -->
      <div class="moderators-list">
        <h3>Moderators list</h3>
        <div class="moderator-table">
          <table class="table table-bordered">
            <thead>
            <tr>
              <th>Username</th>
              <th>Phone Number</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="person in persons" :key="person._id">
              <td>{{ person.username }}</td>
              <td>{{ person.phoneNumber }}</td>
              <td>
                <select v-model="person.role" @change="editPerson(person)">
                  <option value="">Select Role</option>
                  <option value="support1">Support 1</option>
                  <option value="support2">Support 2</option>
                  <option value="support3">Support 3</option>
                  <option value="support4">Support 4</option>
                </select>
              </td>
              <td>
                <button class="btn btn-sm btn-danger" @click="deletePerson(person._id)">
                  <i class="fas fa-trash"></i> Delete
                </button>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Form (shown conditionally) -->
      <div class="form" v-if="showForm">
        <form @submit.prevent="signUp">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control" id="username" v-model="dataForm.username" placeholder="Enter Username" required>
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" class="form-control" id="email" v-model="dataForm.email" placeholder="Enter Email" required>
          </div>
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input type="text" class="form-control" id="phone" v-model="dataForm.phone" placeholder="Enter Phone Number" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control" id="password" v-model="dataForm.password" placeholder="Password" required>
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
          <button type="button" class="btn btn-secondary" @click="showForm = false">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Sidebar from "@/components/sidebarComponent.vue";
import WaitingDriversNumber from "@/components/waitingDriversNumber.vue";

export default {
  name: "permissionForm",
  components: {WaitingDriversNumber, Sidebar},
  data() {
    return {
      showForm: false,
      dataForm: {
        username: "",
        email: "",
        phone: "",
        password: ""
      },
      persons: [],
      id: ""
    };
  },
  methods: {
    async signUp() {
      const formData = new FormData();
      formData.append("username", this.dataForm.username);
      formData.append("email", this.dataForm.email);
      formData.append("phoneNumber", this.dataForm.phone);
      formData.append("password", this.dataForm.password);

      try {
        const response = await axios.post('https://backend.fego-rides.com/auth/support_signup', {
          "username": this.dataForm.username,
          "email": this.dataForm.email,
          "phoneNumber": this.dataForm.phone,
          "password": this.dataForm.password
        });

        const newPerson = response.data.user;
        this.persons.push({
          _id: newPerson._id,
          username: newPerson.username,
          phoneNumber: newPerson.phoneNumber,
          role: ""
        });

        alert("Person Added Successfully");
        this.resetForm();
        this.getPersons();
        this.showForm = false;
      } catch (error) {
        console.error(error);
        alert("Error: " + (error.response?.data.message || error.message));
      }
    },
    async getPersons() {
      try {
        const response = await axios.get('https://backend.fego-rides.com/auth/get_supports');
        this.persons = response.data.users;
        console.log(this.person)
      } catch (error) {
        console.log(error);
        alert("Error: " + (error.response?.data.message || error.message));
      }
    },
    editPerson(person) {
      axios.patch('https://backend.fego-rides.com/auth/patchRole', {
        userId: person._id,
        role: person.role
      }).then(response => {
        alert('Permission Added Successfully');
        console.log(response.data);
        console.log(person);
      });
    },
    deletePerson(personId) {
      axios.delete(`https://backend.fego-rides.com/auth/delete-permission/${personId}`).then(() => {
        this.getPersons();
        alert("Person Deleted Successfully");
      }).catch(error => {
        alert(error.data.message);
      });
    },
    resetForm() {
      this.dataForm = {
        username: "",
        email: "",
        phone: "",
        password: ""
      };
    },
    toggleSidebar() {
      // Placeholder for sidebar toggle functionality
    }
  },
  created() {
    this.getPersons();
  }
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  color: white;
}

.sidebar-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.logo {
  width: 40px;
  margin-right: 10px;
}

.main-menu ul {
  list-style: none;
  padding: 0;
}

.main-menu li {
  padding: 10px;
  cursor: pointer;
}

.main-menu li.active {
  background: #553C9A;
  border-radius: 5px;
}

.main-menu i {
  margin-right: 10px;
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #F7F7F7;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left h1 {
  display: inline;
  margin: 0 10px;
}

.header-right .btn-add {
  background: #4C51BF;
  color: white;
  border: none;
  padding: 5px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.moderators-list {
  margin-top: 20px;
}

.moderator-table {
  background: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  padding: 10px;
  text-align: left;
}

.table th {
  background: #F7F7F7;
}

.table td {
  border-bottom: 1px solid #DDD;
}

.form {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #DDD;
  border-radius: 5px;
}

.btn-primary {
  background: #4C51BF;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-secondary {
  background: #E2E8F0;
  color: #333;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
}

.btn-danger {
  background: #E53E3E;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
</style>