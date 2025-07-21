<template>
    <div class="border-t border-gray-600 pt-4">
        <h3 class="mb-3 flex items-center text-lg font-semibold text-white">
            💸 Взаиморасчеты
        </h3>
        <div class="space-y-2">
            <div
                v-for="settlement in settlements"
                :key="`${settlement.from}-${settlement.to}`"
                class="message-bubble border border-purple-500/20 bg-gradient-to-r from-purple-500/10 to-blue-500/10"
            >
                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center space-x-2">
                        <span class="font-medium text-white">
                            {{ settlement.from }}
                        </span>
                        <span class="text-gray-400">→</span>
                        <span class="font-medium text-white">
                            {{ settlement.to }}
                        </span>
                    </div>
                    <div class="font-semibold text-green-400">
                        {{ settlement.amount.toFixed(2) }} ₽
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Settlement } from '../../stores/expenseStore'

interface Props {
    settlements: Settlement[]
}

defineProps<Props>()
</script>
