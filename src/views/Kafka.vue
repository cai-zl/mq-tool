<!--
    @author cai zl
    @since 2023/3/12 10:20
-->
<script setup lang="ts">
import {onMounted, reactive, ref, watch} from "vue";
import {ElScrollbar as ElScrollbarType} from "element-plus/es/components/scrollbar";
import {socket} from "../api/socket";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {ConsumerInfo, ModelOption, ProducerInfo, REGEX_IP, ServerOption} from "../api/common";
import {KafkaEntity} from "../api/kafka";
import {Message} from "../api/common";

const info = ref<KafkaEntity>(new KafkaEntity())

const consumerInfo = ref<ConsumerInfo>({
    topic: '',
    groupId: '',
    type: 1
})
const producerInfo = ref<ProducerInfo>({
    topic: '',
    key: '',
    value: ''
})

const messages = ref<Array<Message>>([])
const innerRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbarType>>()
const ruleFormRef = ref<FormInstance>();
const drawer = ref(false)
const innerDrawer = ref(false)
const formInfo = ref<KafkaEntity>(new KafkaEntity())
const record = ref<KafkaEntity[]>([])
const rules = reactive<FormRules>({
    name: [
        {required: true, message: 'Please input Environment name', trigger: 'blur'},
    ],
    host: [
        {
            required: true,
            message: 'Please input valid Environment host',
            trigger: 'blur',
            pattern: REGEX_IP
        },
    ],
    port: [
        {
            required: true,
            message: 'Please input valid Environment port',
            trigger: 'blur',
            min: 1,
            max: 5
        },
    ],
})

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

watch(
    () => drawer.value,
    (value, oldValue, onCleanup) => {
        if (!value) {
            innerDrawer.value = false
        }
    }
)

function initHistory() {
    socket.emit("kafka", ModelOption.LIST, ServerOption.PLACEHOLDER, (response: KafkaEntity[]) => {
        record.value = response
    })
}

initHistory()

function define(entity: KafkaEntity) {
    info.value = entity
    socket.emit("kafka", ServerOption.CONNECT, info.value, (response: string[]) => {
        info.value.topics = response
    })
}

function consumer() {
    if (consumerInfo.value.groupId === '' || consumerInfo.value.topic === '') {
        ElMessage.error('topic and group cannot be empty')
        return
    }
    if (consumerInfo.value.type === 1) {
        // 消费
        socket.emit("kafka", ServerOption.CONSUMER, consumerInfo.value)
        consumerInfo.value.type = 2
    } else if (consumerInfo.value.type === 2) {
        // 停止
        socket.emit("kafka", ServerOption.STOP_CONSUMER, {
            name: info.value.name
        })
        consumerInfo.value.type = 1
    }
}

function producer() {
    if (producerInfo.value.topic === '') {
        ElMessage.error('topic cannot be empty')
        return
    }
    // 生产
    socket.emit("kafka", ServerOption.PRODUCER, producerInfo.value)
}

function confirmClick() {
    drawer.value = false
}

function handleEdit(index: number, row: KafkaEntity) {
    innerDrawer.value = true
    formInfo.value = row
}

function handleDelete(index: number, row: KafkaEntity) {
    socket.emit("kafka", ModelOption.DELETE, row, (res: boolean) => {
        if (res) {
            initHistory()
        }
        message(res)
    })
}

function handleClose(done: () => void) {
    done()
}

function successAfter() {
    // 查询环境列表
    initHistory()
    // 清空表单
    formInfo.value = new KafkaEntity()
    // 关闭窗口
    innerDrawer.value = false
}

function message(status: boolean) {
    if (status) {
        ElMessage.success('success')
    } else {
        ElMessage.success('fail')
    }
}

function onSubmit() {
    ruleFormRef.value?.validate((valid, fields) => {
        if (valid) {
            if (!Object.is(formInfo.value.id, undefined)) {
                socket.emit("kafka", ModelOption.UPDATE, formInfo.value, (res: boolean) => {
                    successAfter()
                    message(res)
                })
            } else {
                socket.emit("kafka", ModelOption.SAVE, formInfo.value, (res: boolean) => {
                    successAfter()
                    message(res)
                })
            }
        } else {
            ElMessage.error('Please input valid data')
        }
    })

}

</script>
<template>

    <el-drawer v-model="drawer" direction="ttb" size="50%">
        <template #default>
            <div>
                <el-drawer
                        direction="ttb"
                        v-model="innerDrawer"
                        title="Add Environment"
                        :append-to-body="true"
                        :before-close="handleClose">
                    <el-form
                            ref="ruleFormRef"
                            :inline="true"
                            :model="formInfo"
                            :rules="rules"
                            class="demo-form-inline">
                        <el-form-item label="Name" prop="name">
                            <el-input v-model="formInfo.name" placeholder="Name"/>
                        </el-form-item>
                        <el-form-item label="Host" prop="host">
                            <el-input v-model="formInfo.host" placeholder="Host"/>
                        </el-form-item>
                        <el-form-item label="Port" prop="port">
                            <el-input v-model="formInfo.port" placeholder="Port"/>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSubmit">Submit</el-button>
                        </el-form-item>
                    </el-form>
                </el-drawer>
            </div>
            <el-table :data="record">
                <el-table-column prop="name" label="Name"/>
                <el-table-column prop="host" label="Host"/>
                <el-table-column prop="port" label="Port"/>
                <el-table-column align="right" fixed="right" width="200">
                    <template #header>
                        <el-button type="primary" size="small" @click="innerDrawer = true">Add</el-button>
                    </template>
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
                        >Edit
                        </el-button>
                        <el-button
                                size="small"
                                type="danger"
                                @click="handleDelete(scope.$index, scope.row)"
                        >Delete
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </template>
        <template #footer>
            <div style="flex: auto">
                <el-button type="primary" @click="confirmClick">Finish</el-button>
            </div>
        </template>
    </el-drawer>
    <div class="main-box">
        <!-- kafka服务地址 -->
        <div id="info">
            <el-button type="primary" @click="drawer = true">
                Manage Environment
            </el-button>
            <el-select v-model="info"
                       class="m-2"
                       placeholder="Environment"
                       value-key="id"
                       @change="define">
                <el-option
                        v-for="item in record!"
                        :key="item.id!"
                        :label="item.name!"
                        :value="item"
                />
            </el-select>
        </div>
        <!-- kafka对话框 -->
        <div id="dialog">
            <div id="producer">
                <div>
                    <el-input class="key" v-model="producerInfo.key"
                              placeholder="key" clearable/>
                    <el-input class="value" v-model="producerInfo.value"
                              type="textarea"
                              :rows="20"
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

            <div id="consumer">
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
                        <el-option v-for="item in info.topics"
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
        </div>
    </div>
</template>

<style scoped lang="scss">
* {
  margin: 0;
  font-size: 16px;
}

input {
  text-decoration: none;
  border: none;
  background-color: rgba(255, 255, 255, .0);
}

.main-box {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  text-align: center;
  align-items: center;
  font-family: "Microsoft Sans Serif", serif;

  #info {
    display: flex;
    width: 100%;
    flex-direction: column;
    justify-content: stretch;
    align-items: center;

    > div {
      display: flex;
      font-weight: 700;
      justify-content: space-between;
      align-items: center;
    }

  }

  #dialog {
    display: flex;
    width: 100%;
    height: 80%;
    justify-content: space-between;
    align-items: stretch;

    > div {
      display: flex;
      height: 100%;
      width: 50%;
      flex: 1;
      margin: 0 1px;
      flex-direction: column;
      justify-content: space-between;
    }

    #producer {
      color: #3c3f41;
    }

    #consumer {
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
    }

    .option {
      display: flex;
    }

  }
}

</style>
