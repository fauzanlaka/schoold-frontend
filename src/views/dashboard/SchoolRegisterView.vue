<template>
  <div class="school-register">
    <!-- Page Header -->
    <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      <div>
        <h1 class="page-title">ลงทะเบียนโรงเรียน</h1>
        <p class="page-breadcrumb mb-0">
          <router-link to="/dashboard">หน้าแรก</router-link> / ลงทะเบียนโรงเรียน
        </p>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
      <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
      <button type="button" class="btn-close" @click="successMessage = ''"></button>
    </div>
    <div v-if="schoolStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-circle me-2"></i>{{ schoolStore.error }}
      <button type="button" class="btn-close" @click="schoolStore.clearError()"></button>
    </div>

    <!-- Registration Form Card -->
    <div class="db-card">
      <div class="db-card-header">
        <h5 class="db-card-title">
          <i class="fas fa-school me-2 text-primary"></i>
          กรอกข้อมูลโรงเรียน
        </h5>
      </div>
      <div class="db-card-body">
        <form @submit.prevent="handleSubmit">
          <!-- School Basic Info -->
          <div class="row g-3">
            <div class="col-md-6">
              <label for="school_name" class="form-label fw-medium">ชื่อโรงเรียน <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="fas fa-school text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.school_name }"
                  id="school_name" 
                  v-model="form.school_name"
                  placeholder="กรอกชื่อโรงเรียน"
                  required
                >
              </div>
              <div v-if="errors.school_name" class="text-danger small mt-1">{{ errors.school_name[0] }}</div>
            </div>

            <div class="col-md-6">
              <label for="school_code" class="form-label fw-medium">รหัสโรงเรียน <span class="text-danger">*</span></label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="fas fa-id-card text-muted"></i></span>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.school_code }"
                  id="school_code" 
                  v-model="form.school_code"
                  placeholder="กรอกรหัสโรงเรียน"
                  required
                >
              </div>
              <div v-if="errors.school_code" class="text-danger small mt-1">{{ errors.school_code[0] }}</div>
            </div>
          </div>

          <!-- Address Section -->
          <h6 class="mt-4 mb-3 text-muted">
            <i class="fas fa-map-marker-alt me-2"></i>ที่อยู่โรงเรียน
          </h6>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label for="address" class="form-label fw-medium">ที่อยู่ (บ้านเลขที่ หมู่ที่)</label>
              <input 
                type="text" 
                class="form-control" 
                id="address" 
                v-model="form.address"
                placeholder="เช่น 123/4 หมู่ 5"
              >
            </div>

            <div class="col-md-6">
              <label for="road" class="form-label fw-medium">ถนน</label>
              <input 
                type="text" 
                class="form-control" 
                id="road" 
                v-model="form.road"
                placeholder="ชื่อถนน"
              >
            </div>

            <!-- Province with search -->
            <div class="col-md-4">
              <label class="form-label fw-medium">จังหวัด <span class="text-danger">*</span></label>
              <v-select
                v-model="selectedProvince"
                :options="schoolStore.provinces"
                label="name_th"
                :reduce="province => province"
                placeholder="-- ค้นหาจังหวัด --"
                :clearable="false"
                @update:modelValue="onProvinceChange"
                :class="{ 'is-invalid-select': errors.province_id }"
              >
                <template #no-options>พิมพ์เพื่อค้นหาจังหวัด...</template>
              </v-select>
              <div v-if="errors.province_id" class="text-danger small mt-1">{{ errors.province_id[0] }}</div>
            </div>

            <!-- Amphure with search -->
            <div class="col-md-4">
              <label class="form-label fw-medium">อำเภอ/เขต <span class="text-danger">*</span></label>
              <v-select
                v-model="selectedAmphure"
                :options="schoolStore.amphures"
                label="name_th"
                :reduce="amphure => amphure"
                placeholder="-- ค้นหาอำเภอ/เขต --"
                :clearable="false"
                :disabled="!selectedProvince"
                @update:modelValue="onAmphureChange"
                :class="{ 'is-invalid-select': errors.amphure_id }"
              >
                <template #no-options>
                  {{ selectedProvince ? 'พิมพ์เพื่อค้นหาอำเภอ/เขต...' : 'กรุณาเลือกจังหวัดก่อน' }}
                </template>
              </v-select>
              <div v-if="errors.amphure_id" class="text-danger small mt-1">{{ errors.amphure_id[0] }}</div>
            </div>

            <!-- Subdistrict with search -->
            <div class="col-md-4">
              <label class="form-label fw-medium">ตำบล/แขวง <span class="text-danger">*</span></label>
              <v-select
                v-model="selectedSubdistrict"
                :options="schoolStore.subdistricts"
                label="name_th"
                :reduce="subdistrict => subdistrict"
                placeholder="-- ค้นหาตำบล/แขวง --"
                :clearable="false"
                :disabled="!selectedAmphure"
                @update:modelValue="onSubdistrictChange"
                :class="{ 'is-invalid-select': errors.district_id }"
              >
                <template #no-options>
                  {{ selectedAmphure ? 'พิมพ์เพื่อค้นหาตำบล/แขวง...' : 'กรุณาเลือกอำเภอ/เขตก่อน' }}
                </template>
              </v-select>
              <div v-if="errors.district_id" class="text-danger small mt-1">{{ errors.district_id[0] }}</div>
            </div>

            <div class="col-md-4">
              <label for="postal_code" class="form-label fw-medium">รหัสไปรษณีย์</label>
              <input 
                type="text" 
                class="form-control" 
                id="postal_code" 
                v-model="form.postal_code"
                placeholder="รหัสไปรษณีย์"
                readonly
              >
            </div>

            <div class="col-md-4">
              <label for="phone" class="form-label fw-medium">โทรศัพท์</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="fas fa-phone text-muted"></i></span>
                <input 
                  type="tel" 
                  class="form-control" 
                  id="phone" 
                  v-model="form.phone"
                  placeholder="หมายเลขโทรศัพท์"
                >
              </div>
            </div>

            <div class="col-md-4">
              <label for="email" class="form-label fw-medium">อีเมลโรงเรียน</label>
              <div class="input-group">
                <span class="input-group-text bg-light"><i class="fas fa-envelope text-muted"></i></span>
                <input 
                  type="email" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.email }"
                  id="email" 
                  v-model="form.email"
                  placeholder="email@school.ac.th"
                >
              </div>
              <div v-if="errors.email" class="text-danger small mt-1">{{ errors.email[0] }}</div>
            </div>
          </div>

          <!-- Grade Levels Section -->
          <h6 class="mt-4 mb-3 text-muted">
            <i class="fas fa-graduation-cap me-2"></i>ระดับชั้นที่เปิดสอน <span class="text-danger">*</span>
          </h6>
          
          <div class="row g-3">
            <div class="col-12">
              <div class="grade-levels-grid">
                <div 
                  v-for="level in schoolStore.gradeLevels" 
                  :key="level.id" 
                  class="form-check grade-level-item"
                >
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    :id="'grade_' + level.id" 
                    :value="level.id"
                    v-model="form.grade_levels"
                  >
                  <label class="form-check-label" :for="'grade_' + level.id">
                    {{ level.name }}
                  </label>
                </div>
              </div>
              <div v-if="errors.grade_levels" class="text-danger small mt-1">{{ errors.grade_levels[0] }}</div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="mt-4 pt-3 border-top">
            <button 
              type="submit" 
              class="db-btn db-btn-primary px-4 py-2"
              :disabled="schoolStore.loading"
            >
              <span v-if="schoolStore.loading">
                <span class="spinner-border spinner-border-sm me-2"></span>
                กำลังลงทะเบียน...
              </span>
              <span v-else>
                <i class="fas fa-save me-2"></i>ลงทะเบียนโรงเรียน
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSchoolStore } from '@/stores/school'
import { useAuthStore } from '@/stores/auth'
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'
import Swal from 'sweetalert2'

