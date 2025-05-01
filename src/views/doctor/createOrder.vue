pm run serve```vue
<template>
  <DoctorNavbar />
  <div class="form-container" ref="formContainer">
    <div class="order-id-box">{{ orderId || 'رقم الطلب: --' }}</div>

    <form @submit.prevent="submitOrder">
      <fieldset>
        <legend>معلومات المريض</legend>

        <!-- Status -->
        <label for="status">الحالة:</label>
        <select v-model="orderData.prova" id="status">
          <option :value="true">تجريبي</option>
          <option :value="false">نهائي</option>
        </select>
        <label for="scanFile">ملف السكان</label>
        <select v-model="orderData.scanFile" id="scanFile">
          <option :value="false">لا</option>
          <option :value="true">نعم</option>
        </select>
        <span class="error" v-if="errors.prova">{{ errors.prova }}</span>

        <!-- Patient Name -->
        <label for="patientName">اسم المريض:</label>
        <input
            type="text"
            id="patientName"
            v-model="orderData.patientName"
            required
        />
        <span class="error" v-if="errors.patientName">{{ errors.patientName }}</span>

        <!-- Gender -->
        <label for="patientGender">الجنس:</label>
        <select v-model="orderData.sex" id="patientGender">
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>
        <span class="error" v-if="errors.sex">{{ errors.sex }}</span>
        <label for="patientGender">حالة الاوردر:</label>
        <select v-model="orderData.save" id="patientGender">
          <option value="true">حفظ الاوردر فقط</option>
          <option value="false">اوردر مستعجل</option>
        </select>
        <span class="error" v-if="errors.sex">{{ errors.save }}</span>
        <!-- Age -->
        <label for="patientAge">العمر:</label>
        <input
            type="number"
            id="patientAge"
            v-model="orderData.age"
            required
        />
        <span class="error" v-if="errors.age">{{ errors.age }}</span>

        <!-- Number of Teeth -->
        <label for="teethCount">عدد الأسنان المعالجة:</label>
        <input
            type="number"
            id="teethCount"
            v-model="orderData.teethNo"
            required
            readonly
        />
        <span class="error" v-if="errors.teethNo">{{ errors.teethNo }}</span>

        <!-- Lab Selection -->
        <label for="labId">المختبر:</label>
        <div class="lab-selection-container">
          <select v-model="orderData.labId" id="labId" @change="updateTeethTypes">
            <option value="" disabled>اختر مختبر</option>
            <option v-for="lab in labs" :key="lab._id" :value="lab._id">
              {{ lab.username }}
            </option>
          </select>

          <!-- Show email icon only when scan file exists AND a lab is selected -->
          <a
              v-if="orderData.scanFile && orderData.labId"
              :href="'mailto:' + getLabEmail(orderData.labId)"
              class="email-icon"
              title="أرسل بريد إلكتروني إلى هذا المختبر"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </div>
        <span class="error" v-if="errors.labId">{{ errors.labId }}</span>

        <!-- Type of Teeth (Dynamic based on selected lab) -->
        <label for="toothType">نوع الأسنان:</label>
        <select id="toothType" v-model="orderData.type" required>
          <option value="" disabled>اختر نوع السن</option>
          <option v-for="(price, type) in availableTeethTypes" :key="type" :value="type">
            {{ type }} ({{ formatCurrency(price) }})
          </option>
        </select>
        <span class="error" v-if="errors.type">{{ errors.type }}</span>

        <!-- Tooth Selection -->
        <h2>اضغط على السن لاختياره</h2>
        <div
            id="tooth-description"
            class="description"
            :class="{ visible: selectedTeeth.length > 0 }"
        >
          لقد اخترت السن رقم: <span id="tooth-number">{{ selectedTeeth.join(", ") }}</span>
        </div>

        <!-- Upper Teeth (17-32) -->
        <div class="teeth-container upper-teeth">
          <div class="tooth-wrapper">
            <img src="../../assets/img/17.jpeg" alt="سن 17" class="tooth-img" :class="{ selected: selectedTeeth.includes(17) }" @click="toggleTooth(17)">
            <div class="tooth-number">17</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/18.jpeg" alt="سن 18" class="tooth-img" :class="{ selected: selectedTeeth.includes(18) }" @click="toggleTooth(18)">
            <div class="tooth-number">18</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/19.jpeg" alt="سن 19" class="tooth-img" :class="{ selected: selectedTeeth.includes(19) }" @click="toggleTooth(19)">
            <div class="tooth-number">19</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/20.jpeg" alt="سن 20" class="tooth-img" :class="{ selected: selectedTeeth.includes(20) }" @click="toggleTooth(20)">
            <div class="tooth-number">20</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/21.jpeg" alt="سن 21" class="tooth-img" :class="{ selected: selectedTeeth.includes(21) }" @click="toggleTooth(21)">
            <div class="tooth-number">21</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/22.jpeg" alt="سن 22" class="tooth-img" :class="{ selected: selectedTeeth.includes(22) }" @click="toggleTooth(22)">
            <div class="tooth-number">22</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/23.jpeg" alt="سن 23" class="tooth-img" :class="{ selected: selectedTeeth.includes(23) }" @click="toggleTooth(23)">
            <div class="tooth-number">23</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/24.jpeg" alt="سن 24" class="tooth-img" :class="{ selected: selectedTeeth.includes(24) }" @click="toggleTooth(24)">
            <div class="tooth-number">24</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/25.jpeg" alt="سن 25" class="tooth-img" :class="{ selected: selectedTeeth.includes(25) }" @click="toggleTooth(25)">
            <div class="tooth-number">25</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/26.jpeg" alt="سن 26" class="tooth-img" :class="{ selected: selectedTeeth.includes(26) }" @click="toggleTooth(26)">
            <div class="tooth-number">26</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/27.jpeg" alt="سن 27" class="tooth-img" :class="{ selected: selectedTeeth.includes(27) }" @click="toggleTooth(27)">
            <div class="tooth-number">27</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/28.jpeg" alt="سن 28" class="tooth-img" :class="{ selected: selectedTeeth.includes(28) }" @click="toggleTooth(28)">
            <div class="tooth-number">28</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/29.jpeg" alt="سن 29" class="tooth-img" :class="{ selected: selectedTeeth.includes(29) }" @click="toggleTooth(29)">
            <div class="tooth-number">29</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/30.jpeg" alt="سن 30" class="tooth-img" :class="{ selected: selectedTeeth.includes(30) }" @click="toggleTooth(30)">
            <div class="tooth-number">30</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/31.jpeg" alt="سن 31" class="tooth-img" :class="{ selected: selectedTeeth.includes(31) }" @click="toggleTooth(31)">
            <div class="tooth-number">31</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/32.jpeg" alt="سن 32" class="tooth-img" :class="{ selected: selectedTeeth.includes(32) }" @click="toggleTooth(32)">
            <div class="tooth-number">32</div>
          </div>
        </div>

        <!-- Lower Teeth (1-15) -->
        <div class="teeth-container lower-teeth">
          <div class="tooth-wrapper">
            <img src="../../assets/img/1.jpeg" alt="سن 1" class="tooth-img" :class="{ selected: selectedTeeth.includes(1) }" @click="toggleTooth(1)">
            <div class="tooth-number">1</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/2.jpeg" alt="سن 2" class="tooth-img" :class="{ selected: selectedTeeth.includes(2) }" @click="toggleTooth(2)">
            <div class="tooth-number">2</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/3.jpeg" alt="سن 3" class="tooth-img" :class="{ selected: selectedTeeth.includes(3) }" @click="toggleTooth(3)">
            <div class="tooth-number">3</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/4.jpeg" alt="سن 4" class="tooth-img" :class="{ selected: selectedTeeth.includes(4) }" @click="toggleTooth(4)">
            <div class="tooth-number">4</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/5.jpeg" alt="سن 5" class="tooth-img" :class="{ selected: selectedTeeth.includes(5) }" @click="toggleTooth(5)">
            <div class="tooth-number">5</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/6.jpeg" alt="سن 6" class="tooth-img" :class="{ selected: selectedTeeth.includes(6) }" @click="toggleTooth(6)">
            <div class="tooth-number">6</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/7.jpeg" alt="سن 7" class="tooth-img" :class="{ selected: selectedTeeth.includes(7) }" @click="toggleTooth(7)">
            <div class="tooth-number">7</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/8.jpeg" alt="سن 8" class="tooth-img" :class="{ selected: selectedTeeth.includes(8) }" @click="toggleTooth(8)">
            <div class="tooth-number">8</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/9.jpeg" alt="سن 9" class="tooth-img" :class="{ selected: selectedTeeth.includes(9) }" @click="toggleTooth(9)">
            <div class="tooth-number">9</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/10.jpeg" alt="سن 10" class="tooth-img" :class="{ selected: selectedTeeth.includes(10) }" @click="toggleTooth(10)">
            <div class="tooth-number">10</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/11.jpeg" alt="سن 11" class="tooth-img" :class="{ selected: selectedTeeth.includes(11) }" @click="toggleTooth(11)">
            <div class="tooth-number">11</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/12.jpeg" alt="سن 12" class="tooth-img" :class="{ selected: selectedTeeth.includes(12) }" @click="toggleTooth(12)">
            <div class="tooth-number">12</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/13.jpeg" alt="سن 13" class="tooth-img" :class="{ selected: selectedTeeth.includes(13) }" @click="toggleTooth(13)">
            <div class="tooth-number">13</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/14.jpeg" alt="سن 14" class="tooth-img" :class="{ selected: selectedTeeth.includes(14) }" @click="toggleTooth(14)">
            <div class="tooth-number">14</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/15.jpeg" alt="سن 15" class="tooth-img" :class="{ selected: selectedTeeth.includes(15) }" @click="toggleTooth(15)">
            <div class="tooth-number">15</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/1.jpeg" alt="سن 16" class="tooth-img" :class="{ selected: selectedTeeth.includes(1) }" @click="toggleTooth(16)">
            <div class="tooth-number">16</div>
          </div>
        </div>

        <!-- Color -->
        <label for="color">لون السن:</label>
        <select id="color" class="form-select" v-model="orderData.color" :required="!orderData.prova" v-if="!orderData.prova">
          <option value="" disabled>اختر لون</option>
          <option
              v-for="color in availableColors"
              :key="color.value"
              :value="color.value"
              :style="{ backgroundColor: color.bgColor }"
          >
            {{ color.label }}
          </option>
        </select>
        <span class="error" v-if="errors.color">{{ errors.color }}</span>

        <!-- Notes -->
        <label for="notes">ملاحظات:</label>
        <textarea
            id="notes"
            v-model="orderData.description"
            @input="formatNote"
        ></textarea>
        <span class="error" v-if="errors.description">{{ errors.description }}</span>

        <!-- Price (auto-calculated) -->
        <label>السعر:</label>
        <input
            type="text"
            :value="formatCurrency(calculatedPrice)"
            readonly
        />

        <!-- Deadline -->
        <label for="deadline">تاريخ الموعد النهائي:</label>
        <input
            type="date"
            id="deadline"
            v-model="orderData.deadline"
            required
        />
        <span class="error" v-if="errors.deadline">{{ errors.deadline }}</span>

        <!-- Audio -->
        <!--        <label for="audio">تسجيل صوتي:</label>-->
        <!--        <input-->
        <!--            type="file"-->
        <!--            id="audio"-->
        <!--            accept="audio/*"-->
        <!--            class="file-input"-->
        <!--            @change="handleFileUpload($event, 'video')"-->
        <!--        />-->
        <!--        <span class="error" v-if="errors.video">{{ errors.video }}</span>-->

        <!--        &lt;!&ndash; Images &ndash;&gt;-->
        <!--        <label for="photo">صور (حتى 3):</label>-->
        <!--        <input-->
        <!--            type="file"-->
        <!--            id="photo"-->
        <!--            accept="image/*"-->
        <!--            class="file-input"-->
        <!--            multiple-->
        <!--            @change="handleFileUpload($event, 'images')"-->
        <!--        />-->
        <!--        <span class="error" v-if="errors.images">{{ errors.images }}</span>-->

        <!-- Submit Button -->
        <button type="submit">إرسال</button>

        <!-- Print Icon Inside Form (Matching ShowOrder.vue) -->
        <div class="print-icon" @click="printForm" title="طباعة كملف PDF">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 14H6V22H18V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </fieldset>

      <!-- Print and PDF Icons (Outside Form) -->
      <div class="action-buttons" style="margin-top: 25px">
        <!-- Print Icon -->
        <div class="action-icon" @click="printOrder" title="طباعة الطلب">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 14H6V22H18V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>

      <!-- Printable Area -->
      <div class="print-area" ref="printableArea" style="display: none;">
        <div class="print-container">
          <h2>تفاصيل الطلب</h2>
          <p><strong>رقم الطلب:</strong> <span>{{ orderId || '--' }}</span></p>
          <p><strong>اسم المريض:</strong> <span>{{ orderData.patientName || '--' }}</span></p>
          <p><strong>الجنس:</strong> <span>{{ orderData.sex === 'male' ? 'ذكر' : 'أنثى' }}</span></p>
          <p><strong>العمر:</strong> <span>{{ orderData.age || '--' }}</span></p>
          <p><strong>الحالة:</strong> <span>{{ orderData.prova ? 'مؤقت' : 'نهائي' }}</span></p>
          <p><strong>ملف المسح:</strong> <span>{{ orderData.scanFile ? 'نعم' : 'لا' }}</span></p>
          <p><strong>عدد الأسنان:</strong> <span>{{ orderData.teethNo || '--' }}</span></p>
          <p><strong>الأسنان المختارة:</strong> <span>{{ selectedTeeth.length > 0 ? selectedTeeth.join(', ') : '--' }}</span></p>
          <p><strong>المختبر:</strong> <span>{{ labs.find(lab => lab._id === orderData.labId)?.username || '--' }}</span></p>
          <p><strong>نوع السن:</strong> <span>{{ orderData.type || '--' }}</span></p>
          <p><strong>لون السن:</strong> <span>{{ orderData.color || '--' }}</span></p>
          <p><strong>ملاحظات:</strong> <span>{{ orderData.description || '--' }}</span></p>
          <p><strong>السعر:</strong> <span>{{ formatCurrency(calculatedPrice) }}</span></p>
          <p><strong>الموعد النهائي:</strong> <span>{{ orderData.deadline || '--' }}</span></p>
          <p><strong>ملفات الوسائط:</strong> <span>{{ orderData.media.length > 0 ? orderData.media.map(file => file.name).join(', ') : '--' }}</span></p>
        </div>
      </div>
    </form>
  </div>

  <!-- Chat Icon -->
  <div class="chat-icon" title="تحدث معنا">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 11.5C21 16.1944 16.9706 20 12 20C11.1185 20 10.2687 19.892 9.461 19.6912C8.84744 20.5295 7.94437 21.5 6 21.5C5.71765 21.5 5.46976 21.306 5.35165 21.0185C5.23353 20.731 5.27059 20.3985 5.44653 20.1465C5.62247 19.8945 5.5 19.5 5.5 19.5C5.5 16.356 7.85653 14 11 14C11.8865 14 12.7353 14.108 13.542 14.3088C15.142 13.5025 16.5 12.1015 16.5 11.5C16.5 9.567 14.4853 8 12 8C9.51471 8 7.5 9.567 7.5 11.5C7.5 12.1015 8.85882 13.5025 10.4588 14.3088C11.2655 14.108 12.1143 14 13 14C16.1435 14 18.5 16.356 18.5 19.5C18.5 19.5 18.3775 19.8945 18.5535 20.1465C18.7294 20.3985 18.7665 20.731 18.6484 21.0185C18.5303 21.306 18.2824 21.5 18 21.5C16.0556 21.5 15.1526 20.5295 14.539 19.6912C13.7313 19.892 12.8815 20 12 20C7.02944 20 3 16.1944 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</template>

<script>
import axios from "axios";
import DoctorNavbar from "@/components/navbars/doctorNavbar.vue";
// import { format } from "date-fns";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
export default {
  name: "NewOrder",
  data() {
    return {
      isActiveSidebar: false,
      labs: [],
      availableColors: [
        { value: 'A1', label: 'A1', bgColor: '#f0e5d1' },
        { value: 'A2', label: 'A2', bgColor: '#e6d9c3' },
        { value: 'A3', label: 'A3', bgColor: '#e0d0b8' },
        { value: 'A3.5', label: 'A3.5', bgColor: '#d9c8ad' },
        { value: 'A4', label: 'A4', bgColor: '#d3c0a2' },
        { value: 'B1', label: 'B1', bgColor: '#e8e1d1' },
        { value: 'B2', label: 'B2', bgColor: '#d9cfb8' },
        { value: 'B3', label: 'B3', bgColor: '#c9bba0' },
        { value: 'B4', label: 'B4', bgColor: '#baa887' },
        { value: 'C1', label: 'C1', bgColor: '#e0d5c0' },
        { value: 'C2', label: 'C2', bgColor: '#d5c6ab' },
        { value: 'C3', label: 'C3', bgColor: '#c9b796' },
        { value: 'C4', label: 'C4', bgColor: '#bda881' },
        { value: 'D2', label: 'D2', bgColor: '#e3d8c6' },
        { value: 'D3', label: 'D3', bgColor: '#d7c9b2' },
        { value: 'D4', label: 'D4', bgColor: '#cbba9e' },
        { value: 'BL1', label: 'BL1', bgColor: '#e0d9cc' },
        { value: 'BL2', label: 'BL2', bgColor: '#d1c7b5' },
        { value: 'BL3', label: 'BL3', bgColor: '#c2b59e' },
        { value: 'BL4', label: 'BL4', bgColor: '#b3a387' }
      ],
      selectedTeeth: [],
      orderId: null,
      availableTeethTypes: {},
      orderData: {
        patientName: "",
        age: "",
        sex: "",
        teethNo: "",
        color: "",
        type: "",
        description: "",
        price: "",
        deadline: "",
        labId: "",
        images: [],
        video: null,
        file: null,
        prova: true,
        scanFile: false,
        media: [],
        save: true
      },
      // https://rr-5d46.onrender.com
      baseUrl: "http://localhost:3000",
      errors: {},
      upperTeeth: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
      lowerTeeth: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    };
  },
  components: {
    DoctorNavbar
  },
  computed: {
    calculatedPrice() {
      if (this.orderData.type && this.availableTeethTypes[this.orderData.type]) {
        const basePrice = this.availableTeethTypes[this.orderData.type];
        const teethCount = parseInt(this.orderData.teethNo) || 0;
        return basePrice * teethCount;
      }
      return 0;
    }
  },
  created() {

    this.fetchLabs();
  },
  watch: {
    'orderData.scanFile': function(newVal) {
      console.log('scanFile changed to:', newVal);
      console.log('labId:', this.orderData.labId);
    },
    'orderData.labId': function(newVal) {
      console.log('labId changed to:', newVal);
      console.log('scanFile:', this.orderData.scanFile);
    }
  },
  methods: {
    async fetchLabs() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${this.baseUrl}/orders/getMyLabs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.labs = response.data.labs.myLabs;
        if (response.data.labs.contract) {
          this.doctorId = response.data.labs.contract.doctorId;
        }
      } catch (error) {
        console.error("Error fetching labs:", error);
        this.showError("Failed to load labs. Please try again.");
      }
    },

    getLabEmail(labId) {
      const selectedLab = this.labs.find(lab => lab._id === labId);
      return selectedLab ? selectedLab.email : '';
    },

    updateTeethTypes() {
      this.selectedTeeth = [];
      this.orderData.teethNo = "0";

      const selectedLab = this.labs.find(lab => lab._id === this.orderData.labId);

      if (selectedLab) {
        const doctorId = this.doctorId || JSON.parse(localStorage.getItem("doctor"))?.id;

        if (!doctorId) {
          this.showError("Doctor information not found. Please login again.");
          return;
        }

        const contract = selectedLab.contracts.find(
            c => c.doctorId?.toString() === doctorId.toString()
        );

        if (contract && contract.teethTypes) {
          this.availableTeethTypes = contract.teethTypes;
          const firstType = Object.keys(contract.teethTypes)[0];
          if (firstType) {
            this.orderData.type = firstType;
          }
        } else {
          this.availableTeethTypes = {};
          this.orderData.type = "";
          this.showError("No contract found with this lab for the current doctor.");
        }
      } else {
        this.availableTeethTypes = {};
        this.orderData.type = "";
        this.showError("Selected lab not found.");
      }
    },

    formatCurrency (value) {
      return new Intl.NumberFormat('en-JO', {
        style: 'currency',
        currency: 'JOD'
      }).format(value || 0);
    },

    formatNote() {
      this.orderData.description = this.orderData.description.replace(
          /(\d+)\s/g,
          "$1, "
      );
    },

    handleFileUpload(event, field) {
      const maxFileSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'audio/mpeg',
        'audio/wav',
        'application/zip'
      ];
      const maxFiles = 10;

      const files = Array.from(event.target.files);
      if (files.length > maxFiles) {
        this.showError(`You can upload a maximum of ${maxFiles} files.`);
        return;
      }

      for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
          this.showError('Only JPEG, PNG, MP3, WAV, and ZIP files are allowed.');
          return;
        }
        if (file.size > maxFileSize) {
          this.showError('Each file must be less than 5MB.');
          return;
        }
      }

      if (field === 'images' || field === 'video') {
        this.orderData.media = [...this.orderData.media, ...files].slice(0, maxFiles);
      } else if (field === 'zip') {
        this.orderData.media = [...this.orderData.media, ...files].slice(0, maxFiles);
      }
    },

    toggleTooth(toothNumber) {
      if (this.selectedTeeth.includes(toothNumber)) {
        this.selectedTeeth = this.selectedTeeth.filter(n => n !== toothNumber);
      } else {
        this.selectedTeeth.push(toothNumber);
      }
      this.orderData.teethNo = this.selectedTeeth.length.toString();
    },

    validateForm() {
      this.errors = {};
      let isValid = true;

      const requiredFields = [
        "patientName",
        "age",
        "sex",
        "teethNo",
        "type",
        "deadline",
        "labId",
      ];

      requiredFields.forEach(field => {
        if (!this.orderData[field]) {
          this.errors[field] = `${this.getFieldLabel(field)} is required`;
          isValid = false;
        }
      });
      // Add color validation only for final orders
      if (!this.orderData.prova && !this.orderData.color) {
        this.errors.color = "Color is required for final orders";
        isValid = false;
      }
      if (this.orderData.age && (this.orderData.age < 0 || this.orderData.age > 120)) {
        this.errors.age = "Please enter a valid age";
        isValid = false;
      }

      if (this.orderData.teethNo && this.orderData.teethNo < 1) {
        this.errors.teethNo = "Please select at least one tooth";
        isValid = false;
      }

      return isValid;
    },

    getFieldLabel(field) {
      const labels = {
        patientName: "Patient Name",
        age: "Age",
        sex: "Gender",
        teethNo: "Number of Teeth",
        color: "Color",
        type: "Type",
        description: "Requirements",
        deadline: "Deadline Date",
        labId: "Lab",
      };
      return labels[field] || field;
    },

    async submitOrder() {
      if (!this.validateForm()) {
        return;
      }

      try {
        const formData = new FormData();

        if (this.selectedTeeth.length > 0) {
          const teethNote = `Teeth numbers: ${this.selectedTeeth.join(', ')}. `;
          this.orderData.description = teethNote + (this.orderData.description || '');
        }

        this.orderData.price = this.calculatedPrice;

        Object.keys(this.orderData).forEach(key => {
          if (key === 'media') {
            this.orderData.media.forEach((file, index) => {
              formData.append(`media${index}`, file);
            });
          } else if (this.orderData[key] !== null && this.orderData[key] !== undefined) {
            formData.append(key, this.orderData[key]);
          }
        });

        const response = await axios.post(
            `${this.baseUrl}/orders/create`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
        );
        alert(response.data.message);

        const randomLetters =
            String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
            String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const randomDigits = Math.floor(10 + Math.random() * 90);
        this.orderId = `Order ID: ${randomLetters}${randomDigits}`;

        this.showSuccess("Order created successfully!");
        this.resetForm();
      } catch (error) {
        this.handleApiError(error);
      }
    },

    handleApiError(error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            this.showError(
                error.response.data.message || "Invalid data. Please check your inputs."
            );
            break;
          case 401:
            this.showError("Unauthorized. Please login again.");
            break;
          case 500:
            this.showError("Server error. Please try again later.");
            break;
          default:
            this.showError("An error occurred. Please try again.");
        }
      } else {
        this.showError("Network error. Please check your connection.");
      }
    },

    showError(message) {
      alert(message);
    },

    showSuccess(message) {
      alert(message);
    },

    resetForm() {
      this.orderId = null;
      this.selectedTeeth = [];
      this.orderData = {
        patientName: "",
        age: "",
        sex: "",
        teethNo: "",
        color: "",
        type: "",
        description: "",
        price: "",
        deadline: "",
        labId: "",
        images: [],
        video: null,
        file: null,
        prova: true,
        scanFile: false,
        media: [],
      };
      this.errors = {};
    },

    preparePrintContent() {
      if (!this.$refs.printableArea) {
        toast.error("Printable area not found. Please try again.");
        return null;
      }

      const printStyles = `
    @page {
      size: A5;
      margin: 5mm; /* Reduced from 10mm to save space */
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      font-size: 8pt; /* Reduced from 10pt */
      line-height: 1.2; /* Reduced from 1.4 */
    }
    .print-container {
      padding: 5mm; /* Reduced from 10mm */
      width: 100%;
      box-sizing: border-box;
      page-break-inside: avoid;
      transform: scale(0.9); /* Slightly scale down to fit */
      transform-origin: top left;
    }
    .print-container h2 {
      font-size: 12pt; /* Reduced from 14pt */
      margin-bottom: 5mm; /* Reduced from 10mm */
      text-align: center;
    }
    .print-container p {
      margin: 2mm 0; /* Reduced from 5mm */
      padding: 2mm; /* Reduced from 5mm */
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #eee;
    }
    .print-container p strong {
      font-weight: bold;
      flex: 1;
    }
    .print-container p span {
      flex: 2;
      text-align: left;
    }
    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  `;

      const printableElement = this.$refs.printableArea.cloneNode(true);
      printableElement.style.display = 'block';

      return { printStyles, printableElement };
    },
    executePrint({ printStyles, printableElement }) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        this.showError("Failed to open print window. Please allow popups for this site.");
        return;
      }

      const htmlStart = '<html><head><title>Order Print</title><style>';
      const htmlMiddle = '</style></head><body>';
      const htmlEnd = '</body></html>';

      printWindow.document.write(htmlStart + printStyles + htmlMiddle + printableElement.innerHTML + htmlEnd);
      printWindow.document.close();

      // Wait for the window to load before printing
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };

      // Fallback in case onload doesn't fire
      setTimeout(() => {
        if (printWindow.document.readyState === 'complete') {
          printWindow.print();
          printWindow.close();
        }
      }, 1000);
    },

    printOrder() {
      if (!this.validateForm()) {
        this.showError("Please fill out all required fields before printing.");
        return;
      }
      const { printStyles, printableElement } = this.preparePrintContent();
      this.executePrint({ printStyles, printableElement });
    },

    printForm() {
      if (!this.validateForm()) {
        this.showError("Please fill out all required fields before printing.");
        return;
      }
      const { printStyles, printableElement } = this.preparePrintContent();
      this.executePrint({ printStyles, printableElement });
    }
  }
};
</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
  margin: 0 auto;
  padding-top: 80px;
}

.chat-icon {
  position: fixed;
  bottom: 20px;
  right: 20px;
  font-size: 1.625rem;
  background: #007bff;
  color: white;
  padding: 12px;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-icon:hover {
  background: #0069d9;
}

.chat-icon svg {
  width: 1em;
  height: 1em;
}

.form-container {
  position: relative;
  background-color: white;
  padding: 30px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  margin: 100px auto 20px;
  box-sizing: border-box;
}

fieldset {
  border: none;
  margin-bottom: 15px;
}

label,
legend {
  font-weight: bold;
  font-size: 1rem;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea {
  height: 100px;
  resize: vertical;
}

button {
  background-color: #4caf50;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

button:hover {
  background-color: #45a049;
}

.navbar-logo img {
  height: 40px;
  width: auto;
  border-radius: 4px;
}

.file-input {
  padding: 0;
}

.order-id-box {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #4caf50;
  color: white;
  padding: 10px 15px;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
}

.form-select option {
  padding: 8px;
  margin: 2px 0;
}

.form-select option[style*="background-color"] {
  color: #333;
  font-weight: bold;
  text-shadow: 0 0 2px rgba(255,255,255,0.7);
}

.teeth-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 10px;
  justify-items: center;
  margin: 15px 0;
}

.tooth-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tooth-img {
  width: 40px;
  height: auto;
  border: 2px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tooth-img:hover {
  opacity: 0.7;
}

.tooth-img.selected {
  border: 2px solid rgb(0, 255, 4);
  box-shadow: 0 0 10px rgba(12, 204, 48, 0.5);
  opacity: 1;
}

.tooth-number {
  font-size: 0.75rem;
  font-weight: bold;
  margin-top: 3px;
  text-align: center;
}

.description {
  text-align: center;
  margin-top: 20px;
  font-size: 1.125rem;
  color: #333;
  visibility: hidden;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.action-icon {
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
  padding: 8px;
  border-radius: 4px;
}

.action-icon:hover {
  color: #0066cc;
  background: #f0f0f0;
}

.action-icon svg {
  width: 24px;
  height: 24px;
  display: block;
}

.print-icon {
  position: absolute;
  bottom: 20px;
  left: 20px;
  font-size: 1.375rem;
  background: #4caf50;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.print-icon svg {
  width: 24px;
  height: 24px;
}

@media print {
  body * {
    visibility: hidden;
  }
  #printable-area, #printable-area * {
    visibility: visible;
  }
  #printable-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
}

.description.visible {
  visibility: visible;
}

.error {
  color: red;
  font-size: 0.875rem;
  display: block;
  margin-top: 5px;
}

@media (max-width: 1200px) {
  .navbar-container {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }

  .nav-links {
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
  }

  .form-container {
    width: 95%;
    padding: 20px;
    margin-top: 80px;
  }

  .order-id-box {
    top: 10px;
    right: 10px;
    font-size: 0.875rem;
    padding: 8px 12px;
  }

  .print-icon {
    bottom: 10px;
    left: 10px;
    font-size: 1.125rem;
    padding: 6px 10px;
  }

  .teeth-container {
    grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
  }

  .tooth-img {
    width: 20px;
  }

  .tooth-number {
    font-size: 0.625rem;
  }
}

@media (max-width: 1199px) {
  .navbar-logo {
    font-size: 1.25rem;
  }

  .form-container {
    padding: 15px;
  }

  label,
  legend {
    font-size: 0.875rem;
  }

  input,
  select,
  textarea {
    padding: 8px;
  }

  button {
    padding: 10px;
  }

  .teeth-container {
    grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
  }

  .tooth-img {
    width: 25px;
  }
}

.lab-selection-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.email-icon {
  color: #666;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.email-icon:hover {
  color: #0066cc;
}

.email-icon svg {
  width: 1em;
  height: 1em;
}
.teeth-container {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  justify-content: center;
  gap: 10px;
  margin: 15px 0;
  padding: 10px 0;
}

.tooth-wrapper {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* For tablet view specifically */
@media (max-width: 1024px) {
  .teeth-container {
    gap: 8px;
  }

  .tooth-img {
    width: 30px;
  }

  .tooth-number {
    font-size: 0.7rem;
  }
}

/* For mobile view */
@media (max-width: 768px) {
  .teeth-container {
    gap: 5px;
  }

  .tooth-img {
    width: 25px;
  }

  .tooth-number {
    font-size: 0.6rem;
  }
}
</style>
```