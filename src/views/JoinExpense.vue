<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <div class="glass rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
      <h1 class="text-3xl font-bold text-white mb-6">
        Присоединиться к группе расходов
      </h1>
      <form @submit.prevent="joinGroup">
        <input
          v-model="userName"
          placeholder="Введите ваше имя"
          class="input-field w-full mb-4"
          required
        />
        <button
          type="submit"
          :disabled="isJoining"
          class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isJoining">Присоединение...</span>
          <span v-else>Присоединиться</span>
        </button>
      </form>
      <p v-if="errorMessage" class="text-red-400 mt-4 text-sm">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExpenseStore } from '../stores/expenseStore'

const route = useRoute()
const router = useRouter()
const store = useExpenseStore()

const userName = ref('')
const errorMessage = ref('')
const isJoining = ref(false)

async function joinGroup() {
  if (!userName.value.trim()) {
    errorMessage.value = 'Пожалуйста, введите ваше имя'
    return
  }
  
  isJoining.value = true
  errorMessage.value = ''
  
  const groupId = route.params.id as string
  const result = await store.joinExpenseGroup(groupId, userName.value.trim())
  
  if (result.success) {
    // Redirect to expense tracker
    await router.push(`/expense/${groupId}`)
  } else {
    switch (result.error) {
      case 'GROUP_NOT_FOUND':
        errorMessage.value = 'Группа расходов не найдена или неактивна. Проверьте ссылку.'
        break
      case 'NAME_TAKEN':
        errorMessage.value = 'Имя уже занято в этой группе. Попробуйте другое имя.'
        break
      default:
        errorMessage.value = 'Произошла ошибка при присоединении к группе. Попробуйте ещё раз.'
    }
  }
  
  isJoining.value = false
}
</script>


