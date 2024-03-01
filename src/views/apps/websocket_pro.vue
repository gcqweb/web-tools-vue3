<template>
    <context-holder />
    <div>
      <h2>WebSocket聊天</h2>
      <div class="message_box">
        <div v-for="msg in messages" :key="msg.id">
          <!-- <p>{{ msg.text }}</p> -->
          <p>
            {{ formatDate(msg.text.time) }} {{ msg.text.user }}：{{
              msg.text.message
            }}{{ msg.text.fileData }}
          </p>
        </div>
      </div>
      <!-- 下拉选择框 -->
      <select v-model="current_nickname">
        <option v-for="item in nicknames" :key="item" :value="item">
          {{ item }}
        </option>
      </select>
      <input type="text" v-model="newMessage" @keyup.enter="sendMessage" />
      <a-button @click="sendMessage">发送</a-button>
      <a-form-item label="文件">
        <a-spin :spinning="uploading">
          <a-upload-dragger
            :file-list="fileList"
            @change="handleChange"
            :before-upload="beforeUpload"
            @remove="handleRemove"
            :multiple="true"
          >
            <p class="ant-upload-drag-icon">
              <PaperClipOutlined />
            </p>
            <p class="ant-upload-text">选择文件，单击或拖动文件到此区域</p>
          </a-upload-dragger>
          <a-button
            v-if="fileList.length > 0"
            type="primary"
            @click="handleUpload"
          >
            上传
          </a-button>
        </a-spin>
      </a-form-item>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch } from "vue";
  import { message } from "ant-design-vue";
  import { PaperClipOutlined } from "@ant-design/icons-vue";
  // import { saveAs } from 'https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js';
  
  const [messageApi, contextHolder] = message.useMessage();
  
  let messages = ref([]);
  let newMessage = ref("");
  let nicknames = ref(["小红", "小绿", "小果"]);
  let current_nickname = ref("小红");
  let ws = null;
