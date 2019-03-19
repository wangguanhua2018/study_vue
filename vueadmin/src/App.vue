<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
<script>
    export default {
        name: 'app',
        data() {
            return {
            }
        },
        created() {
            let username = sessionStorage.getItem('ms_username');
            let token = sessionStorage.getItem('ms_user_token');
            if (!username || !token) {
                this.$router.push('/login');
            }
        }


    }

</script>
<style>
    @import "../static/css/main.css";
    @import "../static/css/color-dark.css";     /*深色主题*/
    /*@import "../static/css/theme-green/color-green.css";   浅绿色主题*/
</style>
