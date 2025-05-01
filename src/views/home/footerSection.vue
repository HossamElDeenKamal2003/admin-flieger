<template>
  <footer>
    <div class="footer-container">
      <!-- Logo -->
      <div class="logo">
        <img src="@/assets/logo.png" alt="شعار الشركة" />
      </div>

      <!-- Info -->
      <div class="info">
        <a href="privacy.html"><i class="fas fa-lock"></i> سياسة الخصوصية</a>
        <p><i class="fas fa-map-marker-alt"></i> العنوان: [أدخل العنوان هنا]</p>
        <p><i class="fas fa-phone"></i> الهاتف: <a href="tel:+123456789">+123456789</a></p>
        <p><i class="fas fa-envelope"></i> البريد الإلكتروني: <a href="mailto:info@example.com">info@example.com</a></p>
      </div>

      <!-- Social Icons -->
      <div class="social-icons">
        <a href="https://www.tiktok.com/" target="_blank"><i class="fab fa-tiktok"></i></a>
        <a href="https://www.instagram.com/" target="_blank"><i class="fab fa-instagram"></i></a>
        <a href="https://www.snapchat.com/" target="_blank"><i class="fab fa-snapchat-ghost"></i></a>
        <a href="https://www.facebook.com/" target="_blank"><i class="fab fa-facebook-f"></i></a>
        <a href="https://wa.me/123456789" target="_blank"><i class="fab fa-whatsapp"></i></a>
      </div>

      <!-- Complaints Form -->
      <div class="complaints">
        <h3><i class="fas fa-bullhorn"></i> تقديم شكوى</h3>
        <form @submit.prevent="submitComplaint">
          <textarea
              v-model="complaint"
              name="complaint"
              placeholder="اكتب شكواك هنا..."
              required
          ></textarea>
          <button type="submit">إرسال</button>
        </form>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'FooterComponent',
  data() {
    return {
      complaint: '',
    };
  },
  methods: {
    submitComplaint() {
      if (this.complaint.trim()) {
        alert('تم إرسال الشكوى: ' + this.complaint);
        this.complaint = '';
      }
    },
  },
};
</script>

<style scoped>
footer {
  background: #555252;
  color: white;
  padding: 40px 20px;
  text-align: center;
}

.footer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.logo img {
  width: 150px;
}

.info a,
.info p {
  font-size: 16px;
  color: #ddd;
  margin: 5px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info a:hover {
  color: #00c3ff;
}

.social-icons {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.social-icons a {
  color: white;
  font-size: 40px; /* Matches the original 40px image size */
  transition: transform 0.3s;
}

.social-icons a:hover {
  transform: scale(1.2);
  color: #00c3ff;
}

.complaints {
  margin-top: 20px;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.complaints h3 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.complaints textarea {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #444;
  background: #5a5555;
  color: white;
  resize: none;
}

.complaints button {
  margin-top: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background: #00c3ff;
  color: white;
  cursor: pointer;
  transition: 0.3s;
}

.complaints button:hover {
  background: #0099cc;
}
</style>