<!--
    @author cai zl
    @since 2023/4/14 13:03
-->
<script setup lang="ts">

import {onMounted, reactive, Ref, ref, watch} from "vue";
import {ElScrollbar as ElScrollbarType} from "element-plus/es/components/scrollbar";
import {socket} from "../api/socket";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {ModelOption, REGEX_IP, ServerOption} from "../api/common";
import {MqEntity, Message} from "../api/common"

const props = defineProps<{
    eventName: string
}>()

const topics = ref<string[]>()

const messages = ref<Array<Message>>([])
const innerRef = ref<HTMLDivElement>()
const scrollbarRef = ref<InstanceType<typeof ElScrollbarType>>()
const ruleFormRef = ref<FormInstance>();
const drawer = ref(false)
const innerDrawer = ref(false)
const formInfo = ref<MqEntity>(new MqEntity())
const record = ref<MqEntity[]>([])
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
    socket.emit(props.eventName, ModelOption.LIST, ServerOption.PLACEHOLDER, (response: MqEntity[]) => {
        record.value = response
    })
}

initHistory()

function define(entity: MqEntity) {
    socket.emit(props.eventName, ServerOption.CONNECT, entity, (response: string[]) => {
        topics.value = response
    })
}

function confirmClick() {
    drawer.value = false
}

function handleEdit(index: number, row: MqEntity) {
    innerDrawer.value = true
    formInfo.value = row
}

function handleDelete(index: number, row: MqEntity) {
    socket.emit(props.eventName, ModelOption.DELETE, row, (res: boolean) => {
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
    formInfo.value = new MqEntity()
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
                socket.emit(props.eventName, ModelOption.UPDATE, formInfo.value, (res: boolean) => {
                    successAfter()
                    message(res)
                })
            } else {
                socket.emit(props.eventName, ModelOption.SAVE, formInfo.value, (res: boolean) => {
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
    <div class="manage-box">
        <el-button type="primary" @click="drawer = true">
            Manage Environment
        </el-button>
        <el-select class="m-2"
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
</template>
<style scoped lang="scss">

.manage-box {
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
</style>
