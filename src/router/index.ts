import {createRouter, createWebHistory} from 'vue-router'

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/kafka',
            name: 'Kafka',
            component: () => import('../views/Kafka.vue')
        },
        {
            path: '/rabbit',
            name: 'Rabbit',
            component: () => import('../views/Rabbit.vue')
        },
    ]
})
