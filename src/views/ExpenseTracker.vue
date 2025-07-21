<template>
    <div class="min-h-screen p-4">
        <div class="mx-auto max-w-4xl">
            <AppHeader
                :current-user="store.currentUser"
                :show-share-button="!!store.currentExpenseGroupId"
                :is-link-copied="linkCopied"
                @share="copyCurrentPageLink"
            />

            <div v-if="store.currentUser" class="space-y-6">
                <!-- Expenses and Summary Grid -->
                <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <!-- Expenses Management -->
                    <ExpenseManagement
                        :expenses="store.expenses"
                        :current-user-name="store.currentUser?.name"
                        :is-adding-expense="isAddingExpense"
                        :is-deleting-expense="isDeletingExpense"
                        @addExpense="handleAddExpense"
                        @deleteExpense="deleteExpense"
                    />

                    <!-- Summary -->
                    <div class="glass rounded-2xl p-6">
                        <ExpenseSummary
                            :summary="store.expenseSummary"
                            :settlements="settlements"
                            :expenses="store.expenses"
                            :debug-info="{
                                participantsCount: store.participants.length,
                                totalExpenses: store.expenses.reduce(
                                    (sum, e) => sum + e.amount,
                                    0
                                ),
                            }"
                        />
                    </div>
                </div>
            </div>

            <LoadingState v-else :is-loading="isLoading" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useExpenseStore } from '../stores/expenseStore'

// Components
import {
    AppHeader,
    ExpenseManagement,
    ExpenseSummary,
    LoadingState,
} from '../components/expense'

const route = useRoute()
const router = useRouter()
const store = useExpenseStore()

const isAddingExpense = ref(false)
const linkCopied = ref(false)
const isLoading = ref(true)
const isDeletingExpense = ref(false)

// Computed property for settlements
const settlements = computed(() => {
    if (store.expenseSummary.length === 0) return []
    return store.calculateSettlements(store.expenseSummary)
})

// Handle add expense from component
async function handleAddExpense(data: { description: string; amount: number }) {
    if (!isAddingExpense.value) {
        isAddingExpense.value = true
        try {
            const success = await store.addExpense(
                data.description,
                data.amount
            )
            if (!success) {
                alert('Не удалось добавить расход')
            }
        } finally {
            isAddingExpense.value = false
        }
    }
}

// Handle delete expense
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
