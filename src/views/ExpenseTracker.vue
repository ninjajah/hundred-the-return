<template>
    <div class="min-h-screen p-4">
        <div class="mx-auto max-w-4xl">
            <div class="relative mb-8 text-center">
                <h1 class="mb-2 text-4xl font-bold text-white">
                    <span v-if="store.currentUser">
                        Верни сотку,
                        <span class="text-purple-300">
                            {{ store.currentUser.name }}
                        </span>
                    </span>
                    <span v-else>Верни сотку</span>
                </h1>
                <button
                    v-if="store.currentExpenseGroupId"
                    @click="copyCurrentPageLink"
                    class="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
                    :class="{ 'text-green-400': linkCopied }"
                    title="Копировать ссылку на страницу"
                >
                    <span v-if="linkCopied">✓ Скопировано</span>
                    <span v-else>🔗 Поделиться</span>
                </button>
            </div>

            <div v-if="store.currentUser" class="space-y-6">
                <!-- Expenses and Summary Grid -->
                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <!-- Expenses Management -->
                    <div class="glass rounded-2xl p-6">
                        <!-- Add Expense Form -->
                        <h2 class="mb-6 text-2xl font-semibold text-white">
                            Добавить
                        </h2>
                        <form
                            @submit.prevent="addExpense"
                            class="mb-6 space-y-3"
                        >
                            <!-- Amount Field -->
                            <input
                                v-model.number="newExpenseAmount"
                                type="number"
                                step="0.01"
                                placeholder="Сумма (₽)"
                                class="input-field w-full"
                                required
                            />

                            <!-- Description Field -->
                            <textarea
                                v-model="newExpenseDescription"
                                placeholder="Описание расхода..."
                                rows="3"
                                class="input-field w-full resize-none"
                                required
                            ></textarea>

                            <!-- Submit Button -->
                            <button
                                type="submit"
                                class="btn-primary input-field w-full px-4 py-2"
                                :disabled="isAddingExpense"
                            >
                                <span v-if="isAddingExpense">
                                    ⏳ Добавление...
                                </span>
                                <span v-else>💰</span>
                            </button>
                        </form>

                        <!-- Expenses List -->
                        <h2 class="mb-6 text-2xl font-semibold text-white">
                            Расходы
                        </h2>
                        <div
                            v-if="store.expenses.length === 0"
                            class="rounded-lg border border-gray-600 py-8 text-center text-gray-300"
                        >
                            Пока нет расходов
                        </div>
                        <div v-else class="space-y-3">
                            <div
                                v-for="expense in store.expenses"
                                :key="expense.id"
                                class="message-bubble flex items-center justify-between"
                            >
                                <div class="min-w-0 flex-1">
                                    <div
                                        class="truncate font-medium text-white"
                                    >
                                        {{ expense.description }}
                                    </div>
                                    <div class="text-sm text-gray-300">
                                        {{ expense.amount.toFixed(2) }} ₽ •
                                        {{ expense.participant_name }}
                                    </div>
                                </div>
                                <button
                                    v-if="
                                        expense.participant_name ===
                                        store.currentUser?.name
                                    "
                                    @click="deleteExpense(expense.id)"
                                    class="btn-secondary ml-4 flex-shrink-0 px-3 py-1 text-sm"
                                    :disabled="isDeletingExpense"
                                >
                                    <span v-if="isDeletingExpense">
                                        Удаление...
                                    </span>
                                    <span v-else>Удалить</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Summary -->
                    <div class="glass rounded-2xl p-6">
                        <h2 class="mb-4 text-2xl font-semibold text-white">
                            Итого
                        </h2>
                        <!-- Debug info -->
                        <div
                            v-if="store.expenses.length > 0"
                            class="mb-4 text-xs text-gray-400"
                        >
                            Всего участников: {{ store.participants.length }} •
                            Всего расходов:
                            {{
                                store.expenses
                                    .reduce((sum, e) => sum + e.amount, 0)
                                    .toFixed(2)
                            }}
                            ₽
                        </div>
                        <div
                            v-if="store.expenseSummary.length === 0"
                            class="rounded-lg border border-gray-600 py-8 text-center text-gray-300"
                        >
                            Загрузка сводки...
                        </div>
                        <div v-else class="space-y-4">
                            <!-- Balances -->
                            <div
                                v-if="
                                    store.expenseSummary.some(
                                        s => s.total_spent > 0
                                    )
                                "
                                class="space-y-3"
                            >
                                <div
                                    v-for="summary in store.expenseSummary"
                                    :key="summary.participant_name"
                                    class="message-bubble"
                                >
                                    <div class="mb-2 font-medium text-white">
                                        {{ summary.participant_name }}
                                    </div>
                                    <div
                                        class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2"
                                    >
                                        <div class="text-gray-300">
                                            Потрачено:
                                            <span class="text-white">
                                                {{
                                                    summary.total_spent.toFixed(
                                                        2
                                                    )
                                                }}
                                                ₽
                                            </span>
                                        </div>
                                        <div class="text-gray-300">
                                            Баланс:
                                            <span
                                                :class="{
                                                    'text-green-400':
                                                        summary.balance > 0,
                                                    'text-red-400':
                                                        summary.balance < 0,
                                                    'text-white':
                                                        summary.balance === 0,
                                                }"
                                            >
                                                {{ summary.balance.toFixed(2) }}
                                                ₽
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div
                                v-else
                                class="rounded-lg border border-gray-600 py-8 text-center text-gray-300"
                            >
                                Пока нет расчетов
                            </div>

                            <!-- Settlements -->
                            <div
                                v-if="settlements.length > 0"
                                class="border-t border-gray-600 pt-4"
                            >
                                <h3
                                    class="mb-3 flex items-center text-lg font-semibold text-white"
                                >
                                    💸 Взаиморасчеты
                                </h3>
                                <div class="space-y-2">
                                    <div
                                        v-for="settlement in settlements"
                                        :key="`${settlement.from}-${settlement.to}`"
                                        class="message-bubble border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
                                    >
                                        <div
                                            class="flex items-center justify-between text-sm"
                                        >
                                            <div
                                                class="flex items-center space-x-2"
                                            >
                                                <span
                                                    class="font-medium text-white"
                                                >
                                                    {{ settlement.from }}
                                                </span>
                                                <span class="text-gray-400">
                                                    →
                                                </span>
                                                <span
                                                    class="font-medium text-white"
                                                >
                                                    {{ settlement.to }}
                                                </span>
                                            </div>
                                            <div
                                                class="font-semibold text-green-400"
                                            >
                                                {{
                                                    settlement.amount.toFixed(2)
                                                }}
                                                ₽
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="glass rounded-2xl p-8 text-center">
                <div
                    v-if="isLoading"
                    class="flex flex-col items-center space-y-4"
                >
                    <div
                        class="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
                    ></div>
                    <p class="text-xl text-white">Идет загрузка...</p>
                </div>
                <p v-else class="text-xl text-white">
                    Пожалуйста, сначала присоединитесь к группе расходов.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExpenseStore } from '../stores/expenseStore'

