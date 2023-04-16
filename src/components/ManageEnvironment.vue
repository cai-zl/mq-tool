<!--
    @author cai zl
    @since 2023/4/14 13:03
-->
<script setup lang="ts">

import {computed, reactive, ref, watch} from "vue";
import {socket} from "../api/socket";
import {ElMessage, FormInstance, FormRules} from "element-plus";
import {ModelOption, RawsReference, REGEX_IP, ServerOption} from "../api/common";
import {MqEntity} from "../api/common"

const props = defineProps<{
    eventName: string
    topics: RawsReference<string[]>
    currentEnv: RawsReference<MqEntity>
    hasUsername: boolean
    hasPassword: boolean
}>()

const hasUsername = computed<boolean>(() => {
    return props.hasUsername
})

const hasPassword = computed<boolean>(() => {
    return props.hasPassword
})

const formSize = computed<'small' | 'default'>(() => {
    if (hasPassword || hasUsername) {
        return 'small'
    } else {
        return 'default'
    }
})

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
const currentEnv = computed<MqEntity>({
    get: () => {
        return props.currentEnv.value
    },
    set: (value) => {
        props.currentEnv.value = value
    }
})

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
        props.topics.value = response
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
    formInfo.value = new MqEntity()
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
                            :model="formInfo"
                            :inline="true"
                            :rules="rules"
                            :size="formSize"
                    >
                        <el-form-item label="Name" prop="name">
                            <el-input v-model="formInfo.name" placeholder="Name"/>
                        </el-form-item>
                        <el-form-item label="Host" prop="host">
                            <el-input v-model="formInfo.host" placeholder="Host"/>
                        </el-form-item>
                        <el-form-item label="Port" prop="port">
                            <el-input v-model="formInfo.port" placeholder="Port"/>
                        </el-form-item>
                        <el-form-item v-if="hasUsername" label="Username" prop="username">
                            <el-input v-model="formInfo.username" placeholder="Port"/>
                        </el-form-item>
                        <el-form-item v-if="hasPassword" label="Password" prop="password">
                            <el-input v-model="formInfo.password" placeholder="Port"/>
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
                   v-model="currentEnv"
                   placeholder="Environment"
                   value-key="id"
                   @change="define">
            <el-option
                    v-for="value in record!"
                    :key="value.id!"
                    :label="value.name!"
                    :value="value"
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
