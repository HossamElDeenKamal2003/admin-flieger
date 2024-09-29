<template>
    <div class="container">
        <div class="row">
            <div class="col-md-4 mb-4" v-for="user in users" :key="user._id">
                <div class="card">
                    <img class="card-img-top" :src="user.profile_image" :alt="`Profile image of ${user.username}`">
                    <div class="card-body">
                        <h5 class="card-title">{{ user.username }}</h5>
                        <p class="card-text">{{ user.email }}</p>
                        <p class="card-text">{{ user.phoneNumber }}</p>
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
                    </div>
                </div> 
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: "UsersPanel",
    data() {
        return {
            users: [],
        }
    },
    methods: {
        async increase(id) {
            try {
                const response = await axios.patch(`http://localhost:3000/auth/increament-alerts/${id}`);
                if (response.status === 200) {
                    // Assuming the API returns the updated user data
                    const updatedUser = response.data;
                    const userIndex = this.users.findIndex(user => user._id === id);
                    if (userIndex !== -1) {
                        this.users[userIndex] = updatedUser;
                    }
                    alert('Value increased successfully.');
                }
            } catch (error) {
                console.error(error);
                alert("Error occurred while increasing the value.");
            }
        },

        redirectToImage(imageUrl) {
            window.location.href = imageUrl;
        },

        async deleteUser(id) {
            try {
                const response = await axios.delete(`http://localhost:3000/auth/delete-user/${id}`);
                if (response.status === 200) {
                    alert(response.data.message);
                    this.users = this.users.filter(user => user._id !== id);
                }
            } catch (error) {
                console.error(error);
                alert("Error occurred while deleting user.");
            }
        },

        async toggleBlock(userId, currentBlockStatus) {
            try {
                const newBlockStatus = !currentBlockStatus;
                const response = await axios.patch(`http://localhost:3000/auth/block/${userId}`, {
                    block: newBlockStatus
                });

                const updatedUser = response.data;
                const userIndex = this.users.findIndex(user => user._id === userId);
                if (userIndex !== -1) {
                    this.users[userIndex] = updatedUser;
                }

                alert(`User ${newBlockStatus ? 'unblocked' : 'blocked'} successfully.`);
            } catch (error) {
                console.error(error);
                alert("Error occurred while updating block status.");
            }
        },

        async getUsers() {
            try {
                const response = await axios.get('http://localhost:3000/admin/get-users');
                this.users = response.data;
            } catch (error) {
                console.error(error);
                alert("Error occurred while fetching users.");
            }
        }
    },
    created() {
        this.getUsers();
    }
}
</script>

<style scoped>
body {
    background-color: rgb(114, 89, 170);
}

.card {
    border: 2px rgb(114, 89, 170) solid;
    height: 20rem;
    overflow: hidden; 
}

.alert{
    display: flex;
    justify-content: center;
}

.card-img-top {
    height: 40%; 
    object-fit: cover;
}

.card-body {
    height: 60%; 
    overflow: auto; 
}

.buttons {
    display: flex;
    justify-content: space-around;
}
</style>
