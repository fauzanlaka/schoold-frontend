<template>
  <div class="user-management">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="page-title">
            <i class="fas fa-users me-2"></i>
            จัดการผู้ใช้งาน
          </h1>
          <p class="text-muted mb-0">บริหารจัดการผู้ใช้งานในโรงเรียน</p>
        </div>
        <div class="col-auto" v-if="authStore.hasPermission('users.create')">
          <button class="btn btn-primary" @click="showModal = true; resetForm()">
            <i class="fas fa-user-plus me-2"></i>
            เพิ่มผู้ใช้งาน
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-5">
            <div class="input-group">
              <span class="input-group-text"><i class="fas fa-search"></i></span>
              <input 
                type="text" 
                class="form-control" 
                placeholder="ค้นหาชื่อ, อีเมล..."
                v-model="search"
                @input="debounceSearch"
              />
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filters.role" @change="loadUsers">
              <option value="">ทุก Role</option>
              <option v-for="role in roles" :key="role.id" :value="role.name">
                {{ role.name }}
              </option>
            </select>
          </div>
          <div class="col-md-4 text-end">
            <span class="text-muted">พบ {{ pagination.total || 0 }} รายการ</span>
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
                <th>ชื่อ-นามสกุล</th>
                <th>อีเมล</th>
                <th>เบอร์โทร</th>
                <th>ตำแหน่ง</th>
                <th class="text-center">Role</th>
                <th class="text-center">สถานะ</th>
                <th class="text-center" style="width: 120px">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="7" class="text-center py-4">
                  <div class="spinner-border text-primary"></div>
                </td>
              </tr>
              <tr v-else-if="users.length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  <i class="fas fa-users-slash fa-3x mb-3 d-block"></i>
                  ไม่พบผู้ใช้งาน
                </td>
              </tr>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <strong>{{ user.name }}</strong>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone || '-' }}</td>
                <td>{{ user.position || '-' }}</td>
                <td class="text-center">
                  <span 
                    v-for="role in user.roles" 
                    :key="role.id"
                    class="badge me-1"
                    :class="getRoleBadgeClass(role.name)"
                  >
                    {{ role.name }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="badge" :class="user.pivot?.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ user.pivot?.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button 
                      v-if="authStore.hasPermission('users.edit')"
                      class="btn btn-outline-primary"
                      title="แก้ไข"
                      @click="editUser(user)"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <!-- <button 
                      v-if="authStore.hasPermission('users.delete')"
                      class="btn btn-outline-danger"
                      title="ลบ"
                      @click="deleteUser(user)"
                    >
                      <i class="fas fa-trash"></i>
                    </button> -->
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

    <!-- User Modal -->
    <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user me-2"></i>
              {{ isEditing ? 'แก้ไขผู้ใช้งาน' : 'เพิ่มผู้ใช้งาน' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveUser">
            <div class="modal-body">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">ชื่อ-นามสกุล <span class="text-danger">*</span></label>
                  <input 
                    type="text" 
                    class="form-control" 
                    :class="{ 'is-invalid': errors.name }"
                    v-model="form.name"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.name }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">อีเมล <span class="text-danger">*</span></label>
                  <input 
                    type="email" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    v-model="form.email"
                    required
                  />
                  <div class="invalid-feedback">{{ errors.email }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">เบอร์โทร</label>
                  <input 
                    type="tel" 
                    class="form-control"
                    v-model="form.phone"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">ตำแหน่ง</label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="form.position"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">
                    รหัสผ่าน 
                    <span class="text-danger" v-if="!isEditing">*</span>
                    <small class="text-muted" v-else>(เว้นว่างถ้าไม่ต้องการเปลี่ยน)</small>
                  </label>
                  <input 
                    type="password" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.password }"
                    v-model="form.password"
                    :required="!isEditing"
                  />
                  <div class="invalid-feedback">{{ errors.password }}</div>
                </div>
                <div class="col-md-6">
                  <label class="form-label">
                    ยืนยันรหัสผ่าน
                    <span class="text-danger" v-if="!isEditing">*</span>
                  </label>
                  <input 
                    type="password" 
                    class="form-control"
                    v-model="form.password_confirmation"
                    :required="!isEditing"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label">Role <span class="text-danger">*</span></label>
                  <select 
                    class="form-select"
                    :class="{ 'is-invalid': errors.role }"
                    v-model="form.role"
                    required
                  >
                    <option value="">เลือก Role</option>
                    <option v-for="role in roles" :key="role.id" :value="role.name">
                      {{ role.name }}
                    </option>
                  </select>
                  <div class="invalid-feedback">{{ errors.role }}</div>
                </div>
                <div class="col-md-6" v-if="isEditing">
                  <label class="form-label">สถานะ</label>
                  <select class="form-select" v-model="form.is_active">
                    <option :value="true">เปิดใช้งาน</option>
                    <option :value="false">ปิดใช้งาน</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">ยกเลิก</button>
              <button type="submit" class="btn btn-primary" :disabled="saving">
                <span v-if="saving">
                  <span class="spinner-border spinner-border-sm me-2"></span>
                  กำลังบันทึก...
                </span>
                <span v-else>
                  <i class="fas fa-save me-2"></i>
                  บันทึก
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show" v-if="showModal" @click="closeModal"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import api from '@/services/api';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const loading = ref(false);
const saving = ref(false);
const users = ref([]);
const roles = ref([]);
const search = ref('');
const showModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref(null);

const filters = reactive({
  role: ''
});

const pagination = reactive({
  current_page: 1,
  last_page: 1,
  total: 0
});

const form = reactive({
  name: '',
  email: '',
  phone: '',
  position: '',
  password: '',
  password_confirmation: '',
  role: '',
  is_active: true
});

const errors = reactive({
  name: '',
  email: '',
  password: '',
  role: ''
});

let searchTimeout = null;

const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(1, pagination.current_page - 2);
  const end = Math.min(pagination.last_page, pagination.current_page + 2);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const getRoleBadgeClass = (roleName) => {
  const classes = {
    'super-admin': 'bg-danger',
    'school-admin': 'bg-primary',
    'teacher': 'bg-info',
    'staff': 'bg-secondary'
  };
  return classes[roleName] || 'bg-light text-dark';
};

const loadRoles = async () => {
  try {
    const response = await api.get('/users/available-roles');
    if (response.data.success) {
      roles.value = response.data.data;
    }
  } catch (error) {
    console.error('Error loading roles:', error);
  }
};

const loadUsers = async (page = 1) => {
  loading.value = true;
  try {
    const params = {
      page,
      per_page: 15,
      search: search.value || undefined,
      role: filters.role || undefined
    };

    const response = await api.get('/users', { params });
    
    if (response.data.success) {
      users.value = response.data.data.data;
      pagination.current_page = response.data.data.current_page;
      pagination.last_page = response.data.data.last_page;
      pagination.total = response.data.data.total;
    }
  } catch (error) {
    console.error('Error loading users:', error);
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูลได้', 'error');
  } finally {
    loading.value = false;
  }
};

const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadUsers(1), 300);
};

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.last_page) {
    loadUsers(page);
  }
};

