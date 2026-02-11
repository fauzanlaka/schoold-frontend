<template>
  <div class="school-profile">
    <!-- Page Header -->
    <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
      <div>
        <h1 class="page-title">ข้อมูลโรงเรียน</h1>
        <p class="page-breadcrumb mb-0">
          <router-link to="/dashboard">หน้าแรก</router-link> / โรงเรียนของฉัน
        </p>
      </div>
      <div v-if="!isEditing">
        <button class="db-btn db-btn-primary" @click="startEditing">
          <i class="fas fa-edit me-2"></i>แก้ไขข้อมูล
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-3 text-muted">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- No School Registered -->
    <div v-else-if="!schoolStore.school" class="text-center py-5">
      <div class="db-card p-5">
        <i class="fas fa-school fa-4x text-muted mb-4"></i>
        <h4 class="mb-3">ยังไม่ได้ลงทะเบียนโรงเรียน</h4>
        <p class="text-muted mb-4">คุณยังไม่ได้ลงทะเบียนโรงเรียน กรุณาลงทะเบียนเพื่อเริ่มใช้งาน</p>
        <router-link to="/dashboard/school/register" class="db-btn db-btn-primary">
          <i class="fas fa-plus me-2"></i>ลงทะเบียนโรงเรียน
        </router-link>
      </div>
    </div>

    <!-- School Info / Edit Form -->
    <div v-else>
      <!-- Alert Messages -->
      <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
        <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
        <button type="button" class="btn-close" @click="successMessage = ''"></button>
      </div>
      <div v-if="schoolStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>{{ schoolStore.error }}
        <button type="button" class="btn-close" @click="schoolStore.clearError()"></button>
      </div>

      <!-- View Mode -->
      <div v-if="!isEditing" class="row g-4">
        <!-- School Info Card -->
        <div class="col-lg-8">
          <div class="db-card">
            <div class="db-card-header">
              <h5 class="db-card-title">
                <i class="fas fa-school me-2 text-primary"></i>
                {{ schoolStore.school.school_name }}
              </h5>
              <span class="badge bg-success">ใช้งานอยู่</span>
            </div>
            <div class="db-card-body">
              <div class="row g-4">
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="text-muted small">รหัสโรงเรียน</label>
                    <p class="mb-0 fw-medium">{{ schoolStore.school.school_code }}</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="text-muted small">ชื่อส่วนราชการ</label>
                    <p class="mb-0">{{ schoolStore.school.government_agency_name || '-' }}</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="text-muted small">อีเมล</label>
                    <p class="mb-0">{{ schoolStore.school.email || '-' }}</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="text-muted small">โทรศัพท์</label>
                    <p class="mb-0">{{ schoolStore.school.phone || '-' }}</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <label class="text-muted small">วันที่ลงทะเบียน</label>
                    <p class="mb-0">{{ formatDate(schoolStore.school.registered_at) }}</p>
                  </div>
                </div>
                <div class="col-12">
                  <div class="info-item">
                    <label class="text-muted small">ที่อยู่</label>
                    <p class="mb-0">{{ fullAddress }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Grade Levels Card -->
        <div class="col-lg-4">
          <div class="db-card">
            <div class="db-card-header">
              <h5 class="db-card-title">
                <i class="fas fa-graduation-cap me-2 text-warning"></i>
                ระดับชั้นที่เปิดสอน
              </h5>
            </div>
            <div class="db-card-body">
              <div class="grade-levels-list">
                <div 
                  v-for="level in schoolStore.school.grade_levels" 
                  :key="level.id" 
                  class="grade-level-badge"
                >
                  <i class="fas fa-check-circle text-success me-2"></i>
                  {{ level.name }}
                </div>
                <div v-if="!schoolStore.school.grade_levels?.length" class="text-muted">
                  ไม่มีข้อมูล
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Mode -->
      <div v-else>
        <div class="db-card">
          <div class="db-card-header">
            <h5 class="db-card-title">
              <i class="fas fa-edit me-2 text-primary"></i>
              แก้ไขข้อมูลโรงเรียน
            </h5>
            <button class="db-btn db-btn-outline db-btn-sm" @click="cancelEditing">
              <i class="fas fa-times me-1"></i>ยกเลิก
            </button>
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
                      required
                    >
                  </div>
                  <div v-if="errors.school_code" class="text-danger small mt-1">{{ errors.school_code[0] }}</div>
                </div>

                <div class="col-md-6">
                  <label for="government_agency_name" class="form-label fw-medium">ชื่อส่วนราชการ</label>
                  <div class="input-group">
                    <span class="input-group-text bg-light"><i class="fas fa-landmark text-muted"></i></span>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="government_agency_name" 
                      v-model="form.government_agency_name"
                      placeholder="ระบุชื่อส่วนราชการ"
                    >
                  </div>
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
                  >
                </div>

                <div class="col-md-6">
                  <label for="road" class="form-label fw-medium">ถนน</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="road" 
                    v-model="form.road"
                  >
                </div>

                <div class="col-md-4">
                  <label for="province_id" class="form-label fw-medium">จังหวัด <span class="text-danger">*</span></label>
                  <select 
                    class="form-select" 
                    :class="{ 'is-invalid': errors.province_id }"
                    id="province_id" 
                    v-model="form.province_id"
                    @change="onProvinceChange"
                    required
                  >
                    <option value="">-- เลือกจังหวัด --</option>
                    <option v-for="province in schoolStore.provinces" :key="province.id" :value="province.id">
                      {{ province.name_th }}
                    </option>
                  </select>
                  <div v-if="errors.province_id" class="text-danger small mt-1">{{ errors.province_id[0] }}</div>
                </div>

                <div class="col-md-4">
                  <label for="amphure_id" class="form-label fw-medium">อำเภอ/เขต <span class="text-danger">*</span></label>
                  <select 
                    class="form-select" 
                    :class="{ 'is-invalid': errors.amphure_id }"
                    id="amphure_id" 
                    v-model="form.amphure_id"
                    @change="onAmphureChange"
                    required
                    :disabled="!form.province_id"
                  >
                    <option value="">-- เลือกอำเภอ/เขต --</option>
                    <option v-for="amphure in schoolStore.amphures" :key="amphure.id" :value="amphure.id">
                      {{ amphure.name_th }}
                    </option>
                  </select>
                  <div v-if="errors.amphure_id" class="text-danger small mt-1">{{ errors.amphure_id[0] }}</div>
                </div>

                <div class="col-md-4">
                  <label for="district_id" class="form-label fw-medium">ตำบล/แขวง <span class="text-danger">*</span></label>
                  <select 
                    class="form-select" 
                    :class="{ 'is-invalid': errors.district_id }"
                    id="district_id" 
                    v-model="form.district_id"
                    @change="onSubdistrictChange"
                    required
                    :disabled="!form.amphure_id"
                  >
                    <option value="">-- เลือกตำบล/แขวง --</option>
                    <option v-for="subdistrict in schoolStore.subdistricts" :key="subdistrict.id" :value="subdistrict.id">
                      {{ subdistrict.name_th }}
                    </option>
                  </select>
                  <div v-if="errors.district_id" class="text-danger small mt-1">{{ errors.district_id[0] }}</div>
                </div>

                <div class="col-md-4">
                  <label for="postal_code" class="form-label fw-medium">รหัสไปรษณีย์</label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="postal_code" 
                    v-model="form.postal_code"
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
              <div class="mt-4 pt-3 border-top d-flex gap-2">
                <button 
                  type="submit" 
                  class="db-btn db-btn-primary px-4 py-2"
                  :disabled="schoolStore.loading"
                >
                  <span v-if="schoolStore.loading">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    กำลังบันทึก...
                  </span>
                  <span v-else>
                    <i class="fas fa-save me-2"></i>บันทึกการเปลี่ยนแปลง
                  </span>
                </button>
                <button 
                  type="button" 
                  class="db-btn db-btn-outline px-4 py-2"
                  @click="cancelEditing"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useSchoolStore } from '@/stores/school'
