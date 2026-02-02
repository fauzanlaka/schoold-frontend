<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // If user has token/session but we need to ensure fresh data (like permissions)
  if (authStore.isAuthenticated) {
    await authStore.fetchUser()
  }
})
</script>

<template>
  <RouterView />
</template>
