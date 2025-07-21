<template>
    <div>
        <h2 class="mb-4 text-2xl font-semibold text-white">Итого</h2>

        <!-- Debug info -->
        <div
            v-if="debugInfo && expenses.length > 0"
            class="mb-4 text-xs text-gray-400"
        >
            Всего участников: {{ debugInfo.participantsCount }} • Всего
            расходов: {{ debugInfo.totalExpenses.toFixed(2) }} ₽
        </div>

        <div
            v-if="summary.length === 0"
            class="rounded-lg border border-gray-600 py-8 text-center text-gray-300"
        >
            Загрузка сводки...
        </div>

        <div v-else class="space-y-4">
            <!-- Balances -->
            <div v-if="summary.some(s => s.total_spent > 0)" class="space-y-3">
                <div
                    v-for="participant in summary"
                    :key="participant.participant_name"
                    class="message-bubble"
                >
                    <div class="mb-2 font-medium text-white">
                        {{ participant.participant_name }}
                    </div>
                    <div class="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <div class="text-gray-300">
                            Потрачено:
                            <span class="text-white">
                                {{ participant.total_spent.toFixed(2) }} ₽
                            </span>
                        </div>
                        <div class="text-gray-300">
                            Баланс:
                            <span
                                :class="{
                                    'text-green-400': participant.balance > 0,
                                    'text-red-400': participant.balance < 0,
                                    'text-white': participant.balance === 0,
                                }"
                            >
                                {{ participant.balance.toFixed(2) }} ₽
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

            <!-- Settlements Section -->
            <SettlementsList
                v-if="settlements.length > 0"
                :settlements="settlements"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    ExpenseSummary,
    Settlement,
    ExpenseItem,
} from '../../stores/expenseStore'
import SettlementsList from './SettlementsList.vue'

interface Props {
    summary: ExpenseSummary[]
    settlements: Settlement[]
    expenses: ExpenseItem[]
    debugInfo?: {
        participantsCount: number
        totalExpenses: number
    } | null
}

defineProps<Props>()
</script>