const router = useRouter()
const schoolStore = useSchoolStore()
const authStore = useAuthStore()

// Selected objects for v-select
const selectedProvince = ref(null)
const selectedAmphure = ref(null)
const selectedSubdistrict = ref(null)

const form = reactive({
  school_name: '',
  school_code: '',
  address: '',
  road: '',
  province_id: '',
  amphure_id: '',
  district_id: '',
  postal_code: '',
  phone: '',
  email: '',
  grade_levels: []
})

const errors = ref({})
const successMessage = ref('')

// Load initial data
onMounted(async () => {
  // Check if already registered
  try {
    const result = await schoolStore.checkRegistration()
    if (result.has_school) {
      router.push('/dashboard/school/profile')
      return
    }
  } catch (err) {
    console.error('Error checking registration:', err)
  }

  // Load provinces and grade levels
  await Promise.all([
    schoolStore.fetchProvinces(),
    schoolStore.fetchGradeLevels()
  ])
})

async function onProvinceChange(province) {
  selectedAmphure.value = null
  selectedSubdistrict.value = null
  form.amphure_id = ''
  form.district_id = ''
  form.postal_code = ''
  
  if (province) {
    form.province_id = province.id
    await schoolStore.fetchAmphures(province.id)
  } else {
    form.province_id = ''
  }
}

