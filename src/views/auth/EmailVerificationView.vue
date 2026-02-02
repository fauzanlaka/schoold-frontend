<template>
  <div class="auth-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="auth-card sf-card p-4 p-md-5">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">กำลังโหลด...</span>
              </div>
              <p class="mt-3 text-muted">กำลังยืนยันอีเมลของคุณ...</p>
            </div>

            <!-- Success State -->
            <div v-else-if="verificationSuccess" class="text-center">
              <div class="auth-icon auth-icon-success mb-3">
                <i class="fas fa-check"></i>
              </div>
              <h2 class="fw-bold text-success mb-3">ยืนยันอีเมลสำเร็จ!</h2>
              <p class="text-muted mb-4">
                {{ message || 'อีเมลของคุณได้รับการยืนยันเรียบร้อยแล้ว คุณสามารถเข้าสู่ระบบได้เลย' }}
              </p>
              <router-link to="/login" class="btn storefront-btn storefront-btn-primary w-100 py-2">
                <i class="fas fa-sign-in-alt me-2"></i>เข้าสู่ระบบ
              </router-link>
            </div>

            <!-- Error State -->
            <div v-else-if="verificationError" class="text-center">
              <div class="auth-icon auth-icon-error mb-3">
                <i class="fas fa-times"></i>
              </div>
              <h2 class="fw-bold text-danger mb-3">ยืนยันอีเมลไม่สำเร็จ</h2>
              <p class="text-muted mb-4">{{ message || 'ลิงค์ยืนยันอีเมลไม่ถูกต้องหรือหมดอายุแล้ว' }}</p>
              
              <!-- Resend Form -->
              <div class="resend-section mt-4">
                <p class="text-muted small mb-3">ต้องการส่งอีเมลยืนยันอีกครั้ง?</p>
                <form @submit.prevent="handleResend">
                  <div class="mb-3">
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0">
                        <i class="fas fa-envelope text-muted"></i>
                      </span>
                      <input 
                        type="email" 
                        class="form-control border-start-0 ps-0" 
                        v-model="resendEmail"
                        placeholder="กรอกอีเมลของคุณ"
                        required
                      >
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    class="btn storefront-btn storefront-btn-outline-primary w-100 py-2"
                    :disabled="resending"
                  >
                    <span v-if="resending">
                      <span class="spinner-border spinner-border-sm me-2"></span>
                      กำลังส่ง...
                    </span>
                    <span v-else>
                      <i class="fas fa-paper-plane me-2"></i>ส่งอีเมลยืนยันอีกครั้ง
                    </span>
                  </button>
                </form>
              </div>
            </div>

            <!-- Resend Success -->
            <div v-else-if="resendSuccess" class="text-center">
              <div class="auth-icon auth-icon-info mb-3">
                <i class="fas fa-envelope"></i>
              </div>
              <h2 class="fw-bold text-primary-sf mb-3">ส่งอีเมลเรียบร้อย!</h2>
              <p class="text-muted mb-4">
                {{ message || 'เราได้ส่งลิงค์ยืนยันไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมาย' }}
              </p>
              <router-link to="/login" class="btn storefront-btn storefront-btn-primary w-100 py-2">
                <i class="fas fa-sign-in-alt me-2"></i>ไปหน้าเข้าสู่ระบบ
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'

const route = useRoute()

const loading = ref(true)
const verificationSuccess = ref(false)
const verificationError = ref(false)
const resendSuccess = ref(false)
const resending = ref(false)
const message = ref('')
const resendEmail = ref('')

onMounted(async () => {
  const { id, hash } = route.params
  const { expires, signature } = route.query

  if (id && hash) {
    await verifyEmail(id, hash, expires, signature)
  } else {
    loading.value = false
    verificationError.value = true
    message.value = 'ลิงค์ยืนยันอีเมลไม่ถูกต้อง'
  }
})

async function verifyEmail(id, hash, expires, signature) {
  try {
    const response = await api.get(`/email/verify/${id}/${hash}`, {
      params: { expires, signature }
    })
    
    if (response.data.success) {
      verificationSuccess.value = true
      message.value = response.data.message
    } else {
      verificationError.value = true
      message.value = response.data.message
    }
  } catch (err) {
    verificationError.value = true
    message.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการยืนยันอีเมล'
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  if (!resendEmail.value) return
  
  resending.value = true
  
  try {
    const response = await api.post('/email/resend-verification', {
      email: resendEmail.value
    })
    
    if (response.data.success) {
      verificationError.value = false
      resendSuccess.value = true
      message.value = response.data.message
    }
  } catch (err) {
    message.value = err.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งอีเมล'
  } finally {
    resending.value = false
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
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
}

.auth-icon-success {
  background: linear-gradient(135deg, #10b981, #059669);
}

.auth-icon-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.auth-icon-info {
  background: linear-gradient(135deg, var(--sf-primary), #0d9488);
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
