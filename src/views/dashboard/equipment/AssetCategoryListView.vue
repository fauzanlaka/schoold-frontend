<template>
  <div class="asset-category-list">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="page-title">
            <i class="fas fa-tags me-2"></i>
            ประเภทครุภัณฑ์
          </h1>
          <p class="text-muted mb-0">จัดการประเภทครุภัณฑ์ของโรงเรียน</p>
        </div>
        <div class="col-auto d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary" @click="downloadTemplate">
            <i class="fas fa-download me-2"></i>
            ดาวน์โหลด Template
          </button>
          <button type="button" class="btn btn-success" @click="showImportModal = true">
            <i class="fas fa-file-excel me-2"></i>
            Import
          </button>
          <router-link to="/dashboard/equipment/categories/create" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i>
            เพิ่มประเภทใหม่
          </router-link>
        </div>
      </div>
    </div>

    <!-- Search & Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="ค้นหาชื่อหรือรหัสประเภท..."
                v-model="search"
                @input="debounceSearch"
              />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filters.is_active" @change="loadCategories">
              <option value="">ทั้งหมด</option>
              <option value="1">ใช้งานอยู่</option>
              <option value="0">ไม่ได้ใช้งาน</option>
            </select>
          </div>
          <div class="col-md-3 text-end">
            <span class="text-muted">
              พบ {{ pagination.total || 0 }} รายการ
            </span>
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
                <th style="width: 100px">รหัส</th>
                <th>ชื่อประเภท</th>
                <th class="text-center" style="width: 120px">อายุใช้งาน (ปี)</th>
                <th class="text-center" style="width: 140px">อัตราค่าเสื่อม (%)</th>
                <th class="text-center" style="width: 100px">สถานะ</th>
                <th class="text-center" style="width: 120px">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="text-center py-4">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">กำลังโหลด...</span>
                  </div>
                </td>
              </tr>
              <tr v-else-if="categories.length === 0">
                <td colspan="6" class="text-center py-4 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3 d-block"></i>
                  ไม่พบข้อมูลประเภทครุภัณฑ์
                </td>
              </tr>
              <tr v-for="cat in categories" :key="cat.id">
                <td>
                  <code v-if="cat.category_code">{{ cat.category_code }}</code>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <strong>{{ cat.category_name }}</strong>
                  <p v-if="cat.description" class="text-muted small mb-0 text-truncate" style="max-width: 300px;">
                    {{ cat.description }}
                  </p>
                </td>
                <td class="text-center">{{ cat.useful_life_years }}</td>
                <td class="text-center">{{ cat.depreciation_rate }}%</td>
                <td class="text-center">
                  <span class="badge" :class="cat.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ cat.is_active ? 'ใช้งาน' : 'ไม่ใช้งาน' }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <router-link 
                      :to="`/dashboard/equipment/categories/${cat.id}/edit`"
                      class="btn btn-outline-primary"
                      title="แก้ไข"
                    >
                      <i class="fas fa-edit"></i>
                    </router-link>
                    <button 
                      type="button" 
                      class="btn btn-outline-danger"
                      title="ลบ"
                      @click="confirmDelete(cat)"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
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
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-file-excel me-2 text-success"></i>
              นำเข้าประเภทครุภัณฑ์จาก Excel
            </h5>
            <button type="button" class="btn-close" @click="closeImportModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="!importResult">
              <div class="mb-3">
                <label class="form-label">เลือกไฟล์ Excel</label>
                <input 
                  type="file" 
                  class="form-control" 
                  ref="fileInput"
                  accept=".xlsx,.xls,.csv"
                  @change="handleFileSelect"
                />
                <div class="form-text">รองรับไฟล์ .xlsx, .xls, .csv (ไม่เกิน 5MB)</div>
              </div>
              <div v-if="selectedFile" class="alert alert-info py-2">
                <i class="fas fa-file me-2"></i>
                {{ selectedFile.name }}
              </div>
            </div>

            <!-- Import Result -->
            <div v-else>
              <div class="alert" :class="importResult.success ? 'alert-success' : 'alert-warning'">
                <i :class="['fas', 'me-2', importResult.success ? 'fa-check-circle' : 'fa-exclamation-triangle']"></i>
                {{ importResult.message }}
              </div>
              <div v-if="importResult.imported !== undefined" class="mb-3">
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span>นำเข้าสำเร็จ:</span>
                  <span class="text-success fw-bold">{{ importResult.imported }} รายการ</span>
                </div>
                <div class="d-flex justify-content-between py-2 border-bottom">
                  <span>ข้ามไป:</span>
                  <span class="text-warning fw-bold">{{ importResult.skipped }} รายการ</span>
                </div>
              </div>
              <div v-if="importResult.errors && importResult.errors.length > 0" class="mt-3">
                <h6 class="text-danger"><i class="fas fa-times-circle me-2"></i>ข้อผิดพลาด:</h6>
                <div class="import-errors">
                  <div v-for="error in importResult.errors" :key="error.row" class="error-item">
                    <strong>แถวที่ {{ error.row }}:</strong>
                    <ul class="mb-0 ps-3">
                      <li v-for="(msg, idx) in error.errors" :key="idx">{{ msg }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeImportModal">
              {{ importResult ? 'ปิด' : 'ยกเลิก' }}
            </button>
            <button 
              v-if="!importResult"
              type="button" 
              class="btn btn-success" 
              :disabled="!selectedFile || importing"
              @click="importFile"
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
    <div v-if="showImportModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import Swal from 'sweetalert2';

const loading = ref(false);
const categories = ref([]);
const search = ref('');
const filters = reactive({
  is_active: ''
});
const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0
});

