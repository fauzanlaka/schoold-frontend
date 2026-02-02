<template>
  <div class="dashboard-home">
    <!-- Page Header -->
    <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3">
      <div>
        <h1 class="page-title">แดชบอร์ด</h1>
        <p class="page-breadcrumb mb-0">
          <router-link to="/dashboard">หน้าแรก</router-link> / ภาพรวม
        </p>
      </div>
      <div v-if="loading" class="spinner-border text-primary spinner-border-sm" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div v-else class="text-muted small">
        <i class="fas fa-clock me-1"></i> เข้าสู่ระบบล่าสุด: <span class="fw-medium text-dark">{{ stats.user_stats?.last_login_formatted || '-' }}</span>
        <span class="ms-1 text-muted">({{ stats.user_stats?.last_login }})</span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else>
      <!-- Summary Cards -->
      <div class="row g-4 mb-4">
        <!-- Users Card -->
        <div class="col-sm-6 col-xl-3">
          <div class="db-card stat-card">
            <div class="stat-icon primary">
              <i class="fas fa-users"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.users?.total || 0 }}</div>
              <div class="stat-label">ผู้ใช้งานทั้งหมด</div>
              <div class="stat-change positive" v-if="stats.users?.new_this_month > 0">
                <i class="fas fa-arrow-up"></i>
                <span>{{ stats.users.new_this_month }} คนใหม่เดือนนี้</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Roles Card -->
        <div class="col-sm-6 col-xl-3">
          <div class="db-card stat-card">
            <div class="stat-icon info">
              <i class="fas fa-user-tag"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.users?.roles_count || 0 }}</div>
              <div class="stat-label">บทบาทในระบบ</div>
              <div class="stat-change">
                <span class="text-muted">กำหนดสิทธิ์การใช้งาน</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Assets Count Card -->
        <div class="col-sm-6 col-xl-3">
          <div class="db-card stat-card">
            <div class="stat-icon success">
              <i class="fas fa-boxes"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stats.assets?.total || 0 }}</div>
              <div class="stat-label">ครุภัณฑ์ทั้งหมด</div>
              <div class="stat-change" :class="stats.assets?.in_repair > 0 ? 'text-warning' : 'text-muted'">
                <i class="fas fa-tools" v-if="stats.assets?.in_repair > 0"></i>
                <span>{{ stats.assets?.in_repair || 0 }} รายการซ่อม</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Total Value Card -->
        <div class="col-sm-6 col-xl-3">
          <div class="db-card stat-card">
            <div class="stat-icon warning">
              <i class="fas fa-coins"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ formatCurrency(stats.assets?.total_value) }}</div>
              <div class="stat-label">มูลค่ารวมครุภัณฑ์</div>
              <div class="stat-change positive">
                <span>บาท</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Row -->
      <div class="row g-4">
        <!-- Asset Status Chart -->
        <div class="col-lg-4">
          <div class="db-card h-100">
            <div class="db-card-header">
              <h5 class="db-card-title">
                <i class="fas fa-chart-pie me-2 text-primary"></i>
                สถานะครุภัณฑ์
              </h5>
            </div>
            <div class="db-card-body">
              <div class="status-list">
                <div v-for="(count, status) in stats.assets?.distribution" :key="status" class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span class="text-muted text-capitalize">{{ getStatusLabel(status) }}</span>
                    <span class="fw-medium">{{ count }}</span>
                  </div>
                  <div class="progress" style="height: 8px;">
                    <div 
                      class="progress-bar" 
                      role="progressbar" 
                      :style="{ width: getPercentage(count, stats.assets?.total) + '%', backgroundColor: getStatusColor(status) }"
                    ></div>
                  </div>
                </div>
                <div v-if="!stats.assets?.total" class="text-center text-muted py-4">
                  ไม่มีข้อมูลครุภัณฑ์
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Assets -->
        <div class="col-lg-8">
          <div class="db-card h-100">
            <div class="db-card-header">
              <h5 class="db-card-title">
                <i class="fas fa-box-open me-2 text-success"></i>
                ครุภัณฑ์ล่าสุด
              </h5>
              <router-link to="/dashboard/equipment/assets" class="db-btn db-btn-outline db-btn-sm">ดูทั้งหมด</router-link>
            </div>
            <div class="db-card-body p-0">
              <div class="table-responsive">
                <table class="db-table">
                  <thead>
                    <tr>
                      <th>รหัสครุภัณฑ์</th>
                      <th>ชื่อรายการ</th>
                      <th>หมวดหมู่</th>
                      <th>วันที่เพิ่ม</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="asset in stats.recent_assets" :key="asset.id">
                      <td><span class="font-monospace text-primary">{{ asset.asset_code }}</span></td>
                      <td>
                        <div class="fw-medium">{{ asset.name }}</div>
                      </td>
                      <td>{{ asset.category }}</td>
                      <td>{{ asset.date }}</td>
                      <td>
                        <span class="badge" :class="getBadgeClass(asset.status)">{{ asset.status }}</span>
                      </td>
                    </tr>
                    <tr v-if="!stats.recent_assets?.length">
                      <td colspan="5" class="text-center py-4 text-muted">ไม่พบข้อมูล</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '@/services/api';

// State
const loading = ref(true);
const stats = ref({});

// Methods
const fetchStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    if (response.data.success) {
      stats.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
  } finally {
    loading.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('th-TH').format(value || 0);
};

const getPercentage = (count, total) => {
  if (!total) return 0;
  return Math.round((count / total) * 100);
};

const getStatusLabel = (statusKey) => {
  const map = {
    'active': 'ใช้งานอยู่',
    'inactive': 'ไม่ได้ใช้งาน',
    'disposed': 'จำหน่ายออก',
    'repairing': 'ส่งซ่อม',
    'unknown': 'ไม่ระบุ'
  };
  return map[statusKey] || statusKey;
};

const getStatusColor = (statusKey) => {
  const map = {
    'active': '#10b981', // green-500
    'inactive': '#6b7280', // gray-500
    'disposed': '#ef4444', // red-500
    'repairing': '#f59e0b', // amber-500
    'unknown': '#9ca3af' // gray-400
  };
  return map[statusKey] || '#cbd5e1';
};

const getBadgeClass = (statusLabel) => {
  if (statusLabel === 'ใช้งานอยู่') return 'bg-success';
  if (statusLabel === 'ส่งซ่อม') return 'bg-warning text-dark';
  if (statusLabel === 'จำหน่าย') return 'bg-danger';
  return 'bg-secondary';
};

// Lifecycle
onMounted(() => {
  fetchStats();
});
</script>

<style scoped>
.font-monospace {
  font-family: 'Courier New', Courier, monospace;
}
</style>
