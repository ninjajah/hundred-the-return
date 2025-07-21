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
                    <input
                        v-model="groupTitle"
                        placeholder="Название группы (например: 'Поездка в Сочи')"
                        class="input-field w-full"
                    />
                    <button
                        @click="createNewExpenseGroup"
                        :disabled="isCreating || !groupTitle.trim()"
                        class="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span v-if="isCreating">Создание...</span>
                        <span v-else>Создать группу расходов</span>
                    </button>
                </div>

                <div
                    v-if="groupLink"
                    class="glass rounded-lg p-4 animate-slide-up"
                >
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
                            @click="goToExpenseGroup"
                            class="btn-primary w-full sm:w-auto px-3 py-2"
                            title="Присоединиться к группе"
                        >
                            <span class="sm:hidden">Присоединиться ➡️</span>
                            <span class="hidden sm:inline">➡️</span>
                        </button>
                        <button
                            @click="copyLink"
                            class="btn-secondary w-full sm:w-auto px-3 py-2"
                            :class="{
                                'bg-green-500/20 border-green-400/30': copied,
                            }"
                            title="Копировать ссылку"
                        >
                            <span v-if="copied">✓</span>
                            <span v-else>
                                <span class="sm:hidden"
                                    >Копировать ссылку📋</span
                                >
                                <span class="hidden sm:inline">📋</span>
                            </span>
                        </button>
                    </div>
                    <p class="text-xs text-gray-400 mt-2">
                        Поделитесь этой ссылкой с участниками группы
                    </p>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useExpenseStore } from '../stores/expenseStore'

const router = useRouter()
const expenseStore = useExpenseStore()
const isCreating = ref(false)
const groupLink = ref('')
const groupId = ref('')
const groupTitle = ref('')
const copied = ref(false)

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
</script>
