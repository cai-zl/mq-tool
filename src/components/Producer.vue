<!--
    @author cai zl
    @since 2023/4/14 13:31
-->
<script setup lang="ts">
import {socket} from "../api/socket";
import {ElMessage} from "element-plus";
import {ProducerInfo, ServerOption} from "../api/common";
import {ref} from "vue";

defineProps<{
    textareaRow?: number
}>()

const producerInfo = ref<ProducerInfo>({
    topic: '',
    key: '',
    value: ''
})

function producer() {
    if (producerInfo.value.topic === '') {
        ElMessage.error('topic cannot be empty')
        return
    }
    // 生产
    socket.emit("kafka", ServerOption.PRODUCER, producerInfo.value)
}

</script>
<template>
    <div class="producer">
        <div>
            <el-input class="key" v-model="producerInfo.key"
                      placeholder="key" clearable/>
            <el-input class="value" v-model="producerInfo!.value"
                      type="textarea"
                      :rows="textareaRow"
                      placeholder="value" clearable/>
        </div>

        <div class="option">
            <el-input class="key" v-model="producerInfo.topic"
                      placeholder="Topic" clearable/>
            <el-button
                    class="kafka-in"
                    @click="producer"
                    type="primary">
                Send
            </el-button>
        </div>
    </div>
</template>
<style scoped lang="scss">
.producer {
  display: flex;
  height: 100%;
  width: 50%;
  flex: 1;
  margin: 0 1px;
  flex-direction: column;
  justify-content: space-between;
  color: #3c3f41;

  .option {
    display: flex;
  }
}
</style>
