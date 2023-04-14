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
        <ManageEnvironment event="rabbit"/>
        <div class="mq-option">
            <Producer :textarea-row="20"/>
            <Consumer/>
        </div>
    </div>
</template>
<style scoped lang="scss">
.mq-box {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  align-items: center;
  font-family: "Microsoft Sans Serif", serif;

  .mq-option {
    display: flex;
    width: 100%;
    height: 80%;
    justify-content: space-between;
    align-items: stretch;
  }

}
</style>
