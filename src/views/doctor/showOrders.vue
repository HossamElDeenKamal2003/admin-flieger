<template>
  <labNavbar />
  <!-- حاوية النموذج -->
  <div class="form-container" ref="formContainer">
    <div class="order-id-box">{{ orderId || 'رقم الطلب: --' }}</div>

    <form @submit.prevent="submitOrder">
      <fieldset>
        <legend>معلومات المريض</legend>

        <!-- الحالة -->
        <label for="status">الحالة:</label>
        <select v-model="orderData.prova" id="status">
          <option :value="true">مؤقت</option>
          <option :value="false">نهائي</option>
        </select>
        <span class="error" v-if="errors.prova">{{ errors.prova }}</span>

        <!-- اسم المريض -->
        <label for="patientName">اسم المريض:</label>
        <input
            type="text"
            id="patientName"
            v-model="orderData.patientName"
            required
        />
        <span class="error" v-if="errors.patientName">{{ errors.patientName }}</span>
        <label>طلب إرجاع</label>
        <h6 v-if="orderData.returned === 'true'" style="color: red;">تم إرجاع الطلب إلى المعمل</h6>
        <select v-model="orderData.returned">
          <option value="false">غير مرجع</option>
          <option value="true">إرجاع الطلب</option>
        </select>

        <!-- الجنس -->
        <label for="patientGender">الجنس:</label>
        <select v-model="orderData.sex" id="patientGender">
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>
        <span class="error" v-if="errors.sex">{{ errors.sex }}</span>

        <!-- العمر -->
        <label for="patientAge">العمر:</label>
        <input
            type="number"
            id="patientAge"
            v-model="orderData.age"
            required
        />
        <span class="error" v-if="errors.age">{{ errors.age }}</span>

        <!-- عدد الأسنان -->
        <label for="teethCount">عدد الأسنان المعالجة:</label>
        <input
            type="number"
            id="teethCount"
            v-model="orderData.teethNo"
            required
            readonly
        />
        <span class="error" v-if="errors.teethNo">{{ errors.teethNo }}</span>

        <!-- نوع الأسنان -->
        <label for="toothType">نوع الأسنان:</label>
        <input type="text" id="toothType" v-model="orderData.type" required />
        <span class="error" v-if="errors.type">{{ errors.type }}</span>

        <!-- اختيار الأسنان -->
        <h2>اضغط على السن لاختياره</h2>
        <div
            id="tooth-description"
            class="description"
            :class="{ visible: selectedTeeth.length > 0 }"
        >
          لقد اخترت السن رقم: <span id="tooth-number">{{ selectedTeeth.join(", ") }}</span>
        </div>

        <!-- الأسنان العلوية (17-32) -->
        <div class="teeth-container upper-teeth">
          <div class="tooth-wrapper">
            <img src="../../assets/img/17.jpeg" alt="السن 17" class="tooth-img" :class="{ selected: selectedTeeth.includes(17) }" @click="toggleTooth(17)">
            <div class="tooth-number">17</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/18.jpeg" alt="السن 18" class="tooth-img" :class="{ selected: selectedTeeth.includes(18) }" @click="toggleTooth(18)">
            <div class="tooth-number">18</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/19.jpeg" alt="السن 19" class="tooth-img" :class="{ selected: selectedTeeth.includes(19) }" @click="toggleTooth(19)">
            <div class="tooth-number">19</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/20.jpeg" alt="السن 20" class="tooth-img" :class="{ selected: selectedTeeth.includes(20) }" @click="toggleTooth(20)">
            <div class="tooth-number">20</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/21.jpeg" alt="السن 21" class="tooth-img" :class="{ selected: selectedTeeth.includes(21) }" @click="toggleTooth(21)">
            <div class="tooth-number">21</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/22.jpeg" alt="السن 22" class="tooth-img" :class="{ selected: selectedTeeth.includes(22) }" @click="toggleTooth(22)">
            <div class="tooth-number">22</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/23.jpeg" alt="السن 23" class="tooth-img" :class="{ selected: selectedTeeth.includes(23) }" @click="toggleTooth(23)">
            <div class="tooth-number">23</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/24.jpeg" alt="السن 24" class="tooth-img" :class="{ selected: selectedTeeth.includes(24) }" @click="toggleTooth(24)">
            <div class="tooth-number">24</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/25.jpeg" alt="السن 25" class="tooth-img" :class="{ selected: selectedTeeth.includes(25) }" @click="toggleTooth(25)">
            <div class="tooth-number">25</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/26.jpeg" alt="السن 26" class="tooth-img" :class="{ selected: selectedTeeth.includes(26) }" @click="toggleTooth(26)">
            <div class="tooth-number">26</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/27.jpeg" alt="السن 27" class="tooth-img" :class="{ selected: selectedTeeth.includes(27) }" @click="toggleTooth(27)">
            <div class="tooth-number">27</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/28.jpeg" alt="السن 28" class="tooth-img" :class="{ selected: selectedTeeth.includes(28) }" @click="toggleTooth(28)">
            <div class="tooth-number">28</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/29.jpeg" alt="السن 29" class="tooth-img" :class="{ selected: selectedTeeth.includes(29) }" @click="toggleTooth(29)">
            <div class="tooth-number">29</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/30.jpeg" alt="السن 30" class="tooth-img" :class="{ selected: selectedTeeth.includes(30) }" @click="toggleTooth(30)">
            <div class="tooth-number">30</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/31.jpeg" alt="السن 31" class="tooth-img" :class="{ selected: selectedTeeth.includes(31) }" @click="toggleTooth(31)">
            <div class="tooth-number">31</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/32.jpeg" alt="السن 32" class="tooth-img" :class="{ selected: selectedTeeth.includes(32) }" @click="toggleTooth(32)">
            <div class="tooth-number">32</div>
          </div>
        </div>

        <!-- الأسنان السفلية (1-15) -->
        <div class="teeth-container lower-teeth">
          <div class="tooth-wrapper">
            <img src="../../assets/img/1.jpeg" alt="السن 1" class="tooth-img" :class="{ selected: selectedTeeth.includes(1) }" @click="toggleTooth(1)">
            <div class="tooth-number">1</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/2.jpeg" alt="السن 2" class="tooth-img" :class="{ selected: selectedTeeth.includes(2) }" @click="toggleTooth(2)">
            <div class="tooth-number">2</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/3.jpeg" alt="السن 3" class="tooth-img" :class="{ selected: selectedTeeth.includes(3) }" @click="toggleTooth(3)">
            <div class="tooth-number">3</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/4.jpeg" alt="السن 4" class="tooth-img" :class="{ selected: selectedTeeth.includes(4) }" @click="toggleTooth(4)">
            <div class="tooth-number">4</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/5.jpeg" alt="السن 5" class="tooth-img" :class="{ selected: selectedTeeth.includes(5) }" @click="toggleTooth(5)">
            <div class="tooth-number">5</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/6.jpeg" alt="السن 6" class="tooth-img" :class="{ selected: selectedTeeth.includes(6) }" @click="toggleTooth(6)">
            <div class="tooth-number">6</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/7.jpeg" alt="السن 7" class="tooth-img" :class="{ selected: selectedTeeth.includes(7) }" @click="toggleTooth(7)">
            <div class="tooth-number">7</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/8.jpeg" alt="السن 8" class="tooth-img" :class="{ selected: selectedTeeth.includes(8) }" @click="toggleTooth(8)">
            <div class="tooth-number">8</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/9.jpeg" alt="السن 9" class="tooth-img" :class="{ selected: selectedTeeth.includes(9) }" @click="toggleTooth(9)">
            <div class="tooth-number">9</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/10.jpeg" alt="السن 10" class="tooth-img" :class="{ selected: selectedTeeth.includes(10) }" @click="toggleTooth(10)">
            <div class="tooth-number">10</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/11.jpeg" alt="السن 11" class="tooth-img" :class="{ selected: selectedTeeth.includes(11) }" @click="toggleTooth(11)">
            <div class="tooth-number">11</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/12.jpeg" alt="السن 12" class="tooth-img" :class="{ selected: selectedTeeth.includes(12) }" @click="toggleTooth(12)">
            <div class="tooth-number">12</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/13.jpeg" alt="السن 13" class="tooth-img" :class="{ selected: selectedTeeth.includes(13) }" @click="toggleTooth(13)">
            <div class="tooth-number">13</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/14.jpeg" alt="السن 14" class="tooth-img" :class="{ selected: selectedTeeth.includes(14) }" @click="toggleTooth(14)">
            <div class="tooth-number">14</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/15.jpeg" alt="السن 15" class="tooth-img" :class="{ selected: selectedTeeth.includes(15) }" @click="toggleTooth(15)">
            <div class="tooth-number">15</div>
          </div>
          <div class="tooth-wrapper">
            <img src="../../assets/img/1.jpeg" alt="السن 1" class="tooth-img" :class="{ selected: selectedTeeth.includes(1) }" @click="toggleTooth(16)">
            <div class="tooth-number">16</div>
          </div>
        </div>

        <!-- اللون -->
        <label for="color">اللون:</label>
        <input type="text" id="color" v-model="orderData.color" required />
        <span class="error" v-if="errors.color">{{ errors.color }}</span>

        <label for="notes">ملاحظات:</label>
        <textarea
            id="notes"
            v-model="orderData.description"
            @input="formatNote"
        ></textarea>
        <span class="error" v-if="errors.description">{{ errors.description }}</span>

        <!-- تاريخ التسليم -->
        <label for="deadline">تاريخ التسليم:</label>
        <input
            type="date"
            id="deadline"
            v-model="orderData.deadline"
            required
        />
        <span class="error" v-if="errors.deadline">{{ errors.deadline }}</span>

        <!-- تسجيل صوتي -->
