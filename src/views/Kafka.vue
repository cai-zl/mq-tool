<!--
    @author cai zl
    @since 2023/3/12 10:20
-->
<script setup lang="ts">
import Producer from "../components/Producer.vue";
import ManageEnvironment from "../components/ManageEnvironment.vue";
import Consumer from "../components/Consumer.vue";
import {ref} from "vue";
import {MqEntity, RawsReference} from "../api/common";

const topics = ref<RawsReference<string[]>>(new RawsReference<string[]>([]))
const event = ref("kafka")
const env = ref(new RawsReference(new MqEntity()))

</script>
<template>
    <div class="mq-box">
        <ManageEnvironment :event-name="event"
                           :topics="topics"
                           :current-env="env"/>
        <div class="mq-option">
            <Producer :textarea-row="20"/>
            <Consumer :event-name="event"
                      :topics="topics"/>
        </div>
    </div>
</template>

<style scoped lang="scss">

</style>