//   ws = new WebSocket("ws://192.168.2.205:8000/ws/001/");
  const newMessageCount = ref(0);
  
  // 文件
  
  // 接收父组件传来的count
  const props = defineProps(["count"]);
  console.log(props.count);
  const emit = defineEmits(["update:addMsg"]);
  // 一个方法，用于在需要时抛出事件
  function sendAddMsg(addMsg) {
    // 抛出事件，并传递 addMsg 给父组件
    emit("update:addMsg", addMsg);
  }
  
  watch(messages.value, (newVal) => {
    // console.log(newVal);
    sendAddMsg(newMessageCount.value);
  });
  
  const sendMessage = () => {
    if (fileList.value.length > 0) {
      handleUpload();
    }
    if (newMessage.value !== "") {
      const data = {
        msgType: "text",
        text: newMessage.value,
        username: current_nickname.value, // 自定义信息
        timestamp: new Date().toISOString(), // 自定义信息
      };
      ws.send(JSON.stringify(data));
      newMessage.value = "";
    }
  };
  
  onMounted(() => {
    ws = new WebSocket("wss://api.gcqweb.cn/chat/001/");
  
    ws.addEventListener("message", (event) => {
      // console.log(JSON.parse(event.data));
      messages.value.push({
        text: JSON.parse(event.data),
        id: messages.value.length,
      });
      handleFile(JSON.parse(event.data));
      if (current_nickname.value !== JSON.parse(event.data).user) {
        newMessageCount.value = newMessageCount.value + 1;
      }
      // console.log(JSON.parse(event.data) ,current_nickname.value ,JSON.parse(event.data).user);
    });
  });
  
  onUnmounted(() => {
    ws.close();
  });
  function formatDate(isoDate) {
    const date = new Date(isoDate);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diff < 2 * 24 * 60 * 60 * 1000) {
      return (
        "昨天 " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } else {
      return (
        date.toLocaleDateString() +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  }
  const fileList = ref([]);
  // 文件
  function arrayBufferToBase64(buffer) {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
  
  const handleChange = (info) => {
    // console.log(info);
    const status = info.file.status;
    if (status !== "uploading") {
      messageApi.success(`等待上传`);
    }
    if (status === "done") {
      // handleUpload();
      messageApi.success(`${info.file.name} 文件已提交！`);
    } else if (status === "error") {
      messageApi.error(`${info.file.name} 文件提交错误！`);
    }
  };
  const uploading = ref(false);
  const handleRemove = (file) => {
    const index = fileList.value.indexOf(file);
    const newFileList = fileList.value.slice();
    newFileList.splice(index, 1);
    fileList.value = newFileList;
  };
  const beforeUpload = (file) => {
    fileList.value = [...(fileList.value || []), file];
    console.log(fileList.value);
    return false;
  };
  const handleUpload = async () => {
    uploading.value = true;
    try {
      // 获取所有选中的文件
      const files = fileList.value;
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = function (event) {
          const binaryData = event.target.result;
          // 将ArrayBuffer转换为Base64编码的字符串
          const base64Data = arrayBufferToBase64(binaryData);
          // 创建一个包含文件数据和额外参数的对象
          const data = {
            msgType: "file",
            text: file.name,
            username: current_nickname.value, // 发消息人的信息
            timestamp: new Date().toISOString(), // 时间戳
            fileBase64Data: base64Data,
            fileName: file.name,
            fileLastModified: file.lastModified,
            fileSize: file.size,
            fileType: file.type,
            // 你可以添加更多的参数
          };
          // 将对象转换为JSON字符串
          const jsonData = JSON.stringify(data);
          // 发送JSON字符串
          // console.log("发送JSON字符串",jsonData);
          ws.send(jsonData);
        };
        reader.readAsArrayBuffer(file);
      });
      messageApi.success("已发送");
      // // 下载文件的代码
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", file_name.value); // 'file.pdf' 是你想要保存的文件名
      // document.body.appendChild(link);
      // messageApi.success(`处理完成，等待下载...`);
      // link.click();
      uploading.value = false;
      fileList.value = [];
    } catch (error) {
      uploading.value = false;
      messageApi.error(`服务器拒绝请求⚡`);
      console.error(error);
    }
  };
  
  const handleFile = (Data) => {
    const { fileData, fileName, fileType } = Data;
    console.log(typeof Data, Data, fileName, fileType);
    if (!fileData || !fileName || !fileType) {
      return;
    }
    // 将Base64字符串转换为Blob对象
    const blob = base64ToBlob(fileData, fileType);
    // 创建一个指向Blob的URL
    const fileURL = URL.createObjectURL(blob);
  
    // console.log(fileURL, "fileURL", fileName, "fileName");
    function isMediaFile(type) {
      // 判断文件是否是浏览器能够直接打开的媒体文件
      const mediaTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "video/mp4",
        "audio/mpeg",
      ];
      return mediaTypes.includes(type);
    }
    function createMediaElement(type, urlurl) {
      let mediaElement = null;
  
      if (type.startsWith("image/")) {
        mediaElement = document.createElement("img");
        mediaElement.src = urlurl;
      } else if (type.startsWith("video/")) {
        mediaElement = document.createElement("video");
        mediaElement.src = urlurl;
        mediaElement.controls = true;
      } else if (type.startsWith("audio/")) {
        mediaElement = document.createElement("audio");
        mediaElement.src = urlurl;
        mediaElement.controls = true;
      }
  
      return mediaElement;
    }
    if (fileType && isMediaFile(fileType)) {
      // 添加到Dom
      const createElement = createMediaElement(fileType, fileURL);
      // 获取Dom根据class=message_box
      const messageBox = document.querySelector(".message_box");
      if (messageBox) {
        messageBox.appendChild(createElement);
        // 设置样式
        // createElement.style.width = '100%'
        createElement.style.height = "100px";
      }
      // document.body.appendChild(createElement);
      return;
    }
    // 尝试使用window.open打开文件，如果不行则下载
    if (!window.open(fileURL)) {
      // 创建一个a元素用于下载文件
      const downloadLink = document.createElement("a");
      downloadLink.download = fileName;
      downloadLink.href = fileURL;
      document.body.appendChild(downloadLink);
      console.log(fileName, "fileName");
      downloadLink.click();
      // document.body.removeChild(downloadLink);
      // 释放创建的URL对象，避免内存泄漏
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(fileURL);
      }, 100);
    }
  };
  
  // 辅助函数：将Base64编码的字符串转换为Blob对象
  function base64ToBlob(base64, type) {
    // 移除Base64数据URI方案的前缀（如果存在）
    const base64WithoutPrefix = base64.replace(/^data:.*;base64,/, "");
  
    // 检查字符串是否只包含Base64允许的字符
    if (!/^[A-Za-z0-9+/=]+$/.test(base64WithoutPrefix)) {
      throw new Error("无效的Base64字符串！");
    }
  
    try {
      const binaryString = window.atob(base64WithoutPrefix);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return new Blob([bytes.buffer], { type });
    } catch (e) {
      // 处理解码错误
      console.error("将Base64字符串转换为Blob时出错:", e);
      throw e;
    }
  }
  </script>
  