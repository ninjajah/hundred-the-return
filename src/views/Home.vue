<template>
    <div class="min-h-screen flex items-center justify-center p-4">
        <div
            class="glass rounded-2xl p-8 max-w-md w-full text-center animate-fade-in"
        >
            <div class="mb-8">
                <div
                    class="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center"
                >
                    <svg
                        class="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-white mb-2">
                    Верни сотку
                </h1>
                <p class="text-gray-300">
                    Создайте группу для учета совместных расходов
                </p>
            </div>

            <div class="space-y-4">
                <div v-if="!groupLink" class="space-y-4">
                    <form @submit.prevent="createNewExpenseGroup" class="space-y-4">
                        <input
                            v-model="groupTitle"
                            placeholder="Название группы (например: 'Поездка в Сочи')"
                            class="input-field w-full"
                            required
                        />
                        <button
                            type="submit"
                            :disabled="isCreating || !groupTitle.trim()"
                            class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span v-if="isCreating">Создание...</span>
                            <span v-else>Создать группу расходов</span>
                        </button>
                    </form>
                </div>

                <div
                    v-if="groupLink"
                    class="glass rounded-lg p-4 animate-slide-up space-y-4"
                >
                    <div>
                        <form @submit.prevent="joinExpenseGroup" class="space-y-3">
                            <input
                                v-model="userName"
                                placeholder="Ваше имя"
                                class="input-field w-full"
                                required
                            />
                            <button
                                type="submit"
                                :disabled="isJoining || !userName.trim()"
                                class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span v-if="isJoining">⏳ Присоединение...</span>
                                <span v-else>💰 Присоединиться</span>
                            </button>
                        </form>
                        <p v-if="joinError" class="text-red-400 text-sm mt-2">{{ joinError }}</p>
                    </div>
                    
                    <div class="border-t border-gray-600 pt-4">
                        <p class="text-sm text-gray-300 mb-2">Ссылка для присоединения:</p>
                        <div
                            class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                        >
                            <input
                                :value="groupLink"
                                readonly
                                class="input-field w-full sm:flex-1 text-sm"
                            />
                            <button
                                @click="copyLink"
                                class="btn-secondary w-full sm:w-auto px-3 py-2"
                                :class="{
                                    'bg-green-500/20 border-green-400/30': copied,
                                }"
                                title="Копировать ссылку"
                            >
                                <span v-if="copied">✓ Скопировано</span>
                                <span v-else>📋 Копировать</span>
                            </button>
                        </div>
                        <p class="text-xs text-gray-400 mt-2">
                            Поделитесь этой ссылкой с участниками группы
                        </p>
                    </div>
                </div>
            </div>

            <div class="mt-8 text-xs text-gray-400 space-y-1">
                <p>• Неограниченное количество участников</p>
                <p>• Каждый видит только свои расходы</p>
                <p>• Автоматический расчет балансов</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useExpenseStore } from '../stores/expenseStore'

const router = useRouter()
const route = useRoute()
const expenseStore = useExpenseStore()
const isCreating = ref(false)
const groupLink = ref('')
const groupId = ref('')
const groupTitle = ref('')
const copied = ref(false)
const userName = ref('')
const isJoining = ref(false)
const joinError = ref('')

// Проверяем, есть ли параметр группы в URL
onMounted(async () => {
    const groupParam = route.query.group as string
    if (groupParam) {
        // Проверяем, что пользователь уже не в этой группе
        await expenseStore.restoreSession()
        if (expenseStore.isUserInExpenseGroup(groupParam)) {
            // Перенаправляем к трекеру
            router.push(`/expense/${groupParam}`)
            return
        }
        
        // Проверяем, существует ли группа
        const groupExists = await expenseStore.expenseGroupExists(groupParam)
        if (groupExists) {
            // Показываем форму присоединения
            groupId.value = groupParam
            groupLink.value = getExpenseGroupUrl(groupParam)
        } else {
            // Группа не найдена
            joinError.value = 'Группа расходов не найдена или неактивна.'
        }
        
        // Очищаем URL от query-параметра
        router.replace('/')
    }
})

async function createNewExpenseGroup() {
    if (!groupTitle.value.trim()) {
        alert('Please enter a title for your expense group')
        return
    }
    
    isCreating.value = true

    try {
        const newGroupId = await expenseStore.createExpenseGroup(groupTitle.value.trim())
        if (newGroupId) {
            groupId.value = newGroupId
            groupLink.value = getExpenseGroupUrl(newGroupId)
        }
    } finally {
        isCreating.value = false
    }
}

function getExpenseGroupUrl(id: string): string {
    return `${window.location.origin}/join/${id}`
}

function goToExpenseGroup() {
    if (groupId.value) {
        router.push(`/join/${groupId.value}`)
    }
}

async function copyLink() {
    try {
        await navigator.clipboard.writeText(groupLink.value)
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000)
    } catch (err) {
        console.error('Не удалось скопировать ссылку:', err)
    }
}

async function joinExpenseGroup() {
    if (!userName.value.trim() || !groupId.value) return
    
    isJoining.value = true
    joinError.value = ''
    
    try {
        const result = await expenseStore.joinExpenseGroup(groupId.value, userName.value.trim())
        
        if (result.success) {
            // Переходим к трекеру расходов
            await router.push(`/expense/${groupId.value}`)
        } else {
            switch (result.error) {
                case 'GROUP_NOT_FOUND':
                    joinError.value = 'Группа расходов не найдена или неактивна.'
                    break
                case 'NAME_TAKEN':
                    joinError.value = 'Имя уже занято в этой группе. Попробуйте другое имя.'
                    break
                default:
                    joinError.value = 'Произошла ошибка при присоединении к группе.'
            }
        }
    } finally {
        isJoining.value = false
    }
}
</script>
