<template>
  <div class="container mt-4">
    <h1 class="text-center mb-4">Requests</h1>
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else class="row">
      <div v-for="request in requests" :key="request._id" class="col-md-4 mb-3">
        <div class="card shadow-sm">
          <div class="card-body">
            <!-- Display Driver Data -->
            <div v-if="request.driverId">
              <h5 class="card-title">
                <strong>Driver:</strong> {{ request.driverId.username }}
              </h5>
              <p class="card-text">
                <strong>Phone Number:</strong> {{ request.driverId.phoneNumber }}
              </p>
              <p class="card-text">
                <strong>Created At:</strong> {{ formatDate(request.driverId.createdAt) }}
              </p>
               <p class="card-text">
                <strong>Trips Number:</strong> {{ request.driverId.ctr }}
              </p>
            </div>

            <!-- Display Amount -->
            <p class="card-text">
              <strong>Amount:</strong> {{ request.amount }} EGP
            </p>

            <!-- Delete Button -->
            <button class="btn btn-danger btn-sm" @click="deleteRequest(request._id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "getreqComponent",
  data() {
    return {
      requests: [], // Store fetched requests
      loading: true, // Loading state
    };
  },
  async created() {
    // Fetch requests when the component is created
    await this.fetchRequests();
  },
  methods: {
    // Fetch requests from the backend
    async fetchRequests() {
      try {
        const response = await fetch("https://backend.fego-rides.com/getReq");
        if (!response.ok) {
          throw new Error("Failed to fetch requests");
        }
        const data = await response.json();
        console.log(data);

        // Map the response to include userId and driverId objects
        this.requests = data.requests.map((request) => ({
          _id: request._id,
          amount: request.amount,
          userId: request.userId || null, // Include userId object if it exists
          driverId: request.driverId || null, // Include driverId object if it exists
        }));
      } catch (error) {
        console.error("Error fetching requests:", error);
        alert("Failed to fetch requests. Please try again.");
      } finally {
        this.loading = false;
      }
    },

    // Delete a request by ID
    async deleteRequest(requestId) {
      try {
        const response = await fetch("https://backend.fego-rides.com/delete-req", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: requestId }), // Send ID in the request body
        });

        if (!response.ok) {
          throw new Error("Failed to delete request");
        }

        // Remove the deleted request from the list
        this.requests = this.requests.filter((request) => request._id !== requestId);
        alert("Request deleted successfully!");
      } catch (error) {
        console.error("Error deleting request:", error);
        alert("Failed to delete request. Please try again.");
      }
    },

    // Format date for display
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleString(); // Format date based on user's locale
    },
  },
};
</script>

<style scoped>
.card {
  border-radius: 12px;
  border: 1px solid #ddd;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.1rem;
  color: #333;
}

.card-text {
  font-size: 0.9rem;
  color: #555;
}

.btn-danger {
  border-radius: 6px;
}
</style>