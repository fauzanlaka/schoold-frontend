<template>
  <div class="asset-list">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="page-title">
            <i class="fas fa-tools me-2"></i>
            ทะเบียนครุภัณฑ์
          </h1>
          <p class="text-muted mb-0">บริหารจัดการครุภัณฑ์ทั้งหมดของโรงเรียน</p>
        </div>
        <div class="col-auto" v-if="authStore.hasPermission('assets.create')">
          <div class="btn-group">
            <button type="button" class="btn btn-outline-success" @click="downloadTemplate">
              <i class="fas fa-download me-2"></i>
              ดาวน์โหลด Template
            </button>
            <button type="button" class="btn btn-success" @click="showImportModal = true">
              <i class="fas fa-file-excel me-2"></i>
              นำเข้า Excel
            </button>
          </div>
          <router-link to="/dashboard/equipment/registry/create" class="btn btn-primary ms-2">
            <i class="fas fa-plus me-2"></i>
            เพิ่มครุภัณฑ์
          </router-link>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-3 mb-4" v-if="summary">
      <div class="col-md-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-boxes fa-2x opacity-75"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="small">ครุภัณฑ์ทั้งหมด</div>
                <div class="h4 mb-0">{{ summary.total_assets }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-check-circle fa-2x opacity-75"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="small">ใช้งานอยู่</div>
                <div class="h4 mb-0">{{ summary.status_counts?.[1] || 0 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-warning text-dark">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-wrench fa-2x opacity-75"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="small">กำลังซ่อมแซม</div>
                <div class="h4 mb-0">{{ summary.status_counts?.[4] || 0 }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <i class="fas fa-baht-sign fa-2x opacity-75"></i>
              </div>
              <div class="flex-grow-1 ms-3">
                <div class="small">มูลค่ารวม (บาท)</div>
                <div class="h5 mb-0">{{ formatNumber(summary.total_value) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-4">
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="ค้นหาชื่อ, รหัส..."
                v-model="search"
                @input="debounceSearch"
              />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filters.category_id" @change="loadAssets">
              <option value="">ทุกประเภท</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.category_name }}
              </option>
            </select>
          </div>
          <div class="col-md-2">
            <select class="form-select" v-model="filters.status" @change="loadAssets">
              <option value="">ทุกสถานะ</option>
              <option value="1">ใช้งานอยู่</option>
              <option value="2">ไม่ได้ใช้งาน</option>
              <option value="3">จำหน่าย</option>
              <option value="4">กำลังซ่อมแซม</option>
              <option value="5">ไม่ทราบสถานะ</option>
            </select>
          </div>
          <div class="col-md-3 text-end">
            <span class="text-muted">พบ {{ pagination.total || 0 }} รายการ</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Data Table -->
    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>รหัส</th>
                <th>ชื่อครุภัณฑ์</th>
                <th>ประเภท</th>
                <th class="text-end">ราคารวม</th>
                <th class="text-end">มูลค่าคงเหลือ</th>
                <th class="text-center">สถานะ</th>
                <th class="text-center" style="width: 150px">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-4">
                  <div class="spinner-border text-primary"></div>
                </td>
              </tr>
              <tr v-else-if="assets.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                  ไม่พบข้อมูลครุภัณฑ์
                </td>
              </tr>
              <tr v-for="asset in assets" :key="asset.id">
                <td>
                  <code>{{ asset.asset_code }}</code>
                </td>
                <td>
                  <strong>{{ asset.asset_name }}</strong>
                  <br/>
                  <small class="text-muted">
                    วันที่ได้มา: {{ formatDate(asset.acquisition_date) }}
                  </small>
                </td>
                <td>
                  <span class="badge bg-light text-dark">
                    {{ asset.category?.category_name }}
                  </span>
                </td>
                <td class="text-end">{{ formatNumber(asset.total_price) }}</td>
                <td class="text-end">
                  <span :class="asset.book_value < asset.total_price * 0.2 ? 'text-danger' : 'text-success'">
                    {{ formatNumber(asset.book_value) }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge" :class="getStatusBadgeClass(asset.status)">
                    {{ getStatusLabel(asset.status) }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <router-link 
                      :to="`/dashboard/equipment/registry/${asset.encrypted_id}`"
                      class="btn btn-outline-info"
                      title="ดูรายละเอียด"
                    >
                      <i class="fas fa-eye"></i>
                    </router-link>
                    <router-link 
                      :to="`/dashboard/equipment/registry/${asset.encrypted_id}/edit`"
                      class="btn btn-outline-primary"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit"></i>
                    </router-link>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer" v-if="pagination.last_page > 1">
        <nav>
          <ul class="pagination pagination-sm mb-0 justify-content-center">
            <li class="page-item" :class="{ disabled: pagination.current_page === 1 }">
              <a class="page-link" href="#" @click.prevent="goToPage(pagination.current_page - 1)">
                <i class="fas fa-chevron-left"></i>
              </a>
            </li>
            <li 
              class="page-item" 
              v-for="page in visiblePages" 
              :key="page"
              :class="{ active: page === pagination.current_page }"
            >
              <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: pagination.current_page === pagination.last_page }">
              <a class="page-link" href="#" @click.prevent="goToPage(pagination.current_page + 1)">
                <i class="fas fa-chevron-right"></i>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Import Modal -->
    <div class="modal fade" :class="{ show: showImportModal }" :style="{ display: showImportModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-file-excel me-2 text-success"></i>
              นำเข้าข้อมูลครุภัณฑ์
            </h5>
            <button type="button" class="btn-close" @click="closeImportModal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-3">
              <i class="fas fa-info-circle me-2"></i>
              กรุณาดาวน์โหลด Template ก่อนเพื่อดูรูปแบบข้อมูลและรายการประเภทครุภัณฑ์
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold">เลือกไฟล์ Excel</label>
              <input 
                type="file" 
                class="form-control" 
                accept=".xlsx,.xls"
                ref="importFileInput"
                @change="handleFileSelect"
              />
              <small class="text-muted">รองรับไฟล์ .xlsx, .xls (สูงสุด 5MB)</small>
            </div>
            
            <!-- Import Results -->
            <div v-if="importResult" class="mt-3">
              <div class="alert" :class="importResult.success ? 'alert-success' : 'alert-warning'">
                <div class="d-flex align-items-center">
                  <i :class="importResult.success ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'" class="me-2 fa-lg"></i>
                  <div>
                    <strong>{{ importResult.message }}</strong>
                    <div class="small mt-1">
                      นำเข้าสำเร็จ: {{ importResult.imported }} รายการ | 
                      ข้าม: {{ importResult.skipped }} รายการ
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Error Details -->
              <div v-if="importResult.errors && importResult.errors.length > 0" class="mt-2">
                <strong class="text-danger">รายละเอียดข้อผิดพลาด:</strong>
                <div class="border rounded p-2 mt-1" style="max-height: 200px; overflow-y: auto;">
                  <div v-for="err in importResult.errors" :key="err.row" class="small text-danger">
                    <strong>แถว {{ err.row }}:</strong> {{ err.errors.join(', ') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeImportModal">
              ปิด
            </button>
            <button 
              type="button" 
              class="btn btn-success" 
              @click="uploadImport"
              :disabled="!selectedFile || importing"
            >
              <span v-if="importing">
                <span class="spinner-border spinner-border-sm me-2"></span>
                กำลังนำเข้า...
              </span>
              <span v-else>
                <i class="fas fa-upload me-2"></i>
                นำเข้าข้อมูล
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showImportModal" @click="closeImportModal"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);
const assets = ref([]);
const categories = ref([]);
const summary = ref(null);
const search = ref('');
const filters = reactive({
  category_id: '',
  status: ''
});
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0
});

// Import state
const showImportModal = ref(false);
const selectedFile = ref(null);
const importing = ref(false);
const importResult = ref(null);
const importFileInput = ref(null);

let searchTimeout = null;

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, pagination.current_page - 2);
  const end = Math.min(pagination.last_page, pagination.current_page + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const formatNumber = (num) => {
  return new Intl.NumberFormat('th-TH').format(num || 0);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getStatusLabel = (status) => {
  const labels = {
    1: 'ใช้งานอยู่',
    2: 'ไม่ได้ใช้งาน',
    3: 'จำหน่าย',
    4: 'กำลังซ่อมแซม',
    5: 'ไม่ทราบสถานะ'
  };
  return labels[status] || 'ไม่ระบุ';
};

const getStatusBadgeClass = (status) => {
  const classes = {
    1: 'bg-success',
    2: 'bg-secondary',
    3: 'bg-dark',
    4: 'bg-warning text-dark',
    5: 'bg-danger'
  };
  return classes[status] || 'bg-light text-dark';
};

const loadCategories = async () => {
  try {
    const response = await api.get('/asset-categories/list-active');
    if (response.data.success) {
      categories.value = response.data.data;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

const loadSummary = async () => {
  try {
    const response = await api.get('/assets/summary');
    if (response.data.success) {
      summary.value = response.data.data;
    }
  } catch (error) {
    console.error('Error loading summary:', error);
  }
};

const loadAssets = async (page = 1) => {
  loading.value = true;
  try {
    const params = {
      page,
      per_page: 15,
      search: search.value || undefined,
      category_id: filters.category_id || undefined,
      status: filters.status || undefined
    };

    const response = await api.get('/assets', { params });
    
    if (response.data.success) {
      assets.value = response.data.data.data;
      pagination.current_page = response.data.data.current_page;
      pagination.last_page = response.data.data.last_page;
      pagination.total = response.data.data.total;
    }
  } catch (error) {
    console.error('Error loading assets:', error);
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadAssets(1), 300);
};

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    loadAssets(page);
  }
};

// Import functions
const downloadTemplate = async () => {
  try {
    const response = await api.get('/assets/download-import-template', {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'asset-import-template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถดาวน์โหลด Template ได้', 'error');
  }
};

const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0] || null;
  importResult.value = null;
};

const closeImportModal = () => {
  showImportModal.value = false;
  selectedFile.value = null;
  importResult.value = null;
  if (importFileInput.value) {
    importFileInput.value.value = '';
  }
};

const uploadImport = async () => {
  if (!selectedFile.value) return;

  importing.value = true;
  importResult.value = null;

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);

    const response = await api.post('/assets/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    importResult.value = response.data;

    if (response.data.imported > 0) {
      loadAssets(1);
      loadSummary();
    }
  } catch (error) {
    importResult.value = {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้า',
      imported: 0,
      skipped: 0
    };
  } finally {
    importing.value = false;
  }
};

onMounted(() => {
  loadCategories();
  loadSummary();
  loadAssets();
});
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}
</style>
