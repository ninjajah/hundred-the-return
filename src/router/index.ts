import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ExpenseTracker from '../views/ExpenseTracker.vue'

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
            redirect: to => {
                return { path: '/', query: { group: to.params.id } }
            },
        },
        {
            path: '/expense/:id',
            name: 'expense-tracker',
            component: ExpenseTracker,
            props: true,
        },
    ],
})

// --- AUTO MINI APP DEEP LINK HANDLER START ---
// Check Telegram Mini App start_param and auto redirect if present (only client side)
if (typeof window !== 'undefined') {
    // @ts-ignore
    const tg = window.Telegram && window.Telegram.WebApp
    // @ts-ignore
    const startParam =
        tg && tg.initDataUnsafe ? tg.initDataUnsafe.start_param : null
    if (startParam) {
        // redirect to mini app group route
        router.replace(`/expense/${startParam}`)
    }
}
// --- AUTO MINI APP DEEP LINK HANDLER END ---

export default router