async function onAmphureChange(amphure) {
  selectedSubdistrict.value = null
  form.district_id = ''
  form.postal_code = ''
  
  if (amphure) {
    form.amphure_id = amphure.id
    await schoolStore.fetchSubdistricts(amphure.id)
  } else {
    form.amphure_id = ''
  }
}

function onSubdistrictChange(subdistrict) {
  if (subdistrict) {
    form.district_id = subdistrict.id
    if (subdistrict.postal_code) {
      form.postal_code = subdistrict.postal_code
    }
  } else {
    form.district_id = ''
    form.postal_code = ''
  }
}

async function handleSubmit() {
  errors.value = {}
  
  // Validate required fields
  if (!form.province_id) {
    errors.value.province_id = ['กรุณาเลือกจังหวัด']
  }
  if (!form.amphure_id) {
    errors.value.amphure_id = ['กรุณาเลือกอำเภอ/เขต']
  }
  if (!form.district_id) {
    errors.value.district_id = ['กรุณาเลือกตำบล/แขวง']
  }
  if (form.grade_levels.length === 0) {
    errors.value.grade_levels = ['กรุณาเลือกระดับชั้นที่เปิดสอนอย่างน้อย 1 ระดับ']
  }
  
  if (Object.keys(errors.value).length > 0) {
    return
  }

  try {
    const response = await schoolStore.registerSchool(form)
    
    if (response.success) {
      await Swal.fire({
        title: 'สำเร็จ!',
        text: 'ลงทะเบียนโรงเรียนสำเร็จ',
        icon: 'success',
        confirmButtonColor: '#14b8a6'
      })
      
      // Refresh user data to get new roles and permissions
      await authStore.fetchUser()
      
      router.push('/dashboard/school/profile')
    }
  } catch (err) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    }
  }
}
</script>

<style scoped>
.grade-levels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.grade-level-item {
  background: var(--db-bg-secondary, #f8fafc);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.grade-level-item:hover {
  border-color: var(--db-primary, #14b8a6);
  background: #f0fdfa;
}

.grade-level-item .form-check-input:checked {
  background-color: var(--db-primary, #14b8a6);
  border-color: var(--db-primary, #14b8a6);
}

.form-select:disabled,
.form-control:disabled {
  background-color: #f1f5f9;
  cursor: not-allowed;
}

/* Vue Select Styles */
:deep(.v-select) {
  --vs-border-color: #dee2e6;
  --vs-border-radius: 0.375rem;
  --vs-dropdown-min-width: 100%;
  --vs-search-input-placeholder-color: #6c757d;
}

:deep(.vs__dropdown-toggle) {
  padding: 0.375rem 0.75rem;
  min-height: 38px;
  background-color: #fff;
}

:deep(.vs__selected) {
  margin: 0;
  padding: 0;
}

:deep(.vs__search) {
  margin: 0;
  padding: 0;
}

:deep(.vs__search::placeholder) {
  color: #6c757d;
}

:deep(.vs--disabled .vs__dropdown-toggle) {
  background-color: #f1f5f9;
  cursor: not-allowed;
}

:deep(.vs__dropdown-option--highlight) {
  background: var(--db-primary, #14b8a6);
  color: white;
}

:deep(.vs__clear) {
  display: none;
}

.is-invalid-select :deep(.vs__dropdown-toggle) {
  border-color: #dc3545;
}
</style>

