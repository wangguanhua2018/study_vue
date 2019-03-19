import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children:[
                {
                    path: '/dashboard',
                    component: resolve => require(['../components/page/Dashboard.vue'], resolve),
                    meta: { title: '系统首页' }
                },
                {
                    // 权限页面
                    path: '/item',
                    component: resolve => require(['../components/page/Item.vue'], resolve),
                    meta: { title: '节点管理'}
                },
                {
                    // 角色页面
                    path: '/user',
                    component: resolve => require(['../components/page/User.vue'], resolve),
                    meta: { title: '用户管理'}
                },
                {
                    // 文章管理
                    path: '/article',
                    component: resolve => require(['../components/page/Article.vue'], resolve),
                    meta: { title: '文章管理'}
                },
                {
                    // 发布文章
                    path: '/content',
                    component: resolve => require(['../components/page/Content.vue'], resolve),
                    meta: { title: '发布文章'}
                },
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
        {
            path: '/404',
            component: resolve => require(['../components/page/404.vue'], resolve)
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
})
