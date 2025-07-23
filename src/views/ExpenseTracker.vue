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
                        :deleting-expense-id="deletingExpenseId"
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
const deletingExpenseId = ref<string | null>(null)

const settlements = computed(() => {
    if (store.expenseSummary.length === 0) return []
    return store.calculateSettlements(store.expenseSummary)
})

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

async function deleteExpense(expenseId: string) {
    if (deletingExpenseId.value) return

    deletingExpenseId.value = expenseId
    try {
        const success = await store.deleteExpense(expenseId)
        if (!success) {
            alert('Не удалось удалить расход')
        }
    } finally {
        deletingExpenseId.value = null
    }
}

async function copyCurrentPageLink() {
    if (!store.currentExpenseGroupId) return

    const joinUrl = `${window.location.origin}/join/${store.currentExpenseGroupId}`
    const shareText = `Приглашаю в группу для расчётов: ${joinUrl}`

    // Если доступен Telegram WebApp API, показываем Telegram диалог
    // @ts-ignore
    if (window.Telegram && Telegram.WebApp && Telegram.WebApp.share) {
        // @ts-ignore
        Telegram.WebApp.share(shareText)
        return
    }

    // Старый вариант — просто копируем ссылку
    try {
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
        const sessionRestored = await store.restoreSession()

        if (
            !sessionRestored ||
            !store.currentUser ||
            store.currentExpenseGroupId !== groupId
        ) {
            router.push(`/join/${groupId}`)
            return
        }
    } finally {
        isLoading.value = false
    }
})
</script>
