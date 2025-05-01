<template>
  <div class="services-container">
    <div class="card">
      <h2>🚀 التوصيل</h2>
      <p>توصيل سريع وآمن إلى جميع المواقع.</p>
    </div>
    <div class="card">
      <h2>🎁 العروض</h2>
      <p>استمتع بأفضل العروض والهدايا المميزة.</p>
    </div>
    <div class="card">
      <h2>🔑 إدارة الحسابات</h2>
      <p>إدارة وتنظيم الحسابات بسهولة وأمان.</p>
    </div>
    <div class="card">
      <a href="/create-order">
        <h2>🏥 واجهة أوردر للطبيب</h2>
        <p>نظام طلب متطور ومريح للأطباء.</p>
      </a>
    </div>
    <div class="card">
      <h2>🖨️ الطباعة</h2>
      <p>طباعة بجودة عالية ودقة متناهية.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ServicesComponent',
};
</script>

<style scoped>
.services-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.card {
  background: rgba(114, 110, 110, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 20px;
  width: 500px;
  border-radius: 15px;
  text-align: center;
  transition: 0.3s;
}

.card:hover {
  transform: scale(1.05);
  background: rgba(31, 29, 29, 0.2);
}

.card h2 {
  margin-bottom: 10px;
  font-size: 22px;
  color: rgb(101, 93, 93);
}

.card p {
  font-size: 16px;
  color: black;
}
</style>