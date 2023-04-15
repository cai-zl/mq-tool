<!--
    @author cai zl
    @since 2023/4/14 13:41
-->
<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {ElScrollbar as ElScrollbarType} from "element-plus/es/components/scrollbar";
import {socket} from "../api/socket";
import {ElMessage} from "element-plus";
import {ConsumerInfo, MqEntity, RawsReference, ServerOption} from "../api/common";
import {Message} from "../api/common";

const props = defineProps<{
    eventName: string
    topics: RawsReference<string[]>
}>()

const topics = computed<string[]>(() => {
    return props.topics.value
})

const eventName = computed<string>(() => {
    return props.eventName
})

const info = ref<MqEntity>(new MqEntity())

const consumerInfo = ref<ConsumerInfo>({
    topic: '',
    groupId: '',
    type: 1
})

const messages = ref<Array<Message>>([])
const innerRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbarType>>()

onMounted(() => {
    socket.on(ServerOption.CONSUMER_EVENT, (key: string, value: string) => {
        messages.value.push(new Message(key, value))
    });
})

watch(
    () => messages.value.length,
    () => {
        if (!Object.is(scrollbarRef, undefined)) {
            scrollbarRef.value!.setScrollTop(innerRef.value!.clientHeight)
        }
    }
)

function consumer() {
    if (consumerInfo.value.groupId === '' || consumerInfo.value.topic === '') {
        ElMessage.error('topic and group cannot be empty')
        return
    }
    if (consumerInfo.value.type === 1) {
        // 消费
        socket.emit(eventName.value, ServerOption.CONSUMER, consumerInfo.value)
        consumerInfo.value.type = 2
    } else if (consumerInfo.value.type === 2) {
        // 停止
        socket.emit(eventName.value, ServerOption.STOP_CONSUMER, {
            name: info.value.name
        })
        consumerInfo.value.type = 1
    }
}

function message(status: boolean) {
    if (status) {
        ElMessage.success('success')
    } else {
        ElMessage.success('fail')
    }
}

</script>
<template>
    <div class="consumer">
        <div>
            <el-scrollbar ref="scrollbarRef" height="500px" class="box">
                <div ref="innerRef">
                    <div v-for="(item, index) in messages" :key="item.key" id="message">
                        <h1><strong class="c-title">key:</strong>{{ item.key }}</h1>
                        <p><strong class="c-title">value:</strong>{{ item.value }}</p>
                        <el-divider/>
                    </div>
                </div>
            </el-scrollbar>
        </div>
        <div class="option">
            <el-select v-model="consumerInfo.topic" filterable placeholder="Topic" class="kafka-sel">
                <el-option v-for="item in topics"
                           :value="item">
                </el-option>
            </el-select>
            <el-input
                    class="kafka-group"
                    placeholder="Group"
                    v-model="consumerInfo.groupId"
            ></el-input>
            <el-button
                    class="kafka-but"
                    @click="consumer"
                    type="primary">
                <span v-if="consumerInfo.type==1">Start</span>
                <span v-else>Stop</span>
            </el-button>
        </div>
    </div>
</template>
<style scoped lang="scss">
.consumer {
  display: flex;
  height: 100%;
  width: 50%;
  flex: 1;
  margin: 0 1px;
  flex-direction: column;
  justify-content: space-between;
  font-weight: 700;
  text-align: left;
  color: #3c3f41;
  background-color: #ffffff;

  #message {
    word-break: break-word;
    color: #3c3f41;

    .c-title {
      font-weight: 700;
      color: #8218b6;
    }
  }

  .option {
    display: flex;
  }
}
</style>
