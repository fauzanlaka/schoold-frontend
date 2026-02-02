<template>
  <div class="asset-category-form">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb mb-1">
              <li class="breadcrumb-item">
                <router-link to="/dashboard/equipment/categories">ประเภทครุภัณฑ์</router-link>
              </li>
              <li class="breadcrumb-item active">{{ isEditMode ? 'แก้ไข' : 'เพิ่มใหม่' }}</li>
            </ol>
          </nav>
          <h1 class="page-title">
            <i class="fas fa-tags me-2"></i>
            {{ isEditMode ? 'แก้ไขประเภทครุภัณฑ์' : 'เพิ่มประเภทครุภัณฑ์' }}
          </h1>
        </div>
      </div>
    </div>

    <!-- Form Card -->
    <div class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="row g-3">
            <!-- Category Name -->
            <div class="col-md-6">
              <label class="form-label">ชื่อประเภทครุภัณฑ์ <span class="text-danger">*</span></label>
              <input 
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.category_name }"
                v-model="form.category_name"
                placeholder="เช่น เครื่องคอมพิวเตอร์, โต๊ะ-เก้าอี้"
              />
              <div class="invalid-feedback" v-if="errors.category_name">
                {{ errors.category_name[0] }}
              </div>
            </div>

            <!-- Category Code -->
            <div class="col-md-6">
              <label class="form-label">รหัสประเภท</label>
              <input 
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.category_code }"
                v-model="form.category_code"
                placeholder="เช่น COMP, FURN"
              />
              <div class="invalid-feedback" v-if="errors.category_code">
                {{ errors.category_code[0] }}
              </div>
              <small class="text-muted">รหัสสั้นๆ สำหรับอ้างอิง (ไม่บังคับ)</small>
            </div>

            <!-- Useful Life Years -->
            <div class="col-md-6">
              <label class="form-label">อายุการใช้งาน (ปี) <span class="text-danger">*</span></label>
              <input 
                type="number"
                class="form-control"
                :class="{ 'is-invalid': errors.useful_life_years }"
                v-model="form.useful_life_years"
                min="1"
                max="100"
                placeholder="เช่น 5, 10"
              />
              <div class="invalid-feedback" v-if="errors.useful_life_years">
                {{ errors.useful_life_years[0] }}
              </div>
            </div>

            <!-- Depreciation Rate -->
            <div class="col-md-6">
              <label class="form-label">อัตราค่าเสื่อมราคา (%) <span class="text-danger">*</span></label>
              <div class="input-group">
                <input 
                  type="number"
                  class="form-control"
                  :class="{ 'is-invalid': errors.depreciation_rate }"
                  v-model="form.depreciation_rate"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="เช่น 20, 10"
                />
                <span class="input-group-text">%</span>
              </div>
              <div class="invalid-feedback" v-if="errors.depreciation_rate">
                {{ errors.depreciation_rate[0] }}
              </div>
              <small class="text-muted">ค่าเสื่อมราคาต่อปี (Straight-Line)</small>
            </div>

            <!-- Description -->
            <div class="col-12">
              <label class="form-label">คำอธิบาย</label>
              <textarea 
                class="form-control"
                :class="{ 'is-invalid': errors.description }"
                v-model="form.description"
                rows="3"
                placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับประเภทครุภัณฑ์นี้..."
              ></textarea>
              <div class="invalid-feedback" v-if="errors.description">
                {{ errors.description[0] }}
              </div>
            </div>

            <!-- Is Active -->
            <div class="col-12">
              <div class="form-check form-switch">
                <input 
                  type="checkbox"
                  class="form-check-input"
                  id="is_active"
                  v-model="form.is_active"
                />
                <label class="form-check-label" for="is_active">
                  เปิดใช้งานประเภทนี้
                </label>
              </div>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="mt-4 pt-3 border-top">
            <button type="submit" class="btn btn-primary me-2" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="fas fa-save me-2"></i>
              {{ isEditMode ? 'บันทึกการแก้ไข' : 'บันทึก' }}
            </button>
            <router-link to="/dashboard/equipment/categories" class="btn btn-secondary">
              ยกเลิก
            </router-link>
          </div>
        </form>
      </div>
    </div>
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
const submitting = ref(false);
const loading = ref(false);
const errors = ref({});

const form = reactive({
  category_name: '',
  category_code: '',
  useful_life_years: '',
  depreciation_rate: '',
  description: '',
  is_active: true
});

const loadCategory = async () => {
  if (!isEditMode.value) return;
  
  loading.value = true;
  try {
    const response = await api.get(`/asset-categories/${route.params.id}`);
    if (response.data.success) {
      const cat = response.data.data;
      form.category_name = cat.category_name;
      form.category_code = cat.category_code || '';
      form.useful_life_years = cat.useful_life_years;
      form.depreciation_rate = cat.depreciation_rate;
      form.description = cat.description || '';
      form.is_active = cat.is_active;
    }
  } catch (error) {
    console.error('Error loading category:', error);
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
    router.push('/dashboard/equipment/categories');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  submitting.value = true;
  errors.value = {};

  try {
    const payload = {
      category_name: form.category_name,
      category_code: form.category_code || null,
      useful_life_years: parseInt(form.useful_life_years),
      depreciation_rate: parseFloat(form.depreciation_rate),
      description: form.description || null,
      is_active: form.is_active
    };

    let response;
    if (isEditMode.value) {
      response = await api.put(`/asset-categories/${route.params.id}`, payload);
    } else {
      response = await api.post('/asset-categories', payload);
    }

    if (response.data.success) {
      await Swal.fire({
        title: 'สำเร็จ',
        text: isEditMode.value ? 'อัปเดตประเภทครุภัณฑ์แล้ว' : 'เพิ่มประเภทครุภัณฑ์แล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      router.push('/dashboard/equipment/categories');
    }
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors || {};
    } else {
      const message = error.response?.data?.message || 'เกิดข้อผิดพลาด';
      Swal.fire('ข้อผิดพลาด', message, 'error');
    }
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadCategory();
});
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--bs-dark);
  margin-bottom: 0;
}
</style>
