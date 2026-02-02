<template>
  <div class="unauthorized-page">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-6 text-center">
          <div class="card shadow-sm">
            <div class="card-body p-5">
              <div class="mb-4">
                <i class="fas fa-lock fa-4x text-danger"></i>
              </div>
              <h1 class="h3 mb-3">ไม่มีสิทธิ์เข้าถึง</h1>
              <p class="text-muted mb-4">
                คุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ กรุณาติดต่อผู้ดูแลระบบหากต้องการสิทธิ์เพิ่มเติม
              </p>
              <router-link to="/dashboard" class="btn btn-primary">
                <i class="fas fa-home me-2"></i>
                กลับหน้าหลัก
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.unauthorized-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
}
</style>
