<template>
  <div class="asset-detail">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-1">
          <li class="breadcrumb-item">
            <router-link to="/dashboard/equipment/registry">ทะเบียนครุภัณฑ์</router-link>
          </li>
          <li class="breadcrumb-item active">รายละเอียด</li>
        </ol>
      </nav>
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title mb-0">{{ asset?.asset_name || 'รายละเอียดครุภัณฑ์' }}</h1>
          <p class="text-muted mb-0">รหัสครุภัณฑ์: {{ asset?.asset_code }}</p>
        </div>
        <div v-if="asset" class="d-flex gap-2">
          <router-link to="/dashboard/equipment/registry" class="btn btn-secondary">
            กลับ
          </router-link>
          <button @click="exportPdf" class="btn btn-info text-white" :disabled="exporting">
            <span v-if="exporting" class="spinner-border spinner-border-sm me-2"></span>
            <i v-else class="fas fa-file-pdf me-2"></i>พิมพ์ PDF
          </button>
          <router-link :to="`/dashboard/equipment/registry/${asset.encrypted_id}/edit`" class="btn btn-primary">
            <i class="fas fa-edit me-2"></i>แก้ไข
          </router-link>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <template v-else-if="asset">
      <!-- ข้อมูลทั่วไป Card -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-info-circle me-2"></i>ข้อมูลทั่วไป
        </div>
        <div class="card-body">
          <div class="row g-4">
            <div class="col-md-4">
              <label class="text-muted small d-block">ประเภท:</label>
              <span class="fw-semibold">{{ asset.category?.category_name || '-' }}</span>
            </div>
            <div class="col-md-4">
              <label class="text-muted small d-block">วันที่ได้มา:</label>
              <span class="fw-semibold">{{ formatDate(asset.acquisition_date) }}</span>
            </div>
            <div class="col-md-4">
              <label class="text-muted small d-block">ราคาต่อหน่วย:</label>
              <span class="fw-semibold">฿{{ formatNumber(asset.unit_price) }}</span>
            </div>
            <div class="col-md-4">
              <label class="text-muted small d-block">จำนวน:</label>
              <span class="fw-semibold">{{ asset.quantity }} หน่วย</span>
            </div>
            <div class="col-md-4">
              <label class="text-muted small d-block">อายุการใช้งาน:</label>
              <span class="fw-semibold">{{ effectiveUsefulLife }} ปี</span>
            </div>
            <div class="col-md-4">
              <label class="text-muted small d-block">อัตราค่าเสื่อม:</label>
              <span class="fw-semibold">{{ effectiveDepreciationRate }}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- การคำนวณค่าเสื่อมราคา -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-calculator me-2"></i>การคำนวณค่าเสื่อมราคา
        </div>
        <div class="card-body p-0">
          <div v-if="!canCalculateDepreciation" class="p-4 text-center text-danger">
            <i class="fas fa-exclamation-triangle me-2"></i>
            ไม่สามารถคำนวณได้เนื่องจากข้อมูลไม่ครบถ้วน
          </div>
          <div v-else class="table-responsive">
            <table class="table table-bordered table-sm mb-0 depreciation-table">
              <thead class="table-light">
                <tr>
                  <th class="text-center" style="width: 100px;">วัน เดือน ปี</th>
                  <th class="text-center" style="width: 80px;">ที่เอกสาร</th>
                  <th>รายการ</th>
                  <th class="text-center" style="width: 80px;">จำนวนหน่วย</th>
                  <th class="text-end" style="width: 120px;">ราคาต่อหน่วย/<br/>ชุด/กลุ่ม</th>
                  <th class="text-end" style="width: 110px;">มูลค่ารวม</th>
                  <th class="text-center" style="width: 80px;">อายุใช้งาน</th>
                  <th class="text-center" style="width: 70px;">อัตราค่า<br/>เสื่อมราคา</th>
                  <th class="text-end" style="width: 110px;">ค่าเสื่อมราคา<br/>ประจำปี</th>
                  <th class="text-end" style="width: 110px;">ค่าเสื่อมราคา<br/>สะสม</th>
                  <th class="text-end" style="width: 100px;">มูลค่าสุทธิ</th>
                </tr>
              </thead>
              <tbody>
                <!-- First Row: Initial Asset Entry -->
                <tr>
                  <td class="text-center">{{ formatDateShort(asset.acquisition_date) }}</td>
                  <td class="text-center">{{ asset.document_number || '-' }}</td>
                  <td>{{ asset.asset_name }}</td>
                  <td class="text-center">{{ asset.quantity }}</td>
                  <td class="text-end">{{ formatNumber(asset.unit_price) }}</td>
                  <td class="text-end">{{ formatNumber(asset.total_price) }}</td>
                  <td class="text-center">{{ effectiveUsefulLife }}</td>
                  <td class="text-center">{{ effectiveDepreciationRate }}%</td>
                  <td class="text-end">{{ formatNumber(annualDepreciation) }}</td>
                  <td class="text-end">-</td>
                  <td class="text-end">{{ formatNumber(asset.total_price) }}</td>
                </tr>
                <!-- Depreciation Rows -->
                <tr v-for="(row, index) in depreciationRows" :key="index">
                  <td class="text-center">{{ row.date }}</td>
                  <td class="text-center">-</td>
                  <td>{{ row.description }}</td>
                  <td class="text-center"></td>
                  <td class="text-end"></td>
                  <td class="text-end"></td>
                  <td class="text-center"></td>
                  <td class="text-center"></td>
                  <td class="text-end">{{ formatNumber(row.depreciation) }}</td>
                  <td class="text-end">{{ formatNumber(row.accumulated) }}</td>
                  <td class="text-end">{{ formatNumber(row.netValue) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Additional Info Row -->
      <div class="row">
        <!-- Supplier Info -->
        <div class="col-md-6" v-if="asset.supplier_name || asset.supplier_phone">
          <div class="card mb-4">
            <div class="card-header">
              <i class="fas fa-store me-2"></i>ข้อมูลผู้ขาย/ผู้บริจาค
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <label class="text-muted small">ชื่อ</label>
                  <div>{{ asset.supplier_name || '-' }}</div>
                </div>
                <div class="col-md-6">
                  <label class="text-muted small">เบอร์โทรศัพท์</label>
                  <div>{{ asset.supplier_phone || '-' }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Info -->
        <div class="col-md-6">
          <div class="card mb-4">
            <div class="card-header">
              <i class="fas fa-history me-2"></i>ข้อมูลระบบ
            </div>
            <div class="card-body small">
              <div class="mb-2">
                <span class="text-muted">สร้างโดย:</span> {{ asset.creator?.name || '-' }}
              </div>
              <div class="mb-2">
                <span class="text-muted">วันที่สร้าง:</span> {{ formatDateTime(asset.created_date) }}
              </div>
              <div class="mb-2">
                <span class="text-muted">แก้ไขล่าสุดโดย:</span> {{ asset.updater?.name || '-' }}
              </div>
              <div>
                <span class="text-muted">วันที่แก้ไข:</span> {{ formatDateTime(asset.updated_date) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="card mb-4" v-if="asset.notes">
        <div class="card-header">
          <i class="fas fa-sticky-note me-2"></i>หมายเหตุ
        </div>
        <div class="card-body">
          <p class="mb-0">{{ asset.notes }}</p>
        </div>
      </div>
    </template>

    <div v-else class="alert alert-warning">
      ไม่พบข้อมูลครุภัณฑ์
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const asset = ref(null);
const exporting = ref(false);

// Depreciation data from backend
const depreciationData = ref(null);

// Export PDF function
const exportPdf = async () => {
  if (!asset.value) return;
  
  exporting.value = true;
  try {
    // Open PDF in new tab - the browser will handle the session cookie
    // const baseUrl = 'http://localhost/school-management-system/backend/public/api';
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const pdfUrl = `${baseUrl}/assets/${asset.value.encrypted_id}/export-pdf`;
    window.open(pdfUrl, '_blank');
  } catch (error) {
    console.error('Error exporting PDF:', error);
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถ Export PDF ได้', 'error');
  } finally {
    exporting.value = false;
  }
};

// Effective values (from depreciation data from backend)
const effectiveUsefulLife = computed(() => {
  return depreciationData.value?.useful_life || 0;
});

const effectiveDepreciationRate = computed(() => {
  return depreciationData.value?.depreciation_rate || 0;
});

// Check if we can calculate depreciation (from backend)
const canCalculateDepreciation = computed(() => {
  return depreciationData.value?.can_calculate || false;
});

// Annual depreciation (from backend)
const annualDepreciation = computed(() => {
  return depreciationData.value?.annual_depreciation || 0;
});

// Depreciation rows (from backend)
const depreciationRows = computed(() => {
  return depreciationData.value?.rows || [];
});

const formatNumber = (num) => {
  if (num === null || num === undefined) return '-';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatDateShort = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = (d.getFullYear() + 543).toString().slice(-2);
  return `${day}/${month}/${year}`;
};

const formatDateTime = (dt) => {
  if (!dt) return '-';
  return new Date(dt).toLocaleString('th-TH');
};

const getStatusLabel = (status) => {
  const labels = { 1: 'ใช้งานอยู่', 2: 'ไม่ได้ใช้งาน', 3: 'จำหน่าย', 4: 'กำลังซ่อมแซม', 5: 'ไม่ทราบสถานะ' };
  return labels[status] || 'ไม่ระบุ';
};

const getStatusBadgeClass = (status) => {
  const classes = { 1: 'bg-success', 2: 'bg-secondary', 3: 'bg-dark', 4: 'bg-warning text-dark', 5: 'bg-danger' };
  return classes[status] || 'bg-light text-dark';
};

// Load asset and depreciation data from backend
const loadAsset = async () => {
  loading.value = true;
  try {
    // Load asset data
    const assetResponse = await api.get(`/assets/${route.params.id}`);
    if (assetResponse.data.success) {
      asset.value = assetResponse.data.data;
      
      // Load depreciation data from backend
      const depResponse = await api.get(`/assets/${route.params.id}/depreciation`);
      if (depResponse.data.success) {
        depreciationData.value = depResponse.data.data;
      }
    }
  } catch (error) {
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
    router.push('/dashboard/equipment/registry');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadAsset();
});
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.card-header {
  font-weight: 600;
  background: var(--bs-light);
}

.depreciation-table th {
  font-size: 0.75rem;
  font-weight: 600;
  vertical-align: middle;
  background: #f1f5f9;
  color: #475569;
}

.depreciation-table td {
  font-size: 0.85rem;
  vertical-align: middle;
}

.depreciation-table th,
.depreciation-table td {
  padding: 0.5rem;
  border-color: #e2e8f0;
}
</style>
