import { createRouter, createWebHistory } from 'vue-router'
import StorefrontLayout from '@/layouts/StorefrontLayout.vue'
import StorefrontHome from '@/views/storefront/StorefrontHome.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import DashboardHome from '@/views/dashboard/DashboardHome.vue'

// Import existing views if any, or separate into modules later
// import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Storefront Routes
    {
      path: '/',
      component: StorefrontLayout,
      children: [
        {
          path: '',
          name: 'storefront-home',
          component: StorefrontHome,
          meta: { title: 'หน้าแรก' }
        },
        // Auth Routes (Guest only)
        {
          path: 'register',
          name: 'register',
          component: () => import('../views/auth/RegisterView.vue'),
          meta: { guest: true, title: 'ลงทะเบียน' }
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/auth/LoginView.vue'),
          meta: { guest: true, title: 'เข้าสู่ระบบ' }
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('../views/auth/ForgotPasswordView.vue'),
          meta: { guest: true, title: 'ลืมรหัสผ่าน' }
        },
        {
          path: 'reset-password',
          name: 'reset-password',
          component: () => import('../views/auth/ResetPasswordView.vue'),
          meta: { guest: true, title: 'ตั้งรหัสผ่านใหม่' }
        },
        {
          path: 'email/verify/:id/:hash',
          name: 'email-verify',
          component: () => import('../views/auth/EmailVerificationView.vue'),
          meta: { guest: true }
        }
      ]
    },
    // Dashboard Routes (Protected)
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard-home',
          component: DashboardHome,
          meta: { title: 'แดชบอร์ด' }
        },
        {
          path: 'students',
          name: 'dashboard-students',
          component: () => import('../views/HomeView.vue') // Placeholder
        },
        {
          path: 'staff',
          name: 'dashboard-staff',
          component: () => import('../views/HomeView.vue') // Placeholder
        },
        {
          path: 'academic',
          name: 'dashboard-academic',
          component: () => import('../views/HomeView.vue') // Placeholder
        },
        {
          path: 'classes',
          name: 'dashboard-classes',
          component: () => import('../views/HomeView.vue') // Placeholder
        },
        {
          path: 'resources',
          name: 'dashboard-resources',
          component: () => import('../views/HomeView.vue') // Placeholder
        },
        {
          path: 'finance',
          name: 'dashboard-finance',
          component: () => import('../views/HomeView.vue') // Placeholder
        },
        {
          path: 'reports',
          name: 'dashboard-reports',
          component: () => import('../views/HomeView.vue') // Placeholder
        },
        // School routes
        {
          path: 'school/register',
          name: 'school-register',
          component: () => import('../views/dashboard/SchoolRegisterView.vue'),
          meta: { title: 'ลงทะเบียนโรงเรียน' }
        },
        {
          path: 'school/profile',
          name: 'school-profile',
          component: () => import('../views/dashboard/SchoolProfileView.vue'),
          meta: { title: 'ข้อมูลโรงเรียน' }
        },
        // ============ User Management Routes ============
        {
          path: 'users',
          name: 'user-management',
          component: () => import('../views/dashboard/UserManagement.vue'),
          meta: { permission: 'users.view', title: 'จัดการผู้ใช้งาน' }
        },
        {
          path: 'roles',
          name: 'role-management',
          component: () => import('../views/dashboard/RoleManagement.vue'),
          meta: { permission: 'roles.view', title: 'จัดการสิทธิ์และบทบาท' }
        },
        {
          path: 'settings',
          name: 'dashboard-settings',
          component: () => import('../views/HomeView.vue') // Placeholder
        },
        {
          path: 'unauthorized',
          name: 'unauthorized',
          component: () => import('../views/dashboard/UnauthorizedView.vue')
        },
        // ============ Equipment Module Routes ============
        // Asset Categories
        {
          path: 'equipment/categories',
          name: 'asset-category-list',
          component: () => import('../views/dashboard/equipment/AssetCategoryListView.vue'),
          meta: { permission: 'asset-categories.view', title: 'ประเภทครุภัณฑ์' }
        },
        {
          path: 'equipment/categories/create',
          name: 'asset-category-create',
          component: () => import('../views/dashboard/equipment/AssetCategoryFormView.vue'),
          meta: { permission: 'asset-categories.create', title: 'เพิ่มประเภทครุภัณฑ์' }
        },
        {
          path: 'equipment/categories/:id/edit',
          name: 'asset-category-edit',
          component: () => import('../views/dashboard/equipment/AssetCategoryFormView.vue'),
          meta: { permission: 'asset-categories.edit', title: 'แก้ไขประเภทครุภัณฑ์' }
        },
        // Assets
        {
          path: 'equipment/registry',
          name: 'asset-list',
          component: () => import('../views/dashboard/equipment/AssetListView.vue'),
          meta: { permission: 'assets.view', title: 'ทะเบียนครุภัณฑ์' }
        },
        {
          path: 'equipment/registry/create',
          name: 'asset-create',
          component: () => import('../views/dashboard/equipment/AssetFormView.vue'),
          meta: { permission: 'assets.create', title: 'เพิ่มครุภัณฑ์' }
        },
        {
          path: 'equipment/registry/:id',
          name: 'asset-detail',
          component: () => import('../views/dashboard/equipment/AssetDetailView.vue'),
          meta: { permission: 'assets.view', title: 'รายละเอียดครุภัณฑ์' }
        },
        {
          path: 'equipment/registry/:id/edit',
          name: 'asset-edit',
          component: () => import('../views/dashboard/equipment/AssetFormView.vue'),
          meta: { permission: 'assets.edit', title: 'แก้ไขครุภัณฑ์' }
        },
        // Asset Reports
        {
          path: 'equipment/reports',
          name: 'asset-reports',
          component: () => import('../views/dashboard/equipment/AssetReportsView.vue'),
          meta: { permission: 'assets.report', title: 'รายงานครุภัณฑ์' }
        },
      ]
    }
  ]
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('auth_user')
  
  // Create store instance (needs pinia active)
  let authStore = null
  // We need to import store here or inside to ensure pinia is ready if possible, 
  // but router is usually used after app mount or we can import useAuthStore at top.
  // However, Pinia stores can only be used after Pinia is installed.
  // We can assume router is used within app context.
  // Better yet, importing useAuthStore at top level is fine in Vue 3/Pinia as long as called inside the guard.
  
  // Import store
  const { useAuthStore } = await import('@/stores/auth')
  const store = useAuthStore()

  // Update document title
  const defaultTitle = 'ระบบบริหารจัดการโรงเรียน'
  const title = to.meta.title ? `${to.meta.title} - ${defaultTitle}` : defaultTitle
  document.title = title

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
        // Check for permission
        const requiredPermission = to.meta.permission
        if (requiredPermission) {
            // Ensure we have permissions loaded
            if (!store.user || !store.user.permissions) {
                // Try to fetch user again to get permissions if missing (e.g. page refresh)
                await store.fetchUser()
            }
            
            if (store.hasPermission(requiredPermission)) {
                next()
            } else {
                // No permission - redirect to unauthorized page
                console.warn(`User does not have permission: ${requiredPermission}`)
                next({ name: 'unauthorized' })
            }
        } else {
            next()
        }
    }
  }
  // Check if route is for guests only (login, register, etc.)
  else if (to.matched.some(record => record.meta.guest)) {
    if (isAuthenticated) {
      next({ name: 'dashboard-home' })
    } else {
      next()
    }
  }
  else {
    next()
  }
})

export default router

