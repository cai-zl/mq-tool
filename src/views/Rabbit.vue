<!--
    @author cai zl
    @since 2023/4/14 12:54
-->
<script setup lang="ts">

import ManageEnvironment from "../components/ManageEnvironment.vue";
import Producer from "../components/Producer.vue";
import Consumer from "../components/Consumer.vue";
</script>
<template>
    <div class="mq-box">
        <ManageEnvironment event-name="rabbit"/>
        <div class="mq-option">
            <Producer :textarea-row="20"/>
            <Consumer/>
        </div>
    </div>
</template>
<style scoped lang="scss">

</style>
