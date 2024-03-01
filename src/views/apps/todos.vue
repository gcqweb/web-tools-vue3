<script setup>
// import { RouterLink } from 'vue-router'
import { ref, onMounted, watch, watchEffect, computed } from 'vue'
import { message } from 'ant-design-vue';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons-vue';
// import { useFocus } from '@vueuse/core'
const todos = ref([])
const todoInfo = ref('')
const checkAll = ref(false)
const isDisabled = ref(false)
const showCount = ref([0, 0, 0])
if (localStorage.getItem('todo')) {
    todos.value = JSON.parse(localStorage.getItem('todo'));
}

const changeTodo = (id) => {
    todos.value.forEach(item => {
        if (item.id === id) {
            item.done = !item.done
        }
    })
    //判断所有item.done为true时checkAll.value=true
    checkAll.value = todos.value.every(item => item.done) && todos.value.length > 0
    isDisabled.value = !todos.value.length
    showCount.value[0] = todos.value.length
    showCount.value[1] = todos.value.length - todos.value?.filter(todo => todo.done).length
    showCount.value[2] = todos.value?.filter(todo => todo.done).length
}

const addTodo = () => {
    if (!todoInfo.value.trim() || todos.value.some(item => item.text === todoInfo.value)) return message.info('error，不能为空或已存在！')
    // todos.value.push({ id: Date.now(), text: todoInfo.value, done: false })
    todos.value = [{ id: Date.now(), text: todoInfo.value.trim(), done: false, edit: false }, ...todos.value];
    todoInfo.value = ''
    message.success('添加成功！')
}

const save_todos = () => {
    localStorage.setItem('todo', JSON.stringify(todos.value));
}

const delTodo = (id) => {
    // const isConfirmed = window.confirm('确定要删除此待办事项吗？');
    // 如果用户点击了确定按钮，则执行删除操作
    // if (isConfirmed) {
    todos.value = todos.value.filter(item => item.id !== id);
    message.success('已删除');
    // }
}

const clearTodo = () => {
    let someDone = todos.value.some(item => item.done);
    if (someDone) {
        // if (window.confirm('清空已办事项吗？')) {
        todos.value = todos.value.filter(item => !item.done);
        message.success({
            content: '已清空',
            style: { marginTop: '10vh', }
        });
        // }
    }
}

const selectAll = () => {
    let allDone = todos.value.every(item => item.done);
    if (allDone) checkAll.value = true
    todos.value.forEach(item => item.done = !allDone);
}

const keyEnter = (id) => {
    if (id) {
        todos.value.forEach(item => {
            if (item.id === id) item.edit = false
        })
    }
    // addTodo()
}

const dblcilckhandel = (id) => {
    todos.value.forEach(item => {
        item.edit = false
        if (item.id === id) item.edit = true
    })
}
const keyEsc = (id) => todos.value.forEach(item => item.edit = false)

const vFocus = { mounted: (el) => el.focus() }

// onMounted(() => changeTodo())

watch([todos, changeTodo], () => save_todos(), { deep: true });
watchEffect(() => changeTodo());
const filter = ref('全部')
const filteredTodos = computed(() => {
    if (filter.value === '已完成') {
        return todos.value.filter(todo => todo.done)
    } else if (filter.value === '未完成') {
        return todos.value.filter(todo => !todo.done)
    } else {
        return todos.value
    }
})
const handleFilterClick = (value) => {
    if (value === '已完成') {
        const doneTodos = todos.value.filter(todo => todo.done)
        if (doneTodos.length === 0) {
            message.info('空白！');
            return
        }
    } else if (value === '未完成') {
        const undoneTodos = todos.value.filter(todo => !todo.done)
        if (undoneTodos.length === 0) {
            message.info({
                content: '空白！',
                style: { marginTop: '10vh', }
            });
            return
        }
    }
    filter.value = value
}

</script>

