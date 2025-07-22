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
    from: string
    to: string
    amount: number
}

export const useExpenseStore = defineStore('expenseStore', () => {
    const currentUser = ref<ExpenseParticipant | null>(null)
    const currentExpenseGroupId = ref<string | null>(null)
    const expenses = ref<ExpenseItem[]>([])
    const participants = ref<ExpenseParticipant[]>([])
    const expenseSummary = ref<ExpenseSummary[]>([])
    const isLoading = ref(false)

    let participantsSubscription: RealtimeChannel | null = null
    let expensesSubscription: RealtimeChannel | null = null

    async function createExpenseGroup(title: string): Promise<string | null> {
        isLoading.value = true
        try {
            const { data, error } = await supabase
                .from('expense_groups')
                .insert({ title, is_active: true })
                .select()
                .single()

            if (error) {
                console.error('Ошибка создания группы расходов:', error)
                return null
            }
            return data.id
        } catch (error) {
            console.error(
                'Неожиданная ошибка при создании группы расходов:',
                error
            )
            return null
        } finally {
            isLoading.value = false
        }
    }

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

    async function joinExpenseGroup(
        groupId: string,
        userName: string
    ): Promise<{
        success: boolean
        error?: 'GROUP_NOT_FOUND' | 'NAME_TAKEN' | 'UNKNOWN'
    }> {
        isLoading.value = true
        try {
            if (!(await expenseGroupExists(groupId))) {
                return { success: false, error: 'GROUP_NOT_FOUND' }
            }

            const { data: existingUser } = await supabase
                .from('participants')
                .select('id')
                .eq('expense_group_id', groupId)
                .eq('name', userName)
                .single()

            if (existingUser) {
                return { success: false, error: 'NAME_TAKEN' }
            }

            const sessionId =             const sessionId = crypto.randomUUID()

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

            currentUser.value = {
                id: participant.id,
                name: participant.name,
                expense_group_id: participant.expense_group_id,
                session_id: participant.session_id,
                joined_at: new Date(participant.joined_at),
            }
            currentExpenseGroupId.value = groupId

            sessionStorage.setItem(
                'expense_session',
                JSON.stringify({
                    userId: participant.id,
                    groupId,
                    sessionId,
                    userName,
                })
            )

            await subscribeToUpdates(groupI            await subscribeToUpdates(groupId)

            await loadExpenseData(groupId)

            return { success: true }
        } catch (error) {
            console.error('Ошибка присоединения к группе:', error)
            return { success: false, error: 'UNKNOWN' }
        } finally {
            isLoading.value = false
        }
    }

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

            await new Promise(resolve => setTimeout(resolve, 100))
            await new Promise(resolve => setTimeout(resolve, 100))

            await loadExpenses(currentExpenseGroupId.value)
            await loadExpenseSummary(currentExpenseGroupId.value)

            return true
        } catch (error) {
            console.error('Ошибка добавления расхода:', error)
            return false
        }
    }

    async function deleteExpense(expenseId: string): Promise<boolean> {
        if (!currentUser.value || !currentExpenseGroupId.value) return false

        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', expenseId)
                .eq('participant_name', currentUser.value.name)

            if (error) throw error

            await new Promise(resolve => setTimeout(resolve, 100))
            await new Promise(resolve => setTimeout(resolve, 100))

            await loadExpenses(currentExpenseGroupId.value)
            await loadExpenseSummary(currentExpenseGroupId.value)

            return true
        } catch (error) {
            console.error('Ошибка удаления расхода:', error)
            return false
        }
    }

    async function subscribeToUpdates(gr    async function subscribeToUpdates(groupId: string) {
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

    async function loadExpenseData(groupId: string) {
        await Promise.all([
            loadParticipants(groupId),
            loadExpenses(groupId),
            loadExpenseSummary(groupId),
        ])
    }

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

    async function restoreSession(): Promise<boolean> {
        try {
            const sessionData = sessionStorage.getItem('expense_session')
            if (!sessionData) return false

            const session = JSON.parse(sessionData)

            if (!(await expenseGroupExists(session.groupId))) {
                sessionStorage.removeItem('expense_session')
                return false
            }

            const { data: participant } = await supabase
                .from('participants')
                .select('*')
                .eq('id', session.userId)
                .single()

            if (!participant) {
                sessionStorage.removeItem('expense_session')
                return false
            }

            currentUser.value = {
                id: participant.id,
                name: participant.name,
                expense_group_id: participant.expense_group_id,
                session_id: participant.session_id,
                joined_at: new Date(participant.joined_at),
            }
            currentExpenseGroupId.value = session.groupId

            await subscribeToUpdates(session.groupId)
            await loadExpenseData(session.groupId)

            return true
        } catch (error) {
            console.error('Ошибка восстановления сессии:', error)
            sessionStorage.removeItem('expense_session')
            return false
        }
    }

    function clearSession() {
        sessionStorage.removeItem('expense_session')
        unsubscribeFromUpdates()
        currentUser.value = null
        currentExpenseGroupId.value = null
        participants.value = []
        expenses.value = []
        expenseSummary.value = []
    }

    function calculateSettlements(summary: ExpenseSummary[]): Settlement[] {
        const settlements: Settlement[] = []

        const debtors = summary
            .filter(s => s.balance < 0)
            .map(s => ({
                name: s.participant_name,
                amount: Math.abs(s.balance),
            }))
            .sort((a, b) => b.amount - a.amount)

        const creditors = summary
            .filter(s => s.balance > 0)
            .map(s => ({
                name: s.participant_name,
                amount: s.balance,
            }))
            .sort((a, b) => b.amount - a.amount)

        const debtorsCopy = [...debtors]
        const creditorsCopy = [...creditors]

        while (debtorsCopy.length > 0 && creditorsCopy.length > 0) {
            const debtor = debtorsCopy[0]
            const creditor = creditorsCopy[0]

            const transferAmount = Math.m            const transferAmount = Math.min(debtor.amount, creditor.amount)

            settlements.push({
                from: debtor.name,
                to: creditor.name,
                amount: Math.round(transferAmount * 100) / 100,
            })
            })

            debtor.amount -= transferAmount
            creditor.amount -= transferAmount

            if (debtor.amount < 0.01) {
                debtorsCopy.shift()
            }
            if (creditor.amount < 0.01) {
                creditorsCopy.shift()
            }
        }

        return settlements
    }

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
        currentUser,
        currentExpenseGroupId,
        expenses,
        participants,
        expenseSummary,
        isLoading,

        createExpenseGroup,
        expenseGroupExists,
        joinExpenseGroup,
        addExpense,
        deleteExpense,
        restoreSession,
        clearSession,

        getExpenseGroupUrl,
        isUserInExpenseGroup,
        calculateSettlements,
    }
})