// Import states
const showImportModal = ref(false);
const selectedFile = ref(null);
const importing = ref(false);
const importResult = ref(null);
const fileInput = ref(null);

let searchTimeout = null;

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, pagination.current_page - 2);
  const end = Math.min(pagination.last_page, pagination.current_page + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const loadCategories = async (page = 1) => {
  loading.value = true;
  try {
    const params = {
      page,
      per_page: 15,
      search: search.value || undefined,
      is_active: filters.is_active || undefined
    };

    const response = await api.get('/asset-categories', { params });
    
    if (response.data.success) {
      categories.value = response.data.data.data;
      pagination.current_page = response.data.data.current_page;
      pagination.last_page = response.data.data.last_page;
      pagination.total = response.data.data.total;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadCategories(1);
  }, 300);
};

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    loadCategories(page);
  }
};

const confirmDelete = async (category) => {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ',
    html: `คุณต้องการลบประเภท <strong>${category.category_name}</strong> ใช่หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  });

  if (result.isConfirmed) {
    try {
      const response = await api.delete(`/asset-categories/${category.id}`);
      if (response.data.success) {
        Swal.fire('สำเร็จ', 'ลบประเภทครุภัณฑ์แล้ว', 'success');
        loadCategories(pagination.current_page);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'ไม่สามารถลบได้';
      Swal.fire('ข้อผิดพลาด', message, 'error');
    }
  }
};

// Import functions
const handleFileSelect = (event) => {
  selectedFile.value = event.target.files[0] || null;
};

const downloadTemplate = async () => {
  try {
    const response = await api.get('/asset-categories/download-template', {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'asset_category_template.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถดาวน์โหลด Template ได้', 'error');
  }
};

const importFile = async () => {
  if (!selectedFile.value) return;

  importing.value = true;
  const formData = new FormData();
  formData.append('file', selectedFile.value);

  try {
    const response = await api.post('/asset-categories/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    importResult.value = response.data;
    if (response.data.imported > 0) {
      loadCategories(1);
    }
  } catch (error) {
    importResult.value = {
      success: false,
      message: error.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล',
      errors: error.response?.data?.errors
    };
  } finally {
    importing.value = false;
  }
};

const closeImportModal = () => {
  showImportModal.value = false;
  selectedFile.value = null;
  importResult.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bs-dark);
  margin-bottom: 0;
}

.table th {
  font-weight: 600;
  white-space: nowrap;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}

.import-errors {
  max-height: 200px;
  overflow-y: auto;
  font-size: 0.875rem;
}

.import-errors .error-item {
  padding: 0.5rem;
  border-bottom: 1px solid #dee2e6;
}

.import-errors .error-item:last-child {
  border-bottom: none;
}
</style>
