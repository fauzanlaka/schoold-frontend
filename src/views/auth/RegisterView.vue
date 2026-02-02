<template>
  <div class="auth-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="auth-card sf-card p-4 p-md-5">
            <!-- Logo/Brand -->
            <div class="text-center mb-4">
              <div class="auth-icon mb-3">
                <i class="fas fa-user-plus"></i>
              </div>
              <h2 class="fw-bold text-primary-sf mb-2">สร้างบัญชีใหม่</h2>
              <p class="text-muted">ลงทะเบียนเพื่อเริ่มใช้งานระบบ</p>
            </div>

            <!-- Alert Messages -->
            <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
              <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
              <button type="button" class="btn-close" @click="successMessage = ''"></button>
            </div>
            <div v-if="authStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
              <i class="fas fa-exclamation-circle me-2"></i>{{ authStore.error }}
              <button type="button" class="btn-close" @click="authStore.clearError()"></button>
            </div>

            <!-- Register Form -->
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="name" class="form-label fw-medium">ชื่อ-นามสกุล</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="fas fa-user text-muted"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control border-start-0 ps-0" 
                    :class="{ 'is-invalid': errors.name }"
                    id="name" 
                    v-model="form.name"
                    placeholder="กรอกชื่อ-นามสกุล"
                    required
                  >
                </div>
                <div v-if="errors.name" class="text-danger small mt-1">{{ errors.name[0] }}</div>
              </div>

              <div class="mb-3">
                <label for="email" class="form-label fw-medium">อีเมล</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="fas fa-envelope text-muted"></i>
                  </span>
                  <input 
                    type="email" 
                    class="form-control border-start-0 ps-0" 
                    :class="{ 'is-invalid': errors.email }"
                    id="email" 
                    v-model="form.email"
                    placeholder="example@email.com"
                    required
                  >
                </div>
                <div v-if="errors.email" class="text-danger small mt-1">{{ errors.email[0] }}</div>
              </div>

              <div class="mb-3">
                <label for="password" class="form-label fw-medium">รหัสผ่าน</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="fas fa-lock text-muted"></i>
                  </span>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control border-start-0 border-end-0 ps-0" 
                    :class="{ 'is-invalid': errors.password }"
                    id="password" 
                    v-model="form.password"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                    required
                  >
                  <button type="button" class="input-group-text bg-light border-start-0" @click="showPassword = !showPassword">
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" class="text-muted"></i>
                  </button>
                </div>
                <div v-if="errors.password" class="text-danger small mt-1">{{ errors.password[0] }}</div>
              </div>

              <div class="mb-4">
                <label for="password_confirmation" class="form-label fw-medium">ยืนยันรหัสผ่าน</label>
                <div class="input-group">
                  <span class="input-group-text bg-light border-end-0">
                    <i class="fas fa-lock text-muted"></i>
                  </span>
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control border-start-0 ps-0" 
                    :class="{ 'is-invalid': errors.password_confirmation }"
                    id="password_confirmation" 
                    v-model="form.password_confirmation"
                    placeholder="กรอกรหัสผ่านอีกครั้ง"
                    required
                  >
                </div>
                <div v-if="errors.password_confirmation" class="text-danger small mt-1">{{ errors.password_confirmation[0] }}</div>
              </div>

              <button 
                type="submit" 
                class="btn storefront-btn storefront-btn-primary w-100 py-2 mb-3"
                :disabled="authStore.loading"
              >
                <span v-if="authStore.loading">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  กำลังลงทะเบียน...
                </span>
                <span v-else>
                  <i class="fas fa-user-plus me-2"></i>ลงทะเบียน
                </span>
              </button>
            </form>

            <!-- Login Link -->
            <div class="text-center mt-4">
              <p class="text-muted mb-0">
                มีบัญชีอยู่แล้ว? 
                <router-link to="/login" class="text-primary-sf fw-medium text-decoration-none">เข้าสู่ระบบ</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const errors = ref({})
const showPassword = ref(false)
const successMessage = ref('')

async function handleSubmit() {
  errors.value = {}
  
  try {
    const response = await authStore.register(form)
    
    if (response.success) {
      if (response.requires_verification) {
        successMessage.value = 'ลงทะเบียนสำเร็จ! กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีของคุณ'
        // Don't redirect immediately, let user know to check email
      } else {
        successMessage.value = 'ลงทะเบียนสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...'
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    }
  } catch (err) {
    if (err.response?.data?.errors) {
      errors.value = err.response.data.errors
    }
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--sf-light) 0%, #e0f2fe 100%);
}

.auth-card {
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
}

.auth-icon {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--sf-primary), #0d9488);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  color: white;
}

.form-control:focus {
  border-color: var(--sf-primary);
  box-shadow: 0 0 0 0.2rem rgba(20, 184, 166, 0.15);
}

.input-group-text {
  border-color: #dee2e6;
}

.form-control {
  border-color: #dee2e6;
}
</style>
