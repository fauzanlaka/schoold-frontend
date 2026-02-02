<template>
  <div class="dashboard-wrapper" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar Overlay (Mobile) -->
    <div 
      class="sidebar-overlay" 
      :class="{ show: sidebarOpen }" 
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <aside class="dashboard-sidebar" :class="{ show: sidebarOpen }">
      <!-- Brand -->
      <div class="sidebar-brand">
        <div class="sidebar-brand-icon">
          <i class="fas fa-school"></i>
        </div>
        <span class="sidebar-brand-text">ศูนย์บริหาร</span>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <div class="sidebar-nav-title">เมนูหลัก</div>
        
        <div class="sidebar-nav-item">
          <router-link to="/dashboard" class="sidebar-nav-link" :class="{ active: isActive('/dashboard') }" @click="closeSidebar">
            <i class="fas fa-home"></i>
            <span>แดชบอร์ด</span>
          </router-link>
        </div>

        <!-- <div class="sidebar-nav-item" v-if="authStore.hasPermission('school.view')"> -->
        <div class="sidebar-nav-item">
          <router-link to="/dashboard/school/profile" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/school') }" @click="closeSidebar">
            <i class="fas fa-school"></i>
            <span>โรงเรียนของฉัน</span>
          </router-link>
        </div>

        <div class="sidebar-nav-title">พัสดุและครุภัณฑ์</div>

        <div class="sidebar-nav-item" v-if="authStore.hasPermission('asset-categories.view')">
          <router-link to="/dashboard/equipment/categories" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/equipment/categories') }" @click="closeSidebar">
            <i class="fas fa-tags"></i>
            <span>ประเภทครุภัณฑ์</span>
          </router-link>
        </div>

        <div class="sidebar-nav-item" v-if="authStore.hasPermission('assets.view')">
          <router-link to="/dashboard/equipment/registry" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/equipment/registry') }" @click="closeSidebar">
            <i class="fas fa-tools"></i>
            <span>ทะเบียนครุภัณฑ์</span>
          </router-link>
        </div>

        <div class="sidebar-nav-item" v-if="authStore.hasPermission('assets.report')">
          <router-link to="/dashboard/equipment/reports" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/equipment/reports') }" @click="closeSidebar">
            <i class="fas fa-chart-line"></i>
            <span>รายงาน</span>
          </router-link>
        </div>

        <div class="sidebar-nav-title">การจัดการผู้ใช้</div>

        <div class="sidebar-nav-item" v-if="authStore.hasPermission('users.view')">
          <router-link to="/dashboard/users" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/users') }" @click="closeSidebar">
            <i class="fas fa-users"></i>
            <span>ผู้ใช้งาน</span>
          </router-link>
        </div>

        <div class="sidebar-nav-item" v-if="authStore.hasPermission('roles.view')">
          <router-link to="/dashboard/roles" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/roles') }" @click="closeSidebar">
            <i class="fas fa-user-shield"></i>
            <span>สิทธิ์และบทบาท</span>
          </router-link>
        </div>

        

        <!-- <div class="sidebar-nav-item">
          <router-link to="/dashboard/students" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/students') }" @click="closeSidebar">
            <i class="fas fa-user-graduate"></i>
            <span>นักเรียน</span>
            <span class="nav-badge bg-primary text-white">150</span>
          </router-link>
        </div> -->

        <!-- <div class="sidebar-nav-item">
          <router-link to="/dashboard/staff" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/staff') }" @click="closeSidebar">
            <i class="fas fa-users"></i>
            <span>บุคลากร</span>
          </router-link>
        </div> -->

        <!-- <div class="sidebar-nav-title">วิชาการ</div>

        <div class="sidebar-nav-item">
          <router-link to="/dashboard/academic" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/academic') }" @click="closeSidebar">
            <i class="fas fa-book"></i>
            <span>หลักสูตร</span>
          </router-link>
        </div>

        <div class="sidebar-nav-item">
          <router-link to="/dashboard/classes" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/classes') }" @click="closeSidebar">
            <i class="fas fa-chalkboard"></i>
            <span>ห้องเรียน</span>
          </router-link>
        </div>

        <div class="sidebar-nav-title">บริหาร</div>

        <div class="sidebar-nav-item">
          <router-link to="/dashboard/resources" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/resources') }" @click="closeSidebar">
            <i class="fas fa-boxes"></i>
            <span>ทรัพยากร</span>
          </router-link>
        </div>

        <div class="sidebar-nav-item">
          <router-link to="/dashboard/finance" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/finance') }" @click="closeSidebar">
            <i class="fas fa-wallet"></i>
            <span>การเงิน</span>
          </router-link>
        </div>

        <div class="sidebar-nav-item">
          <router-link to="/dashboard/reports" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/reports') }" @click="closeSidebar">
            <i class="fas fa-chart-bar"></i>
            <span>รายงาน</span>
          </router-link>
        </div> -->

        <!-- <div class="sidebar-nav-title">ระบบ</div>

        <div class="sidebar-nav-item">
          <router-link to="/dashboard/settings" class="sidebar-nav-link" :class="{ active: isActive('/dashboard/settings') }" @click="closeSidebar">
            <i class="fas fa-cog"></i>
            <span>ตั้งค่า</span>
          </router-link>
        </div> -->
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="dashboard-main">
      <!-- Topbar -->
      <header class="dashboard-topbar">
        <div class="topbar-left">
          <!-- Toggle Button -->
          <button class="topbar-toggle d-md-none" @click="toggleSidebar">
            <i class="fas fa-bars"></i>
          </button>
          <button class="topbar-toggle d-none d-md-flex" @click="toggleCollapse">
            <i class="fas fa-bars"></i>
          </button>

          <!-- Search -->
          <div class="topbar-search">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="ค้นหา..." />
          </div>
        </div>

        <div class="topbar-right">
          <!-- Notifications -->
          <button class="topbar-icon-btn">
            <i class="fas fa-bell"></i>
            <span class="badge">3</span>
          </button>

          <!-- Messages -->
          <button class="topbar-icon-btn">
            <i class="fas fa-envelope"></i>
            <span class="badge">5</span>
          </button>

          <!-- User Dropdown -->
          <div class="topbar-user dropdown">
            <div class="d-flex align-items-center" data-bs-toggle="dropdown">
              <div class="topbar-user-avatar">
                <span>{{ userInitials }}</span>
              </div>
              <div class="topbar-user-info">
                <div class="topbar-user-name">{{ authStore.userName || 'ผู้ใช้งาน' }}</div>
                <div class="topbar-user-role">{{ authStore.userEmail || 'ผู้ดูแลระบบ' }}</div>
              </div>
              <i class="fas fa-chevron-down ms-2 text-muted small"></i>
            </div>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>โปรไฟล์</a></li>
              <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>ตั้งค่า</a></li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                  <i class="fas fa-sign-out-alt me-2"></i>
                  <span v-if="loggingOut">กำลังออก...</span>
                  <span v-else>ออกจากระบบ</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="dashboard-content">
        <router-view></router-view>
      </main>

      <!-- Footer -->
      <footer class="dashboard-footer">
        &copy; {{ new Date().getFullYear() }} ระบบบริหารจัดการโรงเรียน - พัฒนาด้วย ❤️
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const sidebarOpen = ref(false);
const sidebarCollapsed = ref(false);
const loggingOut = ref(false);

