<template>
    <div class="glass rounded-2xl p-8 text-center">
        <div v-if="isLoading" class="flex flex-col items-center space-y-4">
            <div
                class="h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"
            ></div>
            <p class="text-xl text-white">Идет загрузка...</p>
        </div>
        <p v-else class="text-xl text-white">
            Пожалуйста, сначала присоединитесь к группе расходов.
        </p>
    </div>
</template>

<script setup lang="ts">
interface Props {
    isLoading?: boolean
}

defineProps<Props>()
</script>
