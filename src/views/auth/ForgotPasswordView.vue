<template>
  <div class="auth-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="auth-card sf-card p-4 p-md-5">
            <!-- Logo/Brand -->
            <div class="text-center mb-4">
              <div class="auth-icon mb-3">
                <i class="fas fa-key"></i>
              </div>
              <h2 class="fw-bold text-primary-sf mb-2">ลืมรหัสผ่าน</h2>
              <p class="text-muted">กรอกอีเมลเพื่อรับลิงค์รีเซ็ตรหัสผ่าน</p>
            </div>

            <!-- Alert Messages -->
            <div v-if="successMessage" class="alert alert-success" role="alert">
              <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
            </div>
            <div v-if="authStore.error" class="alert alert-danger alert-dismissible fade show" role="alert">
              <i class="fas fa-exclamation-circle me-2"></i>{{ authStore.error }}
              <button type="button" class="btn-close" @click="authStore.clearError()"></button>
            </div>

            <!-- Forgot Password Form -->
            <form @submit.prevent="handleSubmit" v-if="!successMessage">
              <div class="mb-4">
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

              <button 
                type="submit" 
                class="btn storefront-btn storefront-btn-primary w-100 py-2 mb-3"
                :disabled="authStore.loading"
              >
                <span v-if="authStore.loading">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  กำลังส่งลิงค์...
                </span>
                <span v-else>
                  <i class="fas fa-paper-plane me-2"></i>ส่งลิงค์รีเซ็ตรหัสผ่าน
                </span>
              </button>
            </form>

            <!-- Back to Login Link -->
            <div class="text-center mt-4">
              <router-link to="/login" class="text-primary-sf text-decoration-none">
                <i class="fas fa-arrow-left me-2"></i>กลับไปหน้าเข้าสู่ระบบ
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const form = reactive({
  email: ''
})

const errors = ref({})
const successMessage = ref('')

async function handleSubmit() {
  errors.value = {}
  
  try {
    const response = await authStore.forgotPassword(form.email)
    
    if (response.success) {
      successMessage.value = response.message
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
