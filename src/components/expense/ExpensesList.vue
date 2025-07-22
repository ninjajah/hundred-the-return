<template>
    <div>
        <h2 class="mb-6 text-2xl font-semibold text-white">Расходы</h2>

        <div
            v-if="expenses.length === 0"
            class="rounded-lg border border-gray-600 py-8 text-center text-gray-300"
        >
            Пока нет расходов
        </div>

        <div v-else class="space-y-3">
            <div
                v-for="expense in expenses"
                :key="expense.id"
                class="message-bubble flex items-center justify-between"
            >
                <div class="min-w-0 flex-1">
                    <div class="truncate font-medium text-white">
                        {{ expense.description }}
                    </div>
                    <div class="text-sm text-gray-300">
                        {{ expense.amount.toFixed(2) }} ₽ •
                        {{ expense.participant_name }}
                    </div>
                </div>
                <button
                    v-if="expense.participant_name === currentUserName"
                    @click="$emit('deleteExpense', expense.id)"
                    class="btn-secondary ml-4 flex-shrink-0 px-3 py-1 text-sm"
                    :disabled="deletingExpenseId === expense.id"
                >
                    <span v-if="deletingExpenseId === expense.id">Удаление...</span>
                    <span v-else>Удалить</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ExpenseItem } from '../../stores/expenseStore'

interface Props {
    expenses: ExpenseItem[]
    currentUserName?: string | null
    deletingExpenseId?: string | null
}

interface Emits {
    (e: 'deleteExpense', expenseId: string): void
}

defineProps<Props>()
defineEmits<Emits>()
</script>
