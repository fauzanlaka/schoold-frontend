<template>
  <div class="role-management">
    <!-- Page Header -->
    <div class="page-header mb-4">
      <div class="row align-items-center">
        <div class="col">
          <h1 class="page-title">
            <i class="fas fa-user-shield me-2"></i>
            จัดการ Role และ Permission
          </h1>
          <p class="text-muted mb-0">กำหนดสิทธิ์การเข้าถึงระบบ</p>
        </div>
        <div class="col-auto" v-if="authStore.hasPermission('roles.create')">
          <button class="btn btn-primary" @click="showModal = true; resetForm()">
            <i class="fas fa-plus me-2"></i>
            เพิ่ม Role
          </button>
        </div>
      </div>
    </div>

    <!-- Role Cards -->
    <div class="row g-4">
      <div class="col-12" v-if="loading">
        <div class="text-center py-5">
          <div class="spinner-border text-primary"></div>
        </div>
      </div>
      
      <div class="col-md-6 col-lg-4" v-for="role in roles" :key="role.id">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h5 class="mb-0">
              <span class="badge me-2" :class="getRoleBadgeClass(role.name)">
                <i class="fas fa-shield-alt me-1"></i>
              </span>
              {{ role.name }}
            </h5>
            <div class="btn-group btn-group-sm" v-if="!isProtectedRole(role.name)">
              <button 
                v-if="authStore.hasPermission('roles.edit')"
                class="btn btn-outline-primary" 
                @click="editRole(role)" 
                title="แก้ไข"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                v-if="authStore.hasPermission('roles.delete')"
                class="btn btn-outline-danger" 
                @click="deleteRole(role)" 
                title="ลบ"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <span class="badge bg-dark" v-else>
              <i class="fas fa-lock me-1"></i> Protected
            </span>
          </div>
          <div class="card-body">
            <h6 class="text-muted mb-2">
              <i class="fas fa-key me-1"></i>
              Permissions ({{ role.permissions.length }})
            </h6>
            <div class="permission-list">
              <span 
                v-for="perm in role.permissions.slice(0, 8)" 
                :key="perm"
                class="badge bg-light text-dark me-1 mb-1"
                :title="perm"
              >
                {{ getPermissionLabel(perm) }}
              </span>
              <span 
                v-if="role.permissions.length > 8"
                class="badge bg-secondary"
              >
                +{{ role.permissions.length - 8 }} อื่นๆ
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Role Modal -->
    <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-user-shield me-2"></i>
              {{ isEditing ? 'แก้ไข Role' : 'เพิ่ม Role' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveRole">
            <div class="modal-body">
              <div class="mb-3">
                <label class="form-label">ชื่อ Role <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{ 'is-invalid': errors.name }"
                  v-model="form.name"
                  placeholder="เช่น manager, accountant"
                  required
                />
                <div class="invalid-feedback">{{ errors.name }}</div>
              </div>
              
              <div class="mb-3">
                <label class="form-label">
                  <i class="fas fa-key me-1"></i>
                  Permissions
                </label>
                <div class="permission-groups">
                  <div 
                    v-for="(perms, group) in groupedPermissions" 
                    :key="group"
                    class="permission-group card mb-2"
                  >
                    <div class="card-header py-2">
                      <div class="form-check">
                        <input 
                          class="form-check-input" 
                          type="checkbox"
                          :id="`group-${group}`"
                          :checked="isGroupChecked(perms)"
                          @change="toggleGroup(group, perms)"
                        />
                        <label class="form-check-label fw-bold" :for="`group-${group}`">
                          {{ getGroupLabel(group) }}
                        </label>
                      </div>
                    </div>
                    <div class="card-body py-2">
                      <div class="row">
                        <div class="col-md-6 col-lg-4" v-for="perm in perms" :key="perm.id">
                          <div class="form-check">
                            <input 
                              class="form-check-input" 
                              type="checkbox"
                              :id="`perm-${perm.id}`"
                              :value="perm.name"
                              v-model="form.permissions"
                            />
                            <label class="form-check-label small" :for="`perm-${perm.id}`">
                              {{ getPermissionLabel(perm.name) }}
                              <span class="text-muted ms-1" style="font-size: 0.75em;">({{ perm.name }})</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
const roles = ref([]);
const permissions = ref({});
const showModal = ref(false);
const isEditing = ref(false);
const editingRoleId = ref(null);

const form = reactive({
  name: '',
  permissions: []
});

const errors = reactive({
  name: ''
});

const groupedPermissions = computed(() => permissions.value);

const getRoleBadgeClass = (roleName) => {
  const classes = {
    'super-admin': 'bg-danger',
    'school-admin': 'bg-primary',
    'teacher': 'bg-info',
    'staff': 'bg-secondary'
  };
  return classes[roleName] || 'bg-dark';
};

// Thai labels for permission groups
const groupLabels = {
  'users': 'ผู้ใช้งาน',
  'roles': 'บทบาท',
  'permissions': 'สิทธิ์การใช้งาน',
  'schools': 'โรงเรียน',
  'students': 'นักเรียน',
  'teachers': 'ครู',
  'classes': 'ห้องเรียน',
  'subjects': 'วิชา',
  'grades': 'เกรด',
  'reports': 'รายงาน',
  'settings': 'ตั้งค่า',
  'dashboard': 'แดชบอร์ด',
  'assets': 'ทรัพย์สิน',
  'asset-categories': 'หมวดหมู่ทรัพย์สิน',
};

// Thai labels for permissions
const permissionLabels = {
  // Users
  'users.view': 'ดูผู้ใช้งาน',
  'users.create': 'เพิ่มผู้ใช้งาน',
  'users.edit': 'แก้ไขผู้ใช้งาน',
  'users.delete': 'ลบผู้ใช้งาน',
  // Roles
  'roles.view': 'ดูบทบาท',
  'roles.create': 'เพิ่มบทบาท',
  'roles.edit': 'แก้ไขบทบาท',
  'roles.delete': 'ลบบทบาท',
  // Schools
  'schools.view': 'ดูโรงเรียน',
  'schools.create': 'เพิ่มโรงเรียน',
  'schools.edit': 'แก้ไขโรงเรียน',
  'schools.delete': 'ลบโรงเรียน',
  // Students
  'students.view': 'ดูนักเรียน',
  'students.create': 'เพิ่มนักเรียน',
  'students.edit': 'แก้ไขนักเรียน',
  'students.delete': 'ลบนักเรียน',
  // Teachers
  'teachers.view': 'ดูครู',
  'teachers.create': 'เพิ่มครู',
  'teachers.edit': 'แก้ไขครู',
  'teachers.delete': 'ลบครู',
  // Classes
  'classes.view': 'ดูห้องเรียน',
  'classes.create': 'เพิ่มห้องเรียน',
  'classes.edit': 'แก้ไขห้องเรียน',
  'classes.delete': 'ลบห้องเรียน',
  // Subjects
  'subjects.view': 'ดูวิชา',
  'subjects.create': 'เพิ่มวิชา',
  'subjects.edit': 'แก้ไขวิชา',
  'subjects.delete': 'ลบวิชา',
  // Grades
  'grades.view': 'ดูเกรด',
  'grades.create': 'เพิ่มเกรด',
  'grades.edit': 'แก้ไขเกรด',
  'grades.delete': 'ลบเกรด',
  // Reports
  'reports.view': 'ดูรายงาน',
  'reports.export': 'ส่งออกรายงาน',
  // Settings
  'settings.view': 'ดูตั้งค่า',
  'settings.edit': 'แก้ไขตั้งค่า',
  // Dashboard
  'dashboard.view': 'ดูแดชบอร์ด',
  // Assets
  'assets.view': 'ดูทรัพย์สิน',
  'assets.create': 'เพิ่มทรัพย์สิน',
  'assets.edit': 'แก้ไขทรัพย์สิน',
  'assets.delete': 'ลบทรัพย์สิน',
  // Asset Categories
  'asset-categories.view': 'ดูหมวดหมู่ทรัพย์สิน',
  'asset-categories.create': 'เพิ่มหมวดหมู่ทรัพย์สิน',
  'asset-categories.edit': 'แก้ไขหมวดหมู่ทรัพย์สิน',
  'asset-categories.delete': 'ลบหมวดหมู่ทรัพย์สิน',
};

const getGroupLabel = (group) => {
  return groupLabels[group] || group;
};

const getPermissionLabel = (permName) => {
  return permissionLabels[permName] || permName;
};

const isProtectedRole = (roleName) => {
  return ['super-admin', 'school-admin'].includes(roleName);
};

const isGroupChecked = (perms) => {
  return perms.every(p => form.permissions.includes(p.name));
};

const toggleGroup = (group, perms) => {
  const allChecked = isGroupChecked(perms);
  if (allChecked) {
    // Uncheck all
    perms.forEach(p => {
      const idx = form.permissions.indexOf(p.name);
      if (idx > -1) form.permissions.splice(idx, 1);
    });
  } else {
    // Check all
    perms.forEach(p => {
      if (!form.permissions.includes(p.name)) {
        form.permissions.push(p.name);
      }
    });
  }
};

const loadRoles = async () => {
  loading.value = true;
  try {
    const response = await api.get('/roles');
    if (response.data.success) {
      roles.value = response.data.data;
    }
  } catch (error) {
    console.error('Error loading roles:', error);
    Swal.fire('ข้อผิดพลาด', 'ไม่สามารถโหลดข้อมูล Role ได้', 'error');
  } finally {
    loading.value = false;
  }
};

const loadPermissions = async () => {
  try {
    const response = await api.get('/permissions');
    if (response.data.success) {
      permissions.value = response.data.data;
    }
  } catch (error) {
    console.error('Error loading permissions:', error);
  }
};

const resetForm = () => {
  isEditing.value = false;
  editingRoleId.value = null;
  form.name = '';
  form.permissions = [];
  errors.name = '';
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const editRole = (role) => {
  isEditing.value = true;
  editingRoleId.value = role.id;
  form.name = role.name;
  form.permissions = [...role.permissions];
  showModal.value = true;
};

const saveRole = async () => {
  errors.name = '';
  saving.value = true;

  try {
    const data = {
      name: form.name,
      permissions: form.permissions
    };

    let response;
    if (isEditing.value) {
      response = await api.put(`/roles/${editingRoleId.value}`, data);
    } else {
      response = await api.post('/roles', data);
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
      loadRoles();
    }
  } catch (error) {
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors;
      if (validationErrors.name) errors.name = validationErrors.name[0];
    } else {
      Swal.fire('ข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
    }
  } finally {
    saving.value = false;
  }
};

const deleteRole = (role) => {
  Swal.fire({
    title: 'ยืนยันการลบ',
    text: `คุณต้องการลบ Role "${role.name}" ใช่หรือไม่?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc3545',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'ลบ',
    cancelButtonText: 'ยกเลิก'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await api.delete(`/roles/${role.id}`);
        if (response.data.success) {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: response.data.message,
            timer: 1500,
            showConfirmButton: false
          });
          loadRoles();
        }
      } catch (error) {
        Swal.fire('ข้อผิดพลาด', error.response?.data?.message || 'เกิดข้อผิดพลาด', 'error');
      }
    }
  });
};

onMounted(() => {
  loadRoles();
  loadPermissions();
});
</script>

<style scoped>
.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0;
}

.permission-list {
  max-height: 150px;
  overflow-y: auto;
}

.permission-group .card-header {
  background: #f8f9fa;
}

.permission-groups {
  max-height: 400px;
  overflow-y: auto;
}
</style>