// Compute user initials from name
const userInitials = computed(() => {
  const name = authStore.userName || 'ผู้ใช้';
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return parts[0].charAt(0) + parts[1].charAt(0);
  }
  return name.substring(0, 2);
});

const isActive = (path) => {
  if (path === '/dashboard') {
    return route.path === '/dashboard' || route.path === '/dashboard/';
  }
  return route.path.startsWith(path);
};

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = () => {
  sidebarOpen.value = false;
};

const toggleCollapse = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

// Logout handler with confirmation
const handleLogout = async () => {
  const result = await Swal.fire({
    title: 'ยืนยันการออกจากระบบ',
    text: 'คุณต้องการออกจากระบบใช่หรือไม่?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ออกจากระบบ',
    cancelButtonText: 'ยกเลิก'
  });

  if (result.isConfirmed) {
    loggingOut.value = true;
    
    try {
      await authStore.logout();
      
      await Swal.fire({
        title: 'ออกจากระบบสำเร็จ',
        text: 'กำลังไปยังหน้าแรก...',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if API fails
      router.push('/');
    } finally {
      loggingOut.value = false;
    }
  }
};

// Close sidebar on window resize
const handleResize = () => {
  if (window.innerWidth > 768) {
    sidebarOpen.value = false;
  }
};

onMounted(() => {
  document.body.classList.add('dashboard-body');
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  document.body.classList.remove('dashboard-body');
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Additional scoped styles if needed */
</style>
