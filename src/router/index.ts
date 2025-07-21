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
                // Перенаправляем на главную страницу с параметром группы
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

export default router
