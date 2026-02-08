<template>
  <div class="d-flex flex-column min-vh-100">
    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg storefront-navbar fixed-top">
      <div class="container-fluid">
        <router-link to="/" class="navbar-brand storefront-brand ms-3">
          <i class="fas fa-school me-2"></i>ศูนย์บริหารโรงเรียน
        </router-link>
        <button class="navbar-toggler me-3" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center me-3">
            <li class="nav-item">
              <router-link to="/" class="nav-link storefront-nav-link">หน้าแรก</router-link>
            </li>
            <li class="nav-item">
              <a href="#about" class="nav-link storefront-nav-link">เกี่ยวกับเรา</a>
            </li>
            <li class="nav-item">
              <a href="#modules" class="nav-link storefront-nav-link">บริการ</a>
            </li>
            <li class="nav-item ms-lg-3">
              <router-link to="/login" class="nav-link storefront-nav-link">
                เข้าสู่ระบบ
              </router-link>
            </li>
            <li class="nav-item ms-2">
               <router-link to="/register" class="btn storefront-btn storefront-btn-primary">
                ลงทะเบียน
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow-1" style="padding-top: 76px;"> <!-- Padding for fixed navbar -->
      <router-view></router-view>
    </main>

    <!-- Footer -->
    <footer class="storefront-footer text-center">
      <div class="container-fluid px-4">
        <div class="row">
          <div class="col-md-4 mb-4 mb-md-0 text-start">
            <h5 class="fw-bold mb-3">ศูนย์บริหารโรงเรียน</h5>
            <p class="small text-white-50">ยกระดับการศึกษาด้วยเทคโนโลยี ระบบบริหารจัดการที่ครบครันสำหรับโรงเรียนทุกระดับ</p>
          </div>
          <div class="col-md-4 mb-4 mb-md-0">
            <h5 class="fw-bold mb-3">ลิงก์ด่วน</h5>
            <ul class="list-unstyled">
              <li><a href="#" class="text-white-50 text-decoration-none">หน้าแรก</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none">โมดูลต่างๆ</a></li>
              <li><a href="#" class="text-white-50 text-decoration-none">ติดต่อฝ่ายสนับสนุน</a></li>
            </ul>
          </div>
          <div class="col-md-4 text-md-end">
            <h5 class="fw-bold mb-3">ติดต่อเรา</h5>
            <p class="small text-white-50 mb-1"><i class="fas fa-phone me-2"></i>+66 73 123 456</p>
            <p class="small text-white-50"><i class="fas fa-envelope me-2"></i>info@schoolhub.com</p>
          </div>
        </div>
        <hr class="my-4 border-secondary">
        <p class="mb-0 small text-white-50">&copy; {{ new Date().getFullYear() }} ระบบบริหารจัดการโรงเรียน สงวนลิขสิทธิ์</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // Add class to body for specific page styling
  document.body.classList.add('storefront-body');
});
</script>

<style>
/* Scoped styles can go here, but we are using storefront.css globally for consistency */
</style>
