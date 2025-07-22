import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface ExpenseItem {
    id: string
    description: string
    amount: number
    participant_name: string
    expense_group_id: string
    created_at: Date
}

export interface ExpenseParticipant {
    id: string
    name: string
    expense_group_id: string
    session_id: string
    joined_at: Date
}

export interface ExpenseGroup {
    id: string
    title: string
    created_at: Date
    is_active: boolean
}

export interface ExpenseSummary {
    participant_name: string
    total_spent: number
    should_pay: number
    balance: number
}

export interface Settlement {
    from: string // Кто платит
    to: string // Кому платит
    amount: number // Сколько платит
}

export const useExpenseStore = defineStore('expenseStore', () => {
    const currentUser = ref<ExpenseParticipant | null>(null)
    const currentExpenseGroupId = ref<string | null>(null)
    const expenses = ref<ExpenseItem[]>([])
    const participants = ref<ExpenseParticipant[]>([])
    const expenseSummary = ref<ExpenseSummary[]>([])
    const isLoading = ref(false)

    // Подписки на real-time обновления
    let participantsSubscription: RealtimeChannel | null = null
    let expensesSubscription: RealtimeChannel | null = null

    // Создание новой группы расходов
    async function createExpenseGroup(title: string): Promise<string | null> {
        isLoading.value = true
        try {
            const { data, error } = await supabase
                .from('expense_groups')
                .insert({ title, is_active: true })
                .select()
                .single()

            if (error) throw error
            return data.id
        } catch (error) {
            console.error('Ошибка создания группы расходов:', error)
            return null
        } finally {
            isLoading.value = false
        }
    }

    // Проверка существования группы расходов
    async function expenseGroupExists(groupId: string): Promise<boolean> {
        try {
            const { data, error } = await supabase
                .from('expense_groups')
                .select('id, is_active')
                .eq('id', groupId)
                .eq('is_active', true)
                .single()

            return !error && data !== null
        } catch (error) {
            console.error('Ошибка проверки группы расходов:', error)
            return false
        }
    }

    // Присоединение к группе расходов
    async function joinExpenseGroup(
        groupId: string,
        userName: string
    ): Promise<{
        success: boolean
        error?: 'GROUP_NOT_FOUND' | 'NAME_TAKEN' | 'UNKNOWN'
    }> {
        isLoading.value = true
        try {
            // Проверяем существование группы
            if (!(await expenseGroupExists(groupId))) {
                return { success: false, error: 'GROUP_NOT_FOUND' }
            }

            // Проверяем уникальность имени в группе
            const { data: existingUser } = await supabase
                .from('participants')
                .select('id')
                .eq('expense_group_id', groupId)
                .eq('name', userName)
                .single()

            if (existingUser) {
                return { success: false, error: 'NAME_TAKEN' }
            }

            // Создаем сессию
            const sessionId = crypto.randomUUID()

            // Добавляем участника
            const { data: participant, error } = await supabase
                .from('participants')
                .insert({
                    expense_group_id: groupId,
                    name: userName,
                    session_id: sessionId,
                })
                .select()
                .single()

            if (error) throw error

            // Устанавливаем текущего пользователя
            currentUser.value = {
                id: participant.id,
                name: participant.name,
                expense_group_id: participant.expense_group_id,
                session_id: participant.session_id,
                joined_at: new Date(participant.joined_at),
            }
            currentExpenseGroupId.value = groupId

            // Сохраняем сессию
            sessionStorage.setItem(
                'expense_session',
                JSON.stringify({
                    userId: participant.id,
                    groupId,
                    sessionId,
                    userName,
                })
            )

            // Подписываемся на обновления
            await subscribeToUpdates(groupId)

            // Загружаем данные
            await loadExpenseData(groupId)

            return { success: true }
        } catch (error) {
            console.error('Ошибка присоединения к группе:', error)
            return { success: false, error: 'UNKNOWN' }
        } finally {
            isLoading.value = false
        }
    }

    // Добавление расхода
    async function addExpense(
        description: string,
        amount: number
    ): Promise<boolean> {
        if (!currentUser.value || !currentExpenseGroupId.value) return false

        try {
            const { error } = await supabase.from('expenses').insert({
                description,
                amount,
                participant_name: currentUser.value.name,
                expense_group_id: currentExpenseGroupId.value,
            })

            if (error) throw error

            // Небольшая задержка для обеспечения консистентности данных
            await new Promise(resolve => setTimeout(resolve, 100))

            // Принудительно обновляем данные
            await loadExpenses(currentExpenseGroupId.value)
            await loadExpenseSummary(currentExpenseGroupId.value)

            return true
        } catch (error) {
            console.error('Ошибка добавления расхода:', error)
            return false
        }
    }

    // Удаление расхода
    async function deleteExpense(expenseId: string): Promise<boolean> {
        if (!currentUser.value || !currentExpenseGroupId.value) return false

        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expenseId)
                .eq('participant_name', currentUser.value.name)

            if (error) throw error

            // Небольшая задержка для обеспечения консистентности данных
            await new Promise(resolve => setTimeout(resolve, 100))

            // Принудительно обновляем данные
            await loadExpenses(currentExpenseGroupId.value)
            await loadExpenseSummary(currentExpenseGroupId.value)

            return true
        } catch (error) {
            console.error('Ошибка удаления расхода:', error)
            return false
        }
    }

    // Подписка на real-time обновления
    async function subscribeToUpdates(groupId: string) {
        // Подписка на участников
        participantsSubscription = supabase
            .channel(`participants_${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'participants',
                    filter: `expense_group_id=eq.${groupId}`,
                },
                () => {
                    loadParticipants(groupId)
                }
            )
            .subscribe()

        // Подписка на расходы
        expensesSubscription = supabase
            .channel(`expenses_${groupId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'expenses',
                    filter: `expense_group_id=eq.${groupId}`,
                },
                () => {
                    loadExpenses(groupId)
                    loadExpenseSummary(groupId)
                }
            )
            .subscribe()
    }

    // Отписка от обновлений
    function unsubscribeFromUpdates() {
        if (participantsSubscription) {
            supabase.removeChannel(participantsSubscription)
            participantsSubscription = null
        }
        if (expensesSubscription) {
            supabase.removeChannel(expensesSubscription)
            expensesSubscription = null
        }
    }

    // Загрузка данных группы
    async function loadExpenseData(groupId: string) {
        await Promise.all([
            loadParticipants(groupId),
            loadExpenses(groupId),
            loadExpenseSummary(groupId),
        ])
    }

    // Загрузка участников
    async function loadParticipants(groupId: string) {
        try {
            const { data, error } = await supabase
                .from('participants')
                .select('*')
                .eq('expense_group_id', groupId)
                .order('joined_at', { ascending: true })

            if (error) throw error

            participants.value = data.map(p => ({
                id: p.id,
                name: p.name,
                expense_group_id: p.expense_group_id,
                session_id: p.session_id,
                joined_at: new Date(p.joined_at),
            }))
        } catch (error) {
            console.error('Ошибка загрузки участников:', error)
        }
    }

    // Загрузка расходов
    async function loadExpenses(groupId: string) {
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('expense_group_id', groupId)
                .order('created_at', { ascending: false })

            if (error) throw error

            expenses.value = data.map(e => ({
                id: e.id,
                description: e.description,
                amount: e.amount,
                participant_name: e.participant_name,
                expense_group_id: e.expense_group_id,
                created_at: new Date(e.created_at),
            }))
        } catch (error) {
            console.error('Ошибка загрузки расходов:', error)
        }
    }

    // Загрузка сводки расходов
    async function loadExpenseSummary(groupId: string) {
        try {
            const { data, error } = await supabase.rpc(
                'calculate_expense_summary',
                {
                    group_id: groupId,
                }
            )

            if (error) throw error

            expenseSummary.value = data || []
        } catch (error) {
            console.error('Ошибка загрузки сводки:', error)
        }
    }

    // Восстановление сессии
    async function restoreSession(): Promise<boolean> {
        try {
            const sessionData = sessionStorage.getItem('expense_session')
            if (!sessionData) return false

            const session = JSON.parse(sessionData)

            // Проверяем, что группа еще активна
            if (!(await expenseGroupExists(session.groupId))) {
                sessionStorage.removeItem('expense_session')
                return false
            }

            // Проверяем, что пользователь еще в группе
            const { data: participant } = await supabase
                .from('participants')
                .select('*')
                .eq('id', session.userId)
                .single()

            if (!participant) {
                sessionStorage.removeItem('expense_session')
                return false
            }

            // Восстанавливаем состояние
            currentUser.value = {
                id: participant.id,
                name: participant.name,
                expense_group_id: participant.expense_group_id,
                session_id: participant.session_id,
                joined_at: new Date(participant.joined_at),
            }
            currentExpenseGroupId.value = session.groupId

            // Подписываемся на обновления и загружаем данные
            await subscribeToUpdates(session.groupId)
            await loadExpenseData(session.groupId)

            return true
        } catch (error) {
            console.error('Ошибка восстановления сессии:', error)
            sessionStorage.removeItem('expense_session')
            return false
        }
    }

    // Очистка сессии
    function clearSession() {
        sessionStorage.removeItem('expense_session')
        unsubscribeFromUpdates()
        currentUser.value = null
        currentExpenseGroupId.value = null
        participants.value = []
        expenses.value = []
        expenseSummary.value = []
    }

    // Расчет взаиморасчетов
    function calculateSettlements(summary: ExpenseSummary[]): Settlement[] {
        const settlements: Settlement[] = []

        // Разделяем на должников и кредиторов
        const debtors = summary
            .filter(s => s.balance < 0)
            .map(s => ({
                name: s.participant_name,
                amount: Math.abs(s.balance),
            }))
            .sort((a, b) => b.amount - a.amount) // Сортируем по убыванию долга

        const creditors = summary
            .filter(s => s.balance > 0)
            .map(s => ({
                name: s.participant_name,
                amount: s.balance,
            }))
            .sort((a, b) => b.amount - a.amount) // Сортируем по убыванию кредита

        // Копируем массивы для работы
        const debtorsCopy = [...debtors]
        const creditorsCopy = [...creditors]

        // Алгоритм распределения долгов
        while (debtorsCopy.length > 0 && creditorsCopy.length > 0) {
            const debtor = debtorsCopy[0]
            const creditor = creditorsCopy[0]

            // Определяем сумму перевода
            const transferAmount = Math.min(debtor.amount, creditor.amount)

            // Создаем запись о переводе
            settlements.push({
                from: debtor.name,
                to: creditor.name,
                amount: Math.round(transferAmount * 100) / 100, // Округляем до 2 знаков
            })

            // Уменьшаем долги
            debtor.amount -= transferAmount
            creditor.amount -= transferAmount

            // Удаляем полностью рассчитанных участников
            if (debtor.amount < 0.01) {
                debtorsCopy.shift()
            }
            if (creditor.amount < 0.01) {
                creditorsCopy.shift()
            }
        }

        return settlements
    }

    // Утилиты
    function getExpenseGroupUrl(groupId: string): string {
        return `${window.location.origin}/join/${groupId}`
    }

    function isUserInExpenseGroup(groupId: string): boolean {
        return (
            currentExpenseGroupId.value === groupId &&
            currentUser.value !== null
        )
    }

    return {
        // State
        currentUser,
        currentExpenseGroupId,
        expenses,
        participants,
        expenseSummary,
        isLoading,

        // Actions
        createExpenseGroup,
        expenseGroupExists,
        joinExpenseGroup,
        addExpense,
        deleteExpense,
        restoreSession,
        clearSession,

        // Utils
        getExpenseGroupUrl,
        isUserInExpenseGroup,
        calculateSettlements,
    }
})