import Swal from 'sweetalert2'

const schoolStore = useSchoolStore()

const isLoading = ref(true)
const isEditing = ref(false)
const successMessage = ref('')
const errors = ref({})

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
  government_agency_name: '',
  grade_levels: []
})

const fullAddress = computed(() => {
  const school = schoolStore.school
  if (!school) return '-'
  
  const parts = []
  if (school.address) parts.push(school.address)
  if (school.road) parts.push(`ถนน${school.road}`)
  if (school.subdistrict?.name_th) parts.push(`ตำบล${school.subdistrict.name_th}`)
  if (school.amphure?.name_th) parts.push(`อำเภอ${school.amphure.name_th}`)
  if (school.province?.name_th) parts.push(`จังหวัด${school.province.name_th}`)
  if (school.postal_code) parts.push(school.postal_code)
  
  return parts.join(' ') || '-'
})

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    await schoolStore.fetchSchool()
  } catch (err) {
    console.error('Error fetching school:', err)
  } finally {
    isLoading.value = false
  }
})

async function startEditing() {
  isEditing.value = true
  
  // Load data for dropdowns
  await Promise.all([
    schoolStore.fetchProvinces(),
    schoolStore.fetchGradeLevels()
  ])
  
  // Populate form with current data
  const school = schoolStore.school
  form.school_name = school.school_name || ''
  form.school_code = school.school_code || ''
  form.address = school.address || ''
  form.road = school.road || ''
  form.province_id = school.province_id || ''
  form.amphure_id = school.amphure_id || ''
  form.district_id = school.district_id || ''
  form.postal_code = school.postal_code || ''
  form.phone = school.phone || ''
  form.email = school.email || ''
  form.government_agency_name = school.government_agency_name || ''
  form.grade_levels = school.grade_levels?.map(gl => gl.id) || []
  
  // Load amphures and subdistricts based on current selection
  if (form.province_id) {
    await schoolStore.fetchAmphures(form.province_id)
  }
  if (form.amphure_id) {
    await schoolStore.fetchSubdistricts(form.amphure_id)
  }
}