<!--        <label for="audio">تسجيل صوتي:</label>-->
<!--        <input-->
<!--            type="file"-->
<!--            id="audio"-->
<!--            accept="audio/*"-->
<!--            class="file-input"-->
<!--            @change="handleFileUpload($event, 'video')"-->
<!--        />-->
<!--        <span class="error" v-if="errors.video">{{ errors.video }}</span>-->

<!--        &lt;!&ndash; صور &ndash;&gt;-->
<!--        <label for="photo">صور (بحد أقصى 3):</label>-->
<!--        <input-->
<!--            type="file"-->
<!--            id="photo"-->
<!--            accept="image/*"-->
<!--            class="file-input"-->
<!--            multiple-->
<!--            @change="handleFileUpload($event, 'images')"-->
<!--        />-->
<!--        <span class="error" v-if="errors.images">{{ errors.images }}</span>-->

        <!-- زر التحديث -->
        <button type="submit" @click="updateOrder">تحديث</button>

      </fieldset>
      <!-- منطقة الطباعة -->
      <div class="print-area" ref="printableArea" style="display: none;">
        <div class="print-container">
          <h2>تفاصيل الطلب</h2>
          <p><strong>رقم الطلب:</strong> <span>{{ orderId || '--' }}</span></p>
          <p><strong>اسم المريض:</strong> <span>{{ orderData.patientName || '--' }}</span></p>
          <p><strong>الجنس:</strong> <span>{{ orderData.sex || '--' }}</span></p>
          <p><strong>العمر:</strong> <span>{{ orderData.age || '--' }}</span></p>
          <p><strong>الحالة:</strong> <span>{{ orderData.prova ? 'مؤقت' : 'نهائي' }}</span></p>
          <p><strong>ملف المسح:</strong> <span>{{ orderData.scanFile ? 'نعم' : 'لا' }}</span></p>
          <p><strong>عدد الأسنان:</strong> <span>{{ orderData.teethNo || '--' }}</span></p>
          <p><strong>الأسنان المختارة:</strong> <span>{{ selectedTeeth.length > 0 ? selectedTeeth.join(', ') : '--' }}</span></p>
          <p><strong>المعمل:</strong> <span>{{ labs.find(lab => lab._id === orderData.labId)?.username || '--' }}</span></p>
          <p><strong>نوع الأسنان:</strong> <span>{{ orderData.type || '--' }}</span></p>
          <p><strong>لون الأسنان:</strong> <span>{{ orderData.color || '--' }}</span></p>
          <p><strong>ملاحظات:</strong> <span>{{ orderData.description || '--' }}</span></p>
          <p><strong>السعر:</strong> <span>{{ formatCurrency(calculatedPrice) }}</span></p>
          <p><strong>تاريخ التسليم:</strong> <span>{{ orderData.deadline || '--' }}</span></p>
          <p><strong>الملفات المرفقة:</strong> <span>{{ orderData.media.length > 0 ? orderData.media.map(file => file.name).join(', ') : '--' }}</span></p>
        </div>
      </div>
      <div class="action-buttons" style="margin-top: 25px">
        <!-- أيقونة الطباعة -->
        <div class="action-icon" @click="printOrder" title="طباعة الطلب">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9V2H18V9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M6 18H4C2.89543 18 2 17.1046 2 16V11C2 9.89543 2.89543 9 4 9H20C21.1046 9 22 9.89543 22 11V16C22 17.1046 21.1046 18 20 18H18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 14H6V22H18V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </form>
  </div>

  <!-- أيقونة الدردشة -->
  <div class="chat-icon" title="الدردشة معنا">
    <font-awesome-icon icon="comments" />
  </div>
