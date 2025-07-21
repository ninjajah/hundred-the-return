import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import JoinExpense from '../views/JoinExpense.vue'
import ExpenseTracker from '../views/ExpenseTracker.vue'
import { useExpenseStore } from '../stores/expenseStore'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: Home,
        },
        {
            path: '/join/:id',
            name: 'join-expense',
            component: JoinExpense,
            props: true,
            beforeEnter: async (to, from, next) => {
                const store = useExpenseStore()
                const groupId = to.params.id as string
                
                // Try to restore session first
                await store.restoreSession()
                
                // Check if user is already in this expense group
                if (store.isUserInExpenseGroup(groupId)) {
                    next(`/expense/${groupId}`)
                } else {
                    next()
                }
            }
        },
        {
            path: '/expense/:id',
            name: 'expense-tracker',
            component: ExpenseTracker,
            props: true,
        },
    ],
})

export default router
