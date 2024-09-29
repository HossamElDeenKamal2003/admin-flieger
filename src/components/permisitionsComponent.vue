<template>
    <div class="form">
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
            <div class="form-group form-check">
                <input type="checkbox" class="form-check-input" id="exampleCheck1">
                <label class="form-check-label" for="exampleCheck1">Check me out</label>
            </div>
            <button type="submit" class="btn btn-primary">Submit</button>
        </form>

        <div class="mt-4">
            <h3>Persons List</h3>
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
                            <select v-model="person.role">
                                <option value="support1">Support 1</option>
                                <option value="support2">Support 2</option>
                                <option value="support3">Support 3</option>
                                <option value="support4">Support 4</option>
                            </select>
                        </td>
                        <td>
                            <button class="btn btn-sm btn-warning" @click="editPerson(person)"><i class="fas fa-edit"></i> Edit</button>
                            <button class="btn btn-sm btn-danger" @click="deletePerson(person._id)"><i class="fas fa-trash"></i> Delete</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "permissionForm",
    data() {
        return {
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
                const response = await axios.post('http://localhost:3000/auth/support_signup', {
                    "username": this.dataForm.username,
                    "email": this.dataForm.email,
                    "phoneNumber": this.dataForm.phone,
                    "password": this.dataForm.password
                });

                const newPerson = response.data.user; // Assuming the new person is returned under 'user' key
                this.persons.push({
                    _id: newPerson._id,
                    username: newPerson.username,
                    phoneNumber: newPerson.phoneNumber,
                    role: "" // Default empty role
                });

                alert("Person Added Successfully");
                this.resetForm(); // Reset form after submission
                this.getPersons(); // Refresh person list to include the new entry
            } catch (error) {
                console.error(error);
                alert("Error: " + (error.response?.data.message || error.message));
            }
        },
        async getPersons() {
            try {
                const response = await axios.get('http://localhost:3000/auth/get_supports');
                this.persons = response.data.users;
            } catch (error) {
                console.log(error);
                alert("Error: " + (error.response?.data.message || error.message));
            }
        },
        editPerson(person) {
            axios.patch('http://localhost:3000/auth/patchRole', {
                userId: person._id,
                role: person.role
            }).then(response=>{
                alert('Permission Added Successfully');
                console.log(response.data);
                console.log(person)
            })
        },
        deletePerson(personId) {
            axios.delete(`http://localhost:3000/auth/delete-permission/${personId}`).then(()=>{
                this.getPersons();
                alert("Person Deleted Successfully");
            }).catch(error=>{
                alert(error.data.message);
            })
        },
        resetForm() {
            this.dataForm = {
                username: "",
                email: "",
                phone: "",
                password: ""
            };
        }
    },
    created() {
        this.getPersons(); // Fetch persons when component is created
    }
};
</script>

<style scoped>
.form {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
}

.form-group {
    margin-bottom: 15px;
}
</style>