</template>
<script>
import labNavbar from "@/components/navbars/doctorNavbar.vue";
import axios from "axios";
import { format } from "date-fns";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

export default {
  name: "ShowOrder",
  components: {
    labNavbar,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      order: null,
      orderData: {
        prova: true,
        patientName: "",
        sex: "male",
        age: null,
        teethNo: 0,
        type: "",
        color: "",
        labId: "",
        description: "",
        returned: false,
        deadline: "",
        video: null,
        images: [],
        scanFile: false, // Added to match template
        media: [], // Added to match template
      },
      selectedTeeth: [],
      labs: [],
      errors: {},
      orderId: null,
      loading: false,
      error: null,
      cancelToken: null,
      retryCount: 0,
      maxRetries: 3,
      upperTeeth: Array.from({ length: 16 }, (_, i) => 17 + i), // 17-32
      lowerTeeth: Array.from({ length: 16 }, (_, i) => 1 + i), // 1-16 (corrected to include 16)
    };
  },
  computed: {
    calculatedPrice() {
      // Placeholder: Implement actual price calculation if needed
      return 0; // Replace with actual logic if available
    },
    isAuthenticated() {
      return !!localStorage.getItem("token");
    },
  },
  created() {
    this.fetchOrder();
  },
  beforeUnmount() {
    this.cancelRequest();
  },
  methods: {
    cancelRequest() {
      if (this.cancelToken) {
        this.cancelToken.cancel("Component unmounted");
      }
    },
    formatDate(date) {
      return date ? format(new Date(date), "MMM dd, yyyy HH:mm") : "N/A";
    },
    statusClass(status) {
      if (!status) return "";
      return `status-${status.toLowerCase().replace(/[()]/g, "").replace(/\s+/g, "-")}`;
    },
    async fetchOrder() {
      this.cancelRequest();
      this.loading = true;
      this.error = null;
      this.cancelToken = axios.CancelToken.source();

      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`https://rr-5d46.onrender.com/docdash/order/${this.id}`, {
          headers: { Authorization: `Bearer ${token}` },
          cancelToken: this.cancelToken.token,
        });

        if (!response.data?.order) {
          throw new Error("Order data is empty");
        }
        this.order = response.data.order;
        this.orderId = this.order.UID;

        // Map API data to orderData
        this.orderData = {
          prova: this.order.prova || true,
          patientName: this.order.patientName || "",
          sex: this.order.sex || "male",
          age: this.order.age || null,
          teethNo: this.order.teethNo || 0,
          returned: this.order.returned,
          type: this.order.type || "",
          color: this.order.color || "",
          labId: this.order.labId || "",
          description: this.order.description || "",
          deadline: this.order.deadline ? this.order.deadline.split("T")[0] : "",
          video: null,
          images: [],
          scanFile: this.order.scanFile || false,
          media: this.order.media || [],
        };

        // Set selected teeth
        this.selectedTeeth = this.order.teeth || [];
        this.orderData.teethNo = this.selectedTeeth.length;

        this.retryCount = 0;
      } catch (error) {
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
          return;
        }

        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 1000 * this.retryCount));
          return this.fetchOrder();
        }

        this.error = error.response?.data?.message || error.message || "Failed to load order details";

        if (error.response?.status === 404) {
          this.$router.push("/not-found");
        }
      } finally {
        this.loading = false;
      }
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-JO', {
        style: 'currency',
        currency: 'JOD'
      }).format(value || 0);
    },
    preparePrintContent() {
      if (!this.$refs.printableArea) {
        toast.error("Printable area not found. Please try again.");
        return null;
      }

      const printStyles = `
    @page {
      size: auto;
      margin: 5mm;
    }
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      font-size: 10pt;
      line-height: 1.4;
      -webkit-text-size-adjust: 100%; /* Prevent iOS text size adjust */
    }
    .print-container {
      padding: 10mm;
      width: 100%;
      box-sizing: border-box;
    }
    .print-container h2 {
      font-size: 14pt;
      margin-bottom: 10mm;
      text-align: center;
    }
    .print-container p {
      margin: 3mm 0;
      padding: 2mm;
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #eee;
      page-break-inside: avoid;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      .no-print, .no-print * {
        display: none !important;
      }
    }
  `;

      const printableElement = this.$refs.printableArea.cloneNode(true);
      printableElement.style.display = 'block';

      return { printStyles, printableElement };
    },
    executePrint({ printStyles, printableElement }) {
      if (!printableElement) {
        return;
      }

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error("Failed to open print window. Please allow popups for this site.");
        return;
      }

      const htmlStart = '<html><head><title>Order Print</title><style>';
      const htmlMiddle = '</style></head><body>';
      const htmlEnd = '</body></html>';

      printWindow.document.write(htmlStart + printStyles + htmlMiddle + printableElement.innerHTML + htmlEnd);
      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 200);
    },
    printOrder() {
      this.$nextTick(() => {
        const { printStyles, printableElement } = this.preparePrintContent();
        if (!printableElement) return;

        // Create an iframe instead of a new window
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '1px';
        iframe.style.height = '1px';
        iframe.style.left = '-9999px';
        iframe.style.top = '-9999px';
        iframe.style.border = 'none';

        document.body.appendChild(iframe);

        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open();
        doc.write(`
      <html>
        <head>
          <title>Order Print</title>
          <style>${printStyles}</style>
        </head>
        <body>${printableElement.innerHTML}</body>
      </html>
    `);
        doc.close();

        // Use contentWindow's print method
        const iframeWindow = iframe.contentWindow;

        // Mobile-specific delay
        const printDelay = /Mobile|Android|iP(hone|od|ad)/.test(navigator.userAgent) ? 1000 : 200;

        setTimeout(() => {
          iframeWindow.focus();
          iframeWindow.print();

          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, printDelay);
      });
    },
    async exportToPDF() {
      if (!this.$refs.printableArea) {
        toast.error("Printable area not found. Please try again.");
        return;
      }

      const element = this.$refs.printableArea;
      element.style.display = 'block'; // Temporarily show for PDF generation

      const opt = {
        margin: 10,
        filename: `order_${this.orderId || Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          letterRendering: true,
          useCORS: true
        },
        jsPDF: {
          unit: 'mm',
          format: 'a5',
          orientation: 'portrait'
        }
      };

      const pdfStyles = document.createElement('style');
      pdfStyles.innerHTML = `
        .print-container {
          padding: 10mm;
          font-size: 10pt;
          line-height: 1.4;
        }
        .print-container h2 {
          font-size: 14pt;
          margin-bottom: 10mm;
          text-align: center;
        }
        .print-container p {
          margin: 5mm 0;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #eee;
          padding: 5mm;
        }
        .print-container p strong {
          font-weight: bold;
          flex: 1;
        }
        .print-container p span {
          flex: 2;
          text-align: left;
        }
      `;
      element.appendChild(pdfStyles);

      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf().from(element).set(opt).save();

      element.removeChild(pdfStyles);
      element.style.display = 'none'; // Restore hidden state
    },
    toggleTooth(tooth) {
      if (this.selectedTeeth.includes(tooth)) {
        this.selectedTeeth = this.selectedTeeth.filter((t) => t !== tooth);
      } else {
        this.selectedTeeth.push(tooth);
      }
      this.orderData.teethNo = this.selectedTeeth.length;
    },
    formatNote() {
      this.orderData.description = this.orderData.description.trim();
    },
    handleFileUpload(event, type) {
      const files = event.target.files;
      if (type === "video") {
        this.orderData.video = files[0] || null;
        if (files.length > 1) {
          this.errors.video = "Only one audio file is allowed";
        } else {
          delete this.errors.video;
        }
      } else if (type === "images") {
        this.orderData.images = Array.from(files).slice(0, 3);
        if (files.length > 3) {
          this.errors.images = "Maximum 3 images allowed";
        } else {
          delete this.errors.images;
        }
      }
      this.orderData.media = [...this.orderData.images, ...(this.orderData.video ? [this.orderData.video] : [])];
    },
    async returnOrder() {
      const orderId = this.$route.params.id;
      const token = localStorage.getItem("token");
      try {
        const response = await axios.post(
            'https://rr-5d46.onrender.com/docdash/return-order',
            { orderId: orderId },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log(response);
        toast.success("Order returned successfully");
      } catch (error) {
        console.error("Return error:", error);
        toast.error(error?.response?.data?.message || error.message);
      }
    },
    async updateOrder() {
      try {
        const token = localStorage.getItem("token");
        console.log("id: ", this.id);
        const response = await axios.put(
            `https://rr-5d46.onrender.com/docdash/update/${this.id}`,
            this.orderData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
        );

        toast.success("Order updated successfully!");
        console.log("Updated order:", response.data.order);
        // Optionally refetch the order
        this.fetchOrder();
      } catch (error) {
        console.error("Error updating order:", error);
        toast.error(error.response?.data?.message || "Failed to update order");
      }
    }
  },
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
