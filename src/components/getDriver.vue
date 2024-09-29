<template>
    <div class="parent">
        <div class="container">
            <input type="text" v-model="searchQuery" placeholder="Search by username" class="form-control mb-3">
            <div v-for="user in filteredDrivers" :key="user._id" class="card mb-3">
                <div class="row no-gutters">
                    <!-- Image Column -->
                    <div class="col-md-4">
                        <img class="card-img-left" :src="user.profile_image || 'default-profile.png'" :alt="`Profile image of ${user.username}`">
                    </div>
                    <!-- Content Column -->
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title"><span style="color: blue">UserName : </span>{{ user.username || 'N/A' }}</h5>
                            <p class="card-text"><span style="color: blue">Email : </span>{{ user.email || 'N/A' }}</p>
                            <p class="card-text"><span style="color: blue">Phone Number : </span>{{ user.phoneNumber || 'N/A' }}</p>
                            <p class="card-text"><span style="color: blue">National ID : </span>{{ user.id || 'N/A' }}</p>
                            <p class="card-text"><span style="color: blue">Rate : </span>{{ user.rate || 'N/A' }}</p>
                            <p class="card-text"><span style="color: blue">Total Ratings : </span>{{ user.totalRatings || 'N/A' }}</p>
                            <p class="card-text"><span style="color: blue">Car Model : </span>{{ user.carModel || 'N/A' }}</p>
                            <p class="card-text"><span style="color: blue">Vehicle Type : </span>{{ user.vehicleType || 'N/A' }}</p>
                            <p class="card-text"><span style="color: blue">Car Color : </span>{{ user.carColor || 'N/A' }}</p>
                            <p class="card-text"><span style="color: blue">Car Number : </span>{{ user.carNumber || 'N/A' }}</p>
                            <div class="alert">
                                <span class="text-danger" style="font-size: 2em;">{{ user.alerts }}</span>
                                <button class="btn btn-sm" @click="increase(user._id)">+</button>
                            </div>
                            <div class="buttons">
                                <button class="btn btn-sm" 
                                        :class="{'btn-primary': user.block, 'btn-danger': !user.block}"
                                        @click="toggleBlock(user._id, user.block)">
                                    {{ user.block ? 'Block' : 'UnBlock' }}
                                </button>
                                <button class="btn btn-danger btn-sm" @click="deleteUser(user._id)">Delete</button>
                                <button class="btn btn-info btn-sm" @click="redirectToImage(user.profile_image)">View Image</button>
                            </div>
                            <div class="images">
                                <button class="btn btn-info btn-sm" @click="redirectToImage(user.licenseImage)">Car Licence</button>
                                <button class="btn btn-info btn-sm" @click="redirectToImage(user.driver_licence_image)">Driver Licence</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "getDriver",
    data() {
        return {
            drivers: [],
            searchQuery: ''
        };
    },
    computed: {
        filteredDrivers() {
            return this.drivers.filter(driver => 
                driver.username.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },
    methods: {
        async getDriver() {
            try {
                const response = await axios.get("http://localhost:3000/admin/get-drivers");
                this.drivers = response.data;
                console.log(this.drivers);
            } catch (error) {
                console.error("There was an error fetching the drivers:", error);
            }
        },
        async increase(id) {
            try {
                const response = await axios.patch(`http://localhost:3000/authdriver/patch-block/${id}`);
                if (response.status === 200) {
                    const updatedUser = response.data;
                    const userIndex = this.drivers.findIndex(user => user._id === id);
                        this.drivers[userIndex] = updatedUser;
                    alert('Value increased successfully.');
                }
            } catch (error) {
                console.error(error);
                alert("Error occurred while increasing the value.");
            }
        },
        async toggleBlock(id, currentBlockStatus) {
            try {
                const newBlockStatus = !currentBlockStatus;
                const response = await axios.patch(`http://localhost:3000/authdriver/patch-block/${id}`, {
                    block: newBlockStatus
                });

                const updatedUser = response.data;
                const userIndex = this.drivers.findIndex(user => user._id === id);
                if (userIndex !== -1) {
                    this.drivers[userIndex] = updatedUser;
                }

                alert(`User ${newBlockStatus ? 'unblocked' : 'blocked'} successfully.`);
            } catch (error) {
                console.error(error);
                alert("Error occurred while updating block status.");
            }
        },
        async deleteUser(id) {
            try {
                const response = await axios.delete(`http://localhost:3000/authdriver/delete-user/${id}`);
                if (response.status === 200) {
                    alert(response.data.message);
                    this.drivers = this.drivers.filter(user => user._id !== id);
                }
            } catch (error) {
                console.error(error);
                alert("Error occurred while deleting user.");
            }
        },
        redirectToImage(imageUrl) {
            window.open(imageUrl, '_blank');
        }
    },
    created() {
        this.getDriver();
    }
};
</script>

<style scoped>
body {
    background-color: rgb(114, 89, 170);
}

.card {
    border: 2px rgb(114, 89, 170) solid;
    overflow: hidden;
}

.card-img-left {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.card-body {
    padding: 1rem;
}

.alert {
    display: flex;
    justify-content: center;
}

.buttons {
    display: flex;
    justify-content: space-around;
    margin-top: 1rem;
}

.images {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

/* Make <span> elements bold within card content */
.card-body span {
    font-weight: bold;
    color: blue; /* Apply text color if needed */
    font-size: 1.5em;
}

h5 span {
    font-weight: bold;
    color: blue; /* Apply text color if needed */
}
</style>