const resetForm = () => {
  isEditing.value = false;
  editingUserId.value = null;
  form.name = '';
  form.email = '';
  form.phone = '';
  form.position = '';
  form.password = '';
  form.password_confirmation = '';
  form.role = '';
  form.is_active = true;
  clearErrors();
};

const clearErrors = () => {
  errors.name = '';
  errors.email = '';
  errors.password = '';
  errors.role = '';
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const editUser = (user) => {
  isEditing.value = true;
  editingUserId.value = user.id;
  form.name = user.name;
  form.email = user.email;
  form.phone = user.phone || '';
  form.position = user.position || '';
  form.password = '';
  form.password_confirmation = '';
  form.role = user.roles?.[0]?.name || '';
  // Convert integer/boolean to boolean
  form.is_active = Boolean(user.pivot?.is_active);
  showModal.value = true;
  
  // Debug log
  console.log('Editing user:', user);
  console.log('Roles:', user.roles);
  console.log('Pivot:', user.pivot);
};

const saveUser = async () => {
  clearErrors();
  saving.value = true;

  try {
    const data = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      position: form.position,
      role: form.role,
      is_active: form.is_active
    };

    if (form.password) {
      data.password = form.password;
      data.password_confirmation = form.password_confirmation;
    }

    let response;
    if (isEditing.value) {
      response = await api.put(`/users/${editingUserId.value}`, data);
    } else {
      data.password = form.password;
      data.password_confirmation = form.password_confirmation;
      response = await api.post('/users', data);
    }

    if (response.data.success) {
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ',
        text: response.data.message,
        timer: 1500,
        showConfirmButton: false
      });
      closeModal();
      loadUsers(pagination.current_page);
    }
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors.name) errors.name = validationErrors.name[0];
      if (validationErrors.email) errors.email = validationErrors.email[0];
      if (validationErrors.password) errors.password = validationErrors.password[0];
      if (validationErrors.role) errors.role = validationErrors.role[0];
    } else {
      Swal.fire('ข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
    }
  } finally {
    saving.value = false;
  }
};

const deleteUser = (user) => {
  Swal.fire({
    title: 'ยืนยันการลบ',
    text: `คุณต้องการลบผู้ใช้ "${user.name}" ออกจากโรงเรียนใช่หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/users/${user.id}`);
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: response.data.message,
            timer: 1500,
            showConfirmButton: false
          });
          loadUsers(pagination.current_page);
        }
      } catch (error) {
        Swal.fire('ข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
      }
    }
  });
};

onMounted(() => {
  loadRoles();
  loadUsers();
});
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
}
</style>
