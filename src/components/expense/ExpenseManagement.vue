<template>
    <div class="glass rounded-2xl p-6">
        <AddExpenseForm
            :is-submitting="isAddingExpense"
            @addExpense="onAddExpense"
        />

        <ExpensesList
            :expenses="expenses"
            :current-user-name="currentUserName"
            :is-deleting="isDeletingExpense"
            @deleteExpense="onDeleteExpense"
        />
    </div>
</template>

<script setup lang="ts">
import type { ExpenseItem } from '../../stores/expenseStore'
import AddExpenseForm from './AddExpenseForm.vue'
import ExpensesList from './ExpensesList.vue'

interface Props {
    expenses: ExpenseItem[]
    currentUserName?: string | null
    isAddingExpense?: boolean
    isDeletingExpense?: boolean
}

interface Emits {
    (e: 'addExpense', data: { description: string; amount: number }): void
    (e: 'deleteExpense', expenseId: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function onAddExpense(data: { description: string; amount: number }) {
    emit('addExpense', data)
}

function onDeleteExpense(expenseId: string) {
    emit('deleteExpense', expenseId)
}
</script>
