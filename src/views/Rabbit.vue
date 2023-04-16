<!--
    @author cai zl
    @since 2023/4/14 12:54
-->
<script setup lang="ts">

import ManageEnvironment from "../components/ManageEnvironment.vue";
import Producer from "../components/Producer.vue";
import Consumer from "../components/Consumer.vue";
import {ref} from "vue";
import {MqEntity, RawsReference} from "../api/common";


const topics = ref<RawsReference<string[]>>(new RawsReference<string[]>([]))
const event = ref("rabbit")
const env = ref(new RawsReference(new MqEntity()))
</script>
<template>
    <div class="mq-box">
        <ManageEnvironment :event-name="event"
                           :topics="topics"
                           :current-env="env"
                           has-password
                           has-username/>
        <div class="mq-option">
            <Producer :textarea-row="20"/>
            <Consumer :event-name="event"
                      :topics="topics"
                      c-type="input"/>
        </div>
    </div>
</template>
<style scoped lang="scss">

</style>
