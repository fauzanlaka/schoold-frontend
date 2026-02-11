<template>
  <div class="asset-form">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-1">
          <li class="breadcrumb-item">
            <router-link to="/dashboard/equipment/registry">ทะเบียนครุภัณฑ์</router-link>
          </li>
          <li class="breadcrumb-item active">{{ isEditMode ? 'แก้ไข' : 'เพิ่มใหม่' }}</li>
        </ol>
      </nav>
      <div class="d-flex justify-content-between align-items-center">
        <h1 class="page-title mb-0">
          <i class="fas fa-tools me-2"></i>
          {{ isEditMode ? 'แก้ไขครุภัณฑ์' : 'เพิ่มครุภัณฑ์ใหม่' }}
        </h1>
        <router-link v-if="isEditMode" :to="`/dashboard/equipment/registry/${route.params.id}`" class="btn btn-info text-white">
          <i class="fas fa-eye me-2"></i>ดูรายละเอียด
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <!-- Form -->
    <form v-else @submit.prevent="handleSubmit">
      <!-- ข้อมูลหลัก -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-info-circle me-2"></i>ข้อมูลหลัก
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">ชื่อครุภัณฑ์ <span class="text-danger">*</span></label>
              <input type="text" class="form-control" :class="{'is-invalid': errors.asset_name}"
                v-model="form.asset_name" placeholder="เช่น คอมพิวเตอร์ Notebook Dell" />
              <div class="invalid-feedback" v-if="errors.asset_name">{{ errors.asset_name[0] }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label">รหัสครุภัณฑ์ <span class="text-danger">*</span></label>
              <input type="text" class="form-control" :class="{'is-invalid': errors.asset_code}"
                v-model="form.asset_code" placeholder="เช่น COMP-001" />
              <div class="invalid-feedback" v-if="errors.asset_code">{{ errors.asset_code[0] }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label">เลขทะเบียน GFMIS</label>
              <input type="text" class="form-control" v-model="form.gfmis_number" />
            </div>
            <div class="col-md-4">
              <label class="form-label">ประเภทครุภัณฑ์ <span class="text-danger">*</span></label>
              <select class="form-select" :class="{'is-invalid': errors.category_id}"
                v-model="form.category_id" @change="onCategoryChange">
                <option value="">-- เลือกประเภท --</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.category_name }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.category_id">{{ errors.category_id[0] }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label">สถานะ</label>
              <select class="form-select" v-model="form.status">
                <option :value="1">ใช้งานอยู่</option>
                <option :value="2">ไม่ได้ใช้งาน</option>
                <option :value="3">จำหน่าย</option>
                <option :value="4">กำลังซ่อมแซม</option>
                <option :value="5">ไม่ทราบสถานะ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- ข้อมูลการจัดซื้อ -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-shopping-cart me-2"></i>ข้อมูลการจัดซื้อ
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">วันที่ได้มา <span class="text-danger">*</span></label>
              <input type="date" class="form-control" :class="{'is-invalid': errors.acquisition_date}"
                v-model="form.acquisition_date" />
              <div class="invalid-feedback" v-if="errors.acquisition_date">{{ errors.acquisition_date[0] }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label">เลขที่เอกสาร</label>
              <input type="text" class="form-control" v-model="form.document_number" />
            </div>
            <div class="col-md-3">
              <label class="form-label">ราคาต่อหน่วย (บาท) <span class="text-danger">*</span></label>
              <input type="number" class="form-control" :class="{'is-invalid': errors.unit_price}"
                v-model="form.unit_price" min="0" step="0.01" />
              <div class="invalid-feedback" v-if="errors.unit_price">{{ errors.unit_price[0] }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label">จำนวน <span class="text-danger">*</span></label>
              <input type="number" class="form-control" :class="{'is-invalid': errors.quantity}"
                v-model="form.quantity" min="1" />
              <div class="invalid-feedback" v-if="errors.quantity">{{ errors.quantity[0] }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label">ประเภทงบประมาณ</label>
              <select class="form-select" v-model="form.budget_type">
                <option value="">-- เลือก --</option>
                <option :value="1">เงินงบประมาณ</option>
                <option :value="2">เงินนอกงบประมาณ</option>
                <option :value="3">เงินบริจาค/ช่วยเหลือ</option>
                <option :value="4">อื่นๆ</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">วิธีการได้มา</label>
              <select class="form-select" v-model="form.acquisition_method">
                <option value="">-- เลือก --</option>
                <option :value="1">วิธีเฉพาะเจาะจง</option>
                <option :value="2">วิธีคัดเลือก</option>
                <option :value="3">วิธีสอบราคา</option>
                <option :value="4">วิธีพิเศษ</option>
                <option :value="5">รับบริจาค</option>
              </select>
            </div>
            <div class="col-md-6">
              <div class="alert alert-info mb-0" v-if="form.unit_price && form.quantity">
                <strong>ราคารวม:</strong> {{ formatNumber(form.unit_price * form.quantity) }} บาท
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ข้อมูลค่าเสื่อม -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-chart-line me-2"></i>ข้อมูลค่าเสื่อมราคา
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">อายุการใช้งาน (ปี)</label>
              <input type="number" class="form-control" v-model="form.useful_life_years"
                min="1" max="100" :placeholder="defaultUsefulLife ? `จากประเภท: ${defaultUsefulLife} ปี` : ''" />
              <small class="text-muted">ถ้าไม่ระบุจะใช้ค่าจากประเภทครุภัณฑ์</small>
            </div>
            <div class="col-md-4">
              <label class="form-label">อัตราค่าเสื่อม (%)</label>
              <input type="number" class="form-control" v-model="form.depreciation_rate" :class="{'is-invalid': errors.depreciation_rate}"
                min="0" max="100" step="0.01" :placeholder="defaultDepRate ? `จากประเภท: ${defaultDepRate}%` : ''" />
              <small class="text-muted">ถ้าไม่ระบุจะใช้ค่าจากประเภทครุภัณฑ์</small>
              <div class="invalid-feedback" v-if="errors.depreciation_rate">{{ errors.depreciation_rate[0] }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ข้อมูลผู้ขาย -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-store me-2"></i>ข้อมูลผู้ขาย/ผู้บริจาค
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">ชื่อผู้ขาย/ผู้บริจาค</label>
              <input type="text" class="form-control" v-model="form.supplier_name" />
            </div>
            <div class="col-md-3">
              <label class="form-label">เบอร์โทรศัพท์</label>
              <input type="tel" class="form-control" v-model="form.supplier_phone" />
            </div>
          </div>
        </div>
      </div>

      <!-- หมายเหตุ -->
      <div class="card mb-4">
        <div class="card-header">
          <i class="fas fa-sticky-note me-2"></i>หมายเหตุ
        </div>
        <div class="card-body">
          <textarea class="form-control" v-model="form.notes" rows="3"
            placeholder="หมายเหตุเพิ่มเติม..."></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="fas fa-save me-2"></i>
          {{ isEditMode ? 'บันทึกการแก้ไข' : 'บันทึก' }}
        </button>
        <router-link to="/dashboard/equipment/registry" class="btn btn-secondary">
          ยกเลิก
        </router-link>
        <button 
          v-if="isEditMode" 
          type="button" 
          class="btn btn-danger ms-auto"
          @click="showDeleteModal = true"
        >
          <i class="fas fa-trash me-2"></i>
          ลบครุภัณฑ์
        </button>
      </div>
    </form>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle me-2"></i>
              ยืนยันการลบ
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <i class="fas fa-warning me-2"></i>
              <strong>คำเตือน:</strong> การลบครุภัณฑ์จะไม่สามารถกู้คืนได้
            </div>
            <p>คุณต้องการลบครุภัณฑ์ <strong>{{ form.asset_name }}</strong> ใช่หรือไม่?</p>
            <div class="mb-3">
              <label class="form-label">กรุณากรอกรหัสผ่านเพื่อยืนยัน <span class="text-danger">*</span></label>
              <input 
                type="password" 
                class="form-control" 
                :class="{'is-invalid': deleteError}"
                v-model="deletePassword"
                placeholder="กรอกรหัสผ่านของคุณ"
                @keyup.enter="confirmDelete"
              />
              <div class="invalid-feedback" v-if="deleteError">{{ deleteError }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDeleteModal">
              ยกเลิก
            </button>
            <button 
              type="button" 
              class="btn btn-danger" 
              @click="confirmDelete"
              :disabled="deleting || !deletePassword"
            >
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-trash me-2"></i>
              ยืนยันลบ
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showDeleteModal" @click="showDeleteModal = false"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/services/api';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();

const isEditMode = computed(() => !!route.params.id);
const loading = ref(false);
const submitting = ref(false);
const errors = ref({});
const categories = ref([]);
const defaultUsefulLife = ref(null);
const defaultDepRate = ref(null);

// Delete modal state
const showDeleteModal = ref(false);
const deletePassword = ref('');
const deleteError = ref('');
const deleting = ref(false);

const form = reactive({
  asset_name: '',
  asset_code: '',
  category_id: '',
  gfmis_number: '',
  acquisition_date: '',
  document_number: '',
  unit_price: '',
  quantity: 1,
  budget_type: '',
  acquisition_method: '',
  useful_life_years: '',
  depreciation_rate: '',
  supplier_name: '',
  supplier_phone: '',
  status: 1,
  notes: ''
});

const formatNumber = (num) => new Intl.NumberFormat('th-TH').format(num || 0);

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

const onCategoryChange = () => {
  const cat = categories.value.find(c => c.id === form.category_id);
  if (cat) {
    defaultUsefulLife.value = cat.useful_life_years;
    defaultDepRate.value = cat.depreciation_rate;
  } else {
    defaultUsefulLife.value = null;
    defaultDepRate.value = null;
  }
};

const loadAsset = async () => {
  if (!isEditMode.value) return;
  loading.value = true;
  try {
    const response = await api.get(`/assets/${route.params.id}`);
    if (response.data.success) {
      const asset = response.data.data;
      Object.keys(form).forEach(key => {
        if (asset[key] !== undefined && asset[key] !== null) {
          form[key] = asset[key];
        }
      });
      
      // Find matching category from categories list using category_code
      if (asset.category) {
        const matchedCategory = categories.value.find(
          c => c.id === asset.category.category_id
        );
        if (matchedCategory) {
          form.category_id = matchedCategory.id;
        }
      }
      
      onCategoryChange();
    }
  } catch (error) {
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
    router.push('/dashboard/equipment/registry');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  errors.value = {};

  try {
    const payload = {
      asset_name: form.asset_name,
      asset_code: form.asset_code,
      category_id: form.category_id,
      gfmis_number: form.gfmis_number || null,
      acquisition_date: form.acquisition_date,
      document_number: form.document_number || null,
      unit_price: parseFloat(form.unit_price),
      quantity: parseInt(form.quantity),
      budget_type: form.budget_type || null,
      acquisition_method: form.acquisition_method || null,
      useful_life_years: form.useful_life_years ? parseInt(form.useful_life_years) : null,
      depreciation_rate: form.depreciation_rate ? parseFloat(form.depreciation_rate) : null,
      supplier_name: form.supplier_name || null,
      supplier_phone: form.supplier_phone || null,
      status: form.status,
      notes: form.notes || null
    };

    let response;
    if (isEditMode.value) {
      response = await api.put(`/assets/${route.params.id}`, payload);
    } else {
      response = await api.post('/assets', payload);
    }

    if (response.data.success) {
      const encryptedId = response.data.data.encrypted_id;
      await Swal.fire({
        title: 'สำเร็จ',
        text: isEditMode.value ? 'อัปเดตครุภัณฑ์แล้ว' : 'เพิ่มครุภัณฑ์แล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      // Navigate to detail page
      router.push(`/dashboard/equipment/registry/${encryptedId}`);
    }
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {};
    } else {
      Swal.fire('ข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
    }
  } finally {
    submitting.value = false;
  }
};

// Delete functions
const closeDeleteModal = () => {
  showDeleteModal.value = false;
  deletePassword.value = '';
  deleteError.value = '';
};

const confirmDelete = async () => {
  if (!deletePassword.value) {
    deleteError.value = 'กรุณากรอกรหัสผ่าน';
    return;
  }

  deleting.value = true;
  deleteError.value = '';

  try {
    const response = await api.delete(`/assets/${route.params.id}`, {
      data: { password: deletePassword.value }
    });

    if (response.data.success) {
      closeDeleteModal();
      await Swal.fire({
        title: 'สำเร็จ',
        text: 'ลบครุภัณฑ์แล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      router.push('/dashboard/equipment/registry');
    }
  } catch (error) {
    if (error.response?.status === 422) {
      deleteError.value = error.response.data.message || 'รหัสผ่านไม่ถูกต้อง';
    } else {
      deleteError.value = error.response?.data?.message || 'เกิดข้อผิดพลาด';
    }
  } finally {
    deleting.value = false;
  }
};

onMounted(async () => {
  await loadCategories();
  await loadAsset();
});
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0;
}

.card-header {
  font-weight: 600;
  background: var(--bs-light);
}
</style>