const route = useRoute()
const router = useRouter()
const store = useExpenseStore()

const newExpenseDescription = ref('')
const newExpenseAmount = ref(0)

const isAddingExpense = ref(false)
const linkCopied = ref(false)
const isLoading = ref(true)

// Computed property for settlements
const settlements = computed(() => {
    if (store.expenseSummary.length === 0) return []
    return store.calculateSettlements(store.expenseSummary)
})

async function addExpense() {
    if (
        newExpenseDescription.value &&
        newExpenseAmount.value > 0 &&
        !isAddingExpense.value
    ) {
        isAddingExpense.value = true
        try {
            const success = await store.addExpense(
                newExpenseDescription.value,
                newExpenseAmount.value
            )
            if (success) {
                newExpenseDescription.value = ''
                newExpenseAmount.value = 0
            } else {
                alert('Не удалось добавить расход')
            }
        } finally {
            isAddingExpense.value = false
        }
    }
}

const isDeletingExpense = ref(false)

async function deleteExpense(expenseId: string) {
    if (isDeletingExpense.value) return

    isDeletingExpense.value = true
    try {
        const success = await store.deleteExpense(expenseId)
        if (!success) {
            alert('Не удалось удалить расход')
        }
    } finally {
        isDeletingExpense.value = false
    }
}

async function copyCurrentPageLink() {
    if (!store.currentExpenseGroupId) return

    try {
        const joinUrl = `${window.location.origin}/join/${store.currentExpenseGroupId}`
        await navigator.clipboard.writeText(joinUrl)
        linkCopied.value = true
        setTimeout(() => {
            linkCopied.value = false
        }, 2000)
    } catch (err) {
        console.error('Не удалось скопировать ссылку:', err)
    }
}

onMounted(async () => {
    const groupId = route.params.id as string

    try {
        // Try to restore session first
        const sessionRestored = await store.restoreSession()

        // Check if user is in the correct group
        if (
            !sessionRestored ||
            !store.currentUser ||
            store.currentExpenseGroupId !== groupId
        ) {
            // Redirect to join page
            router.push(`/join/${groupId}`)
            return
        }
    } finally {
        // Отключаем состояние загрузки
        isLoading.value = false
    }
})
</script>