function cancelEditing() {
  isEditing.value = false
  errors.value = {}
  schoolStore.clearError()
}

async function onProvinceChange() {
  form.amphure_id = ''
  form.district_id = ''
  form.postal_code = ''
  
  if (form.province_id) {
    await schoolStore.fetchAmphures(form.province_id)
  }
}

async function onAmphureChange() {
  form.district_id = ''
  form.postal_code = ''
  
  if (form.amphure_id) {
    await schoolStore.fetchSubdistricts(form.amphure_id)
  }
}

function onSubdistrictChange() {
  const selected = schoolStore.subdistricts.find(s => s.id === form.district_id)
  if (selected && selected.postal_code) {
    form.postal_code = selected.postal_code
  }
}

async function handleSubmit() {
  errors.value = {}
  
  if (form.grade_levels.length === 0) {
    errors.value.grade_levels = ['กรุณาเลือกระดับชั้นที่เปิดสอนอย่างน้อย 1 ระดับ']
    return
  }

  try {
    const response = await schoolStore.updateSchool(form)
    
    if (response.success) {
      isEditing.value = false
      
      await Swal.fire({
        title: 'สำเร็จ!',
        text: 'อัปเดตข้อมูลโรงเรียนสำเร็จ',
        icon: 'success',
        confirmButtonColor: '#14b8a6'
      })
      
      // Refresh data
      await schoolStore.fetchSchool()
    }
  } catch (err) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    }
  }
}
</script>

<style scoped>
.info-item {
  padding: 0.75rem;
  background: var(--db-bg-secondary, #f8fafc);
  border-radius: 8px;
}

.info-item label {
  display: block;
  margin-bottom: 0.25rem;
}

.grade-levels-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.grade-level-badge {
  padding: 0.75rem 1rem;
  background: #f0fdfa;
  border-radius: 8px;
  border: 1px solid #99f6e4;
}

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
</style>
