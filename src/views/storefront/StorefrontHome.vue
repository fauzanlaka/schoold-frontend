<template>
  <div class="storefront-home">
    <!-- Hero Section -->
    <section class="storefront-hero text-center text-white" :style="{ backgroundImage: `url(${heroBg})` }">
      <div class="container-fluid hero-content py-5">
        <div class="row justify-content-center">
          <div class="col-lg-8 col-xl-7">
            <h1 class="display-2 fw-bold mb-4 text-shadow hero-title">ระบบบริหารจัดการโรงเรียน</h1>
            <p class="lead mb-5 fs-4 text-shadow-sm">เครื่องมือบริหารจัดการที่ครอบคลุมตั้งแต่ระดับอนุบาลถึงมัธยมศึกษา มีประสิทธิภาพ โปร่งใส และเหมาะกับบริบทท้องถิ่น</p>
            <div class="d-flex justify-content-center gap-3 flex-wrap">
              <router-link to="/register" class="btn btn-lg storefront-btn-primary px-5 py-3 shadow-lg btn-hover-lift">ลงทะเบียนโรงเรียน</router-link>
              <a href="#about" class="btn btn-lg btn-light text-primary-sf px-5 py-3 rounded-pill fw-bold shadow-lg btn-hover-lift">เรียนรู้เพิ่มเติม</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="py-6 bg-white section-padding">
      <div class="container">
        <!-- Section Header - Centered -->
        <div class="row justify-content-center mb-5">
          <div class="col-lg-8 text-center">
            <span class="badge bg-primary-sf text-white px-3 py-2 mb-3 rounded-pill">เกี่ยวกับเรา</span>
            <h2 class="fw-bold mb-4 text-primary-sf display-5">เกี่ยวกับแพลตฟอร์ม</h2>
            <p class="text-muted lead">ระบบบริหารจัดการโรงเรียนเป็นแพลตฟอร์มเปิดที่ออกแบบมาเพื่อสนับสนุนโรงเรียนในสามจังหวัดชายแดนภาคใต้และพื้นที่อื่นๆ</p>
            <p class="text-muted">เรามีเครื่องมือครบครันสำหรับจัดการข้อมูลนักเรียน การจัดการทรัพยากร การบริหารวิชาการ และอื่นๆ ที่เหมาะกับบริบทท้องถิ่น</p>
          </div>
        </div>
        
        <!-- Feature Cards - Symmetric 4-column grid -->
        <div class="row g-4 justify-content-center">
          <div class="col-6 col-lg-3">
            <div class="card sf-card h-100 text-center p-4 feature-card">
              <div class="display-4 text-warning mb-3 icon-bounce"><i class="fas fa-child"></i></div>
              <h5 class="fw-bold mb-2">ระดับอนุบาล</h5>
              <p class="small text-muted mb-0">เครื่องมือเฉพาะสำหรับการจัดการการศึกษาปฐมวัย</p>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card sf-card h-100 text-center p-4 feature-card">
              <div class="display-4 text-success mb-3 icon-bounce"><i class="fas fa-book-reader"></i></div>
              <h5 class="fw-bold mb-2">ระดับประถมศึกษา</h5>
              <p class="small text-muted mb-0">การติดตามผลการเรียนและกิจกรรมสำหรับนักเรียนประถม</p>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card sf-card h-100 text-center p-4 feature-card">
              <div class="display-4 text-info mb-3 icon-bounce"><i class="fas fa-graduation-cap"></i></div>
              <h5 class="fw-bold mb-2">ระดับมัธยมศึกษา</h5>
              <p class="small text-muted mb-0">การจัดการเกรด นวัตกรรม และเส้นทางอาชีพขั้นสูง</p>
            </div>
          </div>
          <div class="col-6 col-lg-3">
            <div class="card sf-card h-100 text-center p-4 feature-card">
              <div class="display-4 text-danger mb-3 icon-bounce"><i class="fas fa-chart-line"></i></div>
              <h5 class="fw-bold mb-2">ฝ่ายบริหาร</h5>
              <p class="small text-muted mb-0">การจัดการการเงิน บุคลากร และทรัพย์สินสำหรับผู้บริหารโรงเรียน</p>
            </div>
          </div>
        </div>
      </div>
    </section>


    <!-- Call to Action -->
    <section class="py-6 bg-primary-sf text-white text-center bg-gradient cta-section">
      <div class="container-fluid">
        <h2 class="fw-bold mb-4 display-5">พร้อมที่จะพัฒนาโรงเรียนของคุณหรือยัง?</h2>
        <p class="lead mb-5 opacity-90">เข้าร่วมกับโรงเรียนกว่าสิบแห่งที่ใช้แพลตฟอร์มของเราเพื่อเพิ่มประสิทธิภาพ</p>
        <router-link to="/register" class="btn btn-lg btn-warning text-dark fw-bold px-5 py-3 rounded-pill shadow-lg btn-hover-lift">เริ่มต้นใช้งานเลย</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import heroBg from '@/assets/images/hero_bg.png';
</script>

<style scoped>
.text-shadow {
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.text-shadow-sm {
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}
.section-padding {
    padding-top: 5rem;
    padding-bottom: 5rem;
}
.bg-primary-sf {
    background-color: var(--sf-primary);
}
</style>
