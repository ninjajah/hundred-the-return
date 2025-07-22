<template>
    <div>
        <h2 class="mb-6 text-2xl font-semibold text-white">Потрачено</h2>
        <form @submit.prevent="onSubmit" class="mb-6 space-y-3">
            <!-- Amount Field -->
            <input
                v-model.number="amount"
                type="number"
                step="0.01"
                placeholder="Сумма (₽)"
                class="input-field w-full"
                required
            />

            <!-- Description Field -->
            <textarea
                v-model="description"
                placeholder="За что"
                rows="3"
                class="input-field w-full resize-none"
                required
            ></textarea>

            <!-- Submit Button -->
            <button
                type="submit"
                class="btn-primary input-field w-full px-4 py-2"
                :disabled="isSubmitting"
            >
                <span v-if="isSubmitting">⏳ Добавление...</span>
                <span v-else>💰</span>
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Emits {
    (e: 'addExpense', data: { description: string; amount: number }): void
}

const emit = defineEmits<Emits>()

defineProps<{
    isSubmitting?: boolean
}>()

const description = ref('')
const amount = ref(0)

function onSubmit() {
    if (description.value.trim() && amount.value > 0) {
        emit('addExpense', {
            description: description.value.trim(),
            amount: amount.value,
        })

        description.value = ''
        amount.value = 0
    }
}
</script>
