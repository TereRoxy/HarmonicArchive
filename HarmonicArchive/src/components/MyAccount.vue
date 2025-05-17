<template>
  <div class="my-account">
    <h1 class="form-title">My Account</h1>

    <!-- Account Information -->
    <div class="form-container">
      <form @submit.prevent="updateAccount">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="updateData.username"
            placeholder="Enter your new username"
            class="form-input"
          />
          <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="updateData.email"
            placeholder="Enter your new email"
            class="form-input"
          />
          <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
        </div>

        <div class="form-group">
          <label for="old-password">Old Password</label>
          <input
            type="password"
            id="old-password"
            v-model="updateData.oldPassword"
            placeholder="Enter your old password"
            class="form-input"
          />
          <p v-if="errors.oldPassword" class="error-message">{{ errors.oldPassword }}</p>
        </div>

        <div class="form-group">
          <label for="new-password">New Password</label>
          <input
            type="password"
            id="new-password"
            v-model="updateData.password"
            placeholder="Enter your new password"
            class="form-input"
          />
          <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        </div>

        <button type="submit" class="form-button">Update Account</button>
      </form>
    </div>

    <!-- Delete Account Section -->
    <div class="delete-section">
      <h2>Delete Account</h2>
      <p class="delete-warning">
        Warning: Deleting your account is permanent and cannot be undone.
      </p>
      <button @click="deleteAccount" class="delete-btn">Delete My Account</button>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, updateUser, deleteUser } from "../services/api";

export default {
  data() {
    return {
      user: {
        id: null,
        username: "",
        email: "",
      },
      updateData: {
        username: "",
        email: "",
        oldPassword: "",
        password: "",
      },
      errors: {
        username: null,
        email: null,
        oldPassword: null,
        password: null,
      },
    };
  },
  async mounted() {
    try {
      const currentUser = await getCurrentUser();
      this.user = currentUser;
      this.updateData.id = currentUser.userId;
      this.updateData.username = currentUser.username;
      this.updateData.email = currentUser.email;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  },
  methods: {
    validatePassword(password) {
      const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[,.@/\|`~'"{}[\]()*&^%$#!?<>]).{8,}$/;
      return regex.test(password);
    },
    async updateAccount() {
      // Clear previous errors
      this.errors = {
        username: null,
        email: null,
        oldPassword: null,
        password: null,
      };

      // Validate password strength on the frontend
      if (this.updateData.password && !this.validatePassword(this.updateData.password)) {
        this.errors.password =
          "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.";
        return;
      }

      try {
        await updateUser(this.updateData.id, this.updateData);
        alert("Account updated successfully!");
        this.user.username = this.updateData.username;
        this.user.email = this.updateData.email;
        this.updateData.oldPassword = ""; // Clear old password after update
        this.updateData.password = ""; // Clear new password after update
      } catch (error) {
        if (error.response && error.response.data) {
          const backendErrors = error.response.data;

          // Map backend errors to the corresponding fields
          if (backendErrors.message === "Old password is incorrect.") {
            this.errors.oldPassword = "Old password is incorrect.";
          }
          if (backendErrors.message === "Username or email already exists.") {
            if (backendErrors.Field === "username") {
              this.errors.username = "This username is already taken.";
            }
            if (backendErrors.Field === "email") {
              this.errors.email = "This email is already in use.";
            }
          }
        } else {
          console.error("Error updating account:", error);
          alert("Failed to update account. Please try again.");
        }
      }
    },
    async deleteAccount() {
      if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
        try {
          await deleteUser(this.user.id);
          alert("Account deleted successfully.");
          this.$router.push("/"); // Redirect to the login page
        } catch (error) {
          console.error("Error deleting account:", error);
          alert("Failed to delete account. Please try again.");
        }
      }
    },
  },
};
</script>

<style scoped>
.my-account {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.form-container {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #532b88;
  outline: none;
}

.error-message {
  color: #d9534f;
  font-size: 12px;
  margin-top: 5px;
}

.form-button {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: #fff;
  background-color: #532b88;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.form-button:hover {
  background-color: #6a3dbb;
}

.delete-section {
  text-align: center;
  margin-top: 20px;
}

.delete-warning {
  color: #d9534f;
  font-size: 14px;
  margin-bottom: 10px;
}

.delete-btn {
  background-color: #d9534f;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c9302c;
}
</style>