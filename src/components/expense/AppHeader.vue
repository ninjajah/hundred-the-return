<template>
    <div class="relative mb-8 text-center">
        <h1 class="mb-2 text-4xl font-bold text-white">
            <span v-if="currentUser">
                Верни сотку,
                <span class="text-purple-300">{{ currentUser.name }}</span>
            </span>
            <span v-else>Верни сотку</span>
        </h1>
        <button
            v-if="showShareButton"
            @click="onShareClick"
            class="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
            :class="{ 'text-green-400': isLinkCopied }"
            title="Копировать ссылку на страницу"
        >
            <span v-if="isLinkCopied">✓ Скопировано</span>
            <span v-else>🔗 Поделиться</span>
        </button>
    </div>
</template>

<script setup lang="ts">
import type { ExpenseParticipant } from '@/stores/expenseStore.ts'

interface Props {
    currentUser?: ExpenseParticipant | null
    showShareButton?: boolean
    isLinkCopied?: boolean
}

interface Emits {
    (e: 'share'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

function onShareClick() {
    emit('share')
}
</script>