<template>
    <!-- <a-space> -->
    <a-card title="待办事项" size="small">
        <section class="todo-main">
            <div class="todo-info">
                <div class="todo-add">
                    <a-input-search v-model:value="todoInfo" placeholder="添加待办事项" autofocus @search="addTodo" allowClear
                        showCount @click.stop>
                        <template #enterButton>
                            <a-button>添加</a-button>
                        </template>
                    </a-input-search>
                    <!-- <a-input v-model:value="todoInfo" placeholder="添加待办事项" @keyup.enter="keyEnter" autofocus /> -->
                    <!-- <input type="text" v-model="todoInfo" @keyup.enter="keyEnter" autofocus style="flex: 1;"> -->
                    <!-- <a-button htmlType="submit" @click="addTodo">添加</a-button> -->
                </div>
                <!-- <div v-if="filteredTodos.length === 0">请先添加条目</div>
                <div v-else> -->
                <div class="filter-todo">
                    <a-tag @click="handleFilterClick('全部')">全部 ({{ showCount[0] }})</a-tag>
                    <a-tag color="success" @click="handleFilterClick('已完成')">
                        <template #icon><check-circle-outlined /></template>
                        已完成 ({{ showCount[2] }})
                    </a-tag>
                    <a-tag color="warning" @click="handleFilterClick('未完成')">
                        <template #icon><clock-circle-outlined /></template>
                        未完成 ({{ showCount[1] }})
                    </a-tag>
                </div>


                <ul>


                    <li v-for="todo in filteredTodos" :key="todo.id" class="todo-list">

                        <a-checkbox v-model:checked="todo.done" id="todo-select" @click="changeTodo(todo.id)">
                            <!-- {{ todo.done ? '已完成' : "未完成" }} -->
                        </a-checkbox>
                        <!-- <input type="checkbox" name="" @click="changeTodo(todo.id)" :checked="todo.done"> -->
                        <!-- <div class="todo-done" for="todo-select">{{ todo.done ? '完成' : "未完成" }}</div> -->
                        <div @dblclick="() => dblcilckhandel(todo.id)" class="todo-text" :class="{ isDone: todo.done }"
                            @keyup.enter="keyEnter(todo.id)">
                            <div v-if="!todo.edit" class="">
                                <a-tooltip color="green">
                                    <template #title>{{ todo.text }}</template>
                                    {{ todo.text }}
                                </a-tooltip>
                                <!-- {{ todo.text }} -->
                            </div>
                            <a-input v-model:value="todo.text" v-else v-focus @keyup.esc="keyEsc(todo.id)" />
                            <!-- <input v-model="todo.text" v-focus @keyup.esc="keyEsc(todo.id)" class="editTodo" v-else="todo.edit"
                            @keyup.enter="keyEnter(todo.id)"> -->
                        </div>
                        <!-- <a-popconfirm title="确定删除此条目？" ok-text="确定" cancel-text="取消" @confirm="delTodo(todo.id)">
                            <a-button>删除</a-button>
                        </a-popconfirm> -->
                        <a-popover placement="right" title="立即删除此条目？" trigger="hover">
                            <template #content>
                                <a-button danger size="small" @click="delTodo(todo.id)">确定删除</a-button>
                            </template>
                            <a-button>删除</a-button>
                        </a-popover>
                    </li>
                </ul>
            </div>
            <!-- </div> -->
            <div class="edit-todo">
                <!-- <input type="checkbox" @click="selectAll" :checked="checkAll">
            <label for="">全选</label> -->
                <a-checkbox v-model:checked="checkAll" @click="selectAll">全选</a-checkbox>
                <!-- <a-button :disabled="isDisabled" @click="clearTodo">清除已完成</a-button> -->
                <a-popconfirm :title="`确定清空${showCount[2]}个条目？`" @confirm="clearTodo">
                    <a-badge :count="showCount[2]">
                        <a-button :disabled="isDisabled">清空已办</a-button>
                        <!-- <a-avatar shape="square" size="large" /> -->
                    </a-badge>
                </a-popconfirm>

            </div>

        </section>

    </a-card>

    <!-- </a-space> -->
    <!-- <a-button>Primary</a-button> -->
</template>

<style scoped>
.filter-todo>* {
    cursor: pointer;
}

.ant-card {
    width: 50%;
    margin: 0 auto;
}

.isDone {
    text-decoration: line-through;
    text-decoration-color: #ff000080;
    /* 设置删除线的颜色为红色 */
    text-decoration-thickness: 2px;
    /* 设置删除线的粗细为2像素 */
}

.todo-list,
.edit-todo,
.todo-add {
    margin: .5rem 8px;
    display: flex;
    align-items: center;

}

.todo-main {
    padding: 1rem;
    width: 500px;
    max-width: 700px;
    margin: 0 auto;
}


.todo-text {
    /* min-width: 10rem; */
    margin-left: 8px;
    flex: 1;
}
</style>
