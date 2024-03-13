<template>
    <div>
      <h2>WebSocket聊天{{ msg_info.number_of_connections?`(${msg_info.number_of_connections})`:"" }}</h2>
      <div v-for="msg in messages" :key="msg.id" style="text-align: start;">
        <p>{{msg.id}}  {{msg.user}}：{{ msg.msg }} </p>
      </div>
      <!-- 下拉选择框 -->
      <select v-model="current_nickname">
        <option v-for="item in nicknames" :key="item" :value="item">
          {{ item }}
        </option>
      </select>
      <input type="text" v-model="newMessage" @keyup.enter="sendMessage" />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted,watch } from "vue";
  import {useTabsStore} from '@/stores/tabs.js';
  let tabsStore = useTabsStore()

const msgCount = tabsStore.msgCount;
// 定义一个方法来更新 msgCount 的值
function updateMsgCount(newCount) {
      tabsStore.setMsgCount(newCount);
    }

  let messages = ref([]);
  let newMessage = ref("");
  let nicknames = ref(["小红", "小绿", "小果"]);
  let current_nickname = ref("小红");
  let ws = null;
  let msg_info=ref({})
  const newMessageCount = ref(0);
// 计算属性监听器
watch(messages.value, (newVal) => {
  // console.log(newVal);
  // msgCount.value = messages.value.length;
  // 例如，将 msgCount 设置为 10
  // updateMsgCount(messages.value.length);
  updateMsgCount(newMessageCount.value);
  // console.log(msgCount);
})


  const sendMessage = () => {
    if (newMessage.value !== "") {
      const data = {
        text: newMessage.value,
        username: current_nickname.value, // 自定义信息
        timestamp: new Date().toISOString(), // 自定义信息
      };
      ws.send(JSON.stringify(data));
      newMessage.value = "";
    }
  };
  
  onMounted(() => {
    // ws = new WebSocket("wss://api.gcqweb.cn/chat/");
    ws = new WebSocket("ws://192.168.8.116:1996/chat/");
  
    ws.addEventListener("message", (event) => {
      msg_info.value=JSON.parse(event.data)
      // console.log(JSON.parse(event.data));
      // let date = new Date(msg_info.value.time)
      // let formattedDate = date.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      let date=formatDate((msg_info.value.time));
      messages.value.push({ msg: msg_info.value.message,user:msg_info.value.user, id: date });
      if (current_nickname.value !==msg_info.value.user){
      newMessageCount.value = newMessageCount.value + 1;
    }
    });
  });
  
  onUnmounted(() => {
    ws.close();
    console.log('close');
  });
  function formatDate(isoDate) {
  const date = new Date(isoDate);
  const now = new Date(); 
  const diff = now.getTime() - date.getTime();
  if(diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  } else if(diff < 2 * 24 * 60 * 60 * 1000) {
    return '昨天 ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}); 
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  }
}
  </script>
  