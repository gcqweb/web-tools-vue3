<template>
  <!-- <div id="app"> -->
    <context-holder />
  <div class="main">
    <section class="settings">
      <a-upload :before-upload="handleUpload" :show-upload-list="false">
        <a-button>上传照片</a-button>
      </a-upload>
      <a-button @click="handleAI">
         AI抠图</a-button
      >
      <div class="color-picker">
        <div>
          <input type="color" v-model="currentGradient.color" />
          <!-- 单选框线性/镜像渐变/纯色 -->
          <div class="flex">
            <div v-for="(option, index) in gradientOptions" :key="index">
              <input
                type="radio"
                :id="option"
                :value="option"
                v-model="currentGradient.type"
                @click="currentGradient.type = option"
              />
              <label :for="option">{{ option }}</label>
            </div>
          </div>
          <p :style="{ backgroundColor: currentGradient.color }">
            Selected option: {{ currentGradient.color }}
          </p>
        </div>
        <div>
          <input type="color" v-model="backgroundColor" />
          <button
            class="color-btn"
            v-for="color in colors"
            :key="color"
            :style="{ backgroundColor: color }"
            @click="backgroundColor = color"
          >
            <!-- {{ color }} -->
          </button>
        </div>
      </div>
      <div class="size">
        <div class="size_text">
          尺寸
          <!-- <select v-model="selectedSize" @change="sizeChange">
          <option :value="size.value" v-for="size in sizes" :key="size.value">
            {{ size.label }}
          </option>
        </select> -->

          <div v-for="option in sizes" :key="option.value">
            <input
              v-if="option.label != '自定义'"
              type="radio"
              :id="option.value"
              :value="option.value"
              v-model="selectedSize"
              @input="sizeChange"
            />
            <div v-else="option.label === '自定义'">
              <input
                type="radio"
                :id="option.value"
                :value="option.value"
                v-model="selectedSize"
                @input="sizeChange"
              />
              <span @click="selectedSize = 8;">
                {{ option.label }}
              </span>
              <span v-if="selectedSize === 8">
                <!-- <a-input v-model:value="coustom_width" placeholder="Basic usage" /> -->
                <a-input-number :min="32" :max="2000"
                  v-model:value="coustom_width"
                  class="coustom_width"
                  @blur="resizeHandle"
                />
                <a-input-number :min="32" :max="2000"
                  v-model:value="coustom_height"
                  class="coustom_height"
                  @blur="resizeHandle"
                />
              </span>
            </div>
            <label :for="option.value">{{
              option.label != "自定义" ? option.label : ""
            }}</label>
          </div>

          <!-- <p>Selected option: {{ selectedSize}}</p> -->
        </div>
      </div>
      <a-button @click="toggleClass">边框</a-button>
      <a-button @click="saveCanvasAsImage">保存</a-button>
    </section>
    <section class="edit">
      <div
        class="parent"
        ref="parent"
        :style="{
          height: canvas_display.height + 'px',
          width: canvas_display.width + 'px',
        }"
      >
        <DraggableContainer :adsorbParent="true">
          <Vue3DraggableResizable
            ref="editable"
            :initW="300"
            :initH="400"
            v-model:x="rect_drag.x"
            v-model:y="rect_drag.y"
            v-model:w="rect_drag.width"
            v-model:h="rect_drag.height"
            v-model:active="active"
            :draggable="true"
            :resizable="true"
            :lockAspectRatio="true"
            @activated="clearCanvas"
            @drag-start="clearCanvas"
            @drag-end="resizingHandle"
            @resize-start="clearCanvas"
            @resize-end="resizingHandle"
            class="dragged_box"
          >
            <img class="photo" ref="photo" :src="photoSrc" />
          </Vue3DraggableResizable>
          <canvas
            ref="canvas"
            class="photo_edit"
            :style="{
              height: canvas_display.height + 'px',
              width: canvas_display.width + 'px',
              backgroundColor: backgroundColor,
            }"
          ></canvas>
        </DraggableContainer>
      </div>
    </section>
    <!-- 渐变背景 -->
    <!-- <div class="gradient">
      <div
        class="gradient_bg"
        :style="{
          width: canvas_display.width + 'px',
          height: canvas_display.height + 'px',
          background: `linear-gradient(135deg, rgba(255, 255, 255,1) 0%, rgba(0,0,255,1) 100%)`,
          /* background: `linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(0,255,255,1) 0%)` */
        }"
      ></div>
    </div> -->

    <!-- </div> -->
  </div>
</template>

<script setup>
// npm install vue3-draggable-resizable
import { ref, watchEffect, onMounted, watch, reactive, computed } from "vue";
import Vue3DraggableResizable from "vue3-draggable-resizable";
import { DraggableContainer } from "vue3-draggable-resizable";
//default styles
import "vue3-draggable-resizable/dist/Vue3DraggableResizable.css";
// import png from "./12.png";
import png from "./result.png";
import { message } from "ant-design-vue";
const [messageApi, contextHolder] = message.useMessage();
const used=ref(1);
const canvas = ref(null);
const photo = ref(null);
const parent = ref(null);
const editable = ref(null);
const photoSrc = ref(null); // 图片路径
const base64String = ref(null);
photoSrc.value = base64String.value || png;
const canvas_display = reactive({ width: 300, height: 400 });
const rect_drag = reactive({ x: 0, y: 0, width: 300, height: 400 });
const rect_canvas = reactive({ x: 0, y: 0, width: 300, height: 400 });
const rect_img = reactive({ x: 0, y: 0, width: 300, height: 400 });
const canvas_img = reactive({ x: 0, y: 0, width: 300, height: 400 });

let colors = [
  "#ffffff",
  "#eeeeee",
  "#ec3636",
  "#F3C76C",
  "#ffee66",
  "#3CA082",
  "#00a2ff",
  "#bb55dd",
];
// #d43935 //红色
const currentGradient = ref({ color: "#ffffff", type: "纯色" });
const gradientOptions = ref(["纯色", "线性渐变", "径向渐变"]);
// const coustom_size = reactive({width: 2000, height: 2000});
const coustom_width = ref(2000);
const coustom_height = ref(2000);
const selectedSize = ref(0);
const sizes = computed(() => [
  {
    label: `原图（${photo.value?.naturalWidth}*${photo.value?.naturalHeight}）`,
    width: photo.value?.naturalWidth || 0,
    height: photo.value?.naturalHeight || 0,
    value: 0,
  },
  { label: "一寸（295*413）", width: 295, height: 413, value: 1 },
  { label: "二寸（413*579）", width: 413, height: 579, value: 2 },
  { label: "大一寸（390*567）", width: 390, height: 567, value: 3 },
  { label: "大二寸（413*626）", width: 413, height: 626, value: 4 },
  { label: "小一寸（360*378）", width: 360, height: 378, value: 5 },
  { label: "小二寸（413*531）", width: 413, height: 531, value: 6 },
  { label: "身份证大头照（260*390）", width: 260, height: 390, value: 7 },
  // { label: "自定义",width: coustom_size.width, height: coustom_size.height, value: 8 },
  {
    label: "自定义",
    width: coustom_width.value,
    height: coustom_height.value,
    value: 8,
  },
]);
const backgroundColor = ref(colors[2]); // 初始背景颜色
const init_main = () => {
  if (sizes.value[0].label === "原图") {
    sizes.value[0].width = photo.value.naturalWidth;
    sizes.value[0].height = photo.value.naturalHeight;
    document.querySelector(".vdr-container").classList.add("drag");
  }
  // 初始化canvas图片绘制尺寸
  canvas_img.width = photo.value.naturalWidth;
  canvas_img.height = photo.value.naturalHeight;
  // 初始化canvas显示css高度
  canvas_display.width =
    canvas_display.height / (canvas_img.height / canvas_img.width);
  canvas_display.height = 400;
  // 初始化dom图片尺寸
  rect_img.width = canvas_display.width || photo.value.naturalWidth;
  rect_img.height =
    canvas_display.width /
      (photo.value.naturalWidth / photo.value.naturalHeight) ||
    photo.value.naturalHeight;
  // 初始化拖拽的高度
  // rect_drag.height = rect_drag.width / (rect_img.width / rect_img.height);
  rect_drag.width = canvas_display.width;
  rect_drag.height =
    canvas_display.width /
    (photo.value.naturalWidth / photo.value.naturalHeight);
  // 初始化cancas，根据尺寸或者图片的像素
  rect_canvas.width = canvas_img.width;
  rect_canvas.height = canvas_img.height;
};
const updata_canvas_before = () => {
  resizingHandle();
};

const resizeHandle = () => {
  if (selectedSize.value === 8) {
    // 获取输入框中的宽和高
    // coustom_width.value = Number(
    //   document.querySelector(".coustom_width").value
    // );
    // coustom_height.value = Number(
    //   document.querySelector(".coustom_height").value
    // );
    // console.log(coustom_width.value / coustom_height.value);

    if (
      coustom_width.value <= 0 ||
      coustom_height.value <= 0 ||
      !(
        0.5 < coustom_width.value / coustom_height.value &&
        coustom_width.value / coustom_height.value < 3
      )
    ) {
      messageApi.error("宽高不能为0，或错误宽高比");
      // alert("请输入正确的宽高");
      coustom_width.value = coustom_width.value ? coustom_width.value : 2000;
      coustom_height.value = coustom_height.value ? coustom_height.value : 2000;
      return;
    }
    canvas_display.height = 400;
    canvas_display.width = coustom_width.value / (coustom_height.value / 400);
    rect_canvas.width = coustom_width.value;
    rect_canvas.height = coustom_height.value;
    rect_drag.width = canvas_display.width;
    rect_drag.height =
      canvas_display.width /
      (photo.value.naturalWidth / photo.value.naturalHeight);
    // console.log(123);
  }
};
onMounted(() => {
  resizingHandle();
  init_main();
  // drawCanvas();

  // // 监听图片位置变化
  watch(
    [backgroundColor, rect_canvas, rect_img, selectedSize, currentGradient],
    () => {
      drawCanvas();
      updata_canvas_before();
    },
    { deep: true }
  );
  // 图片加载完成后，重新绘制 Canvas
  photo.value.onload = () => {
    init_main();
    drawCanvas();
    init_main();
  };
});
const getCurrentGradient = (ctx) => {
  // 设置背景颜色
  if (currentGradient.value.type === "纯色") {
    return backgroundColor.value;
  } else {
    if (currentGradient.value.type === "线性渐变") {
      // 线性渐变
      var gradient = ctx.createLinearGradient(
        0,
        canvas.value.width * 1.5,
        0,
        0
      ); // 从左到右的线性渐变
    }
    if (currentGradient.value.type === "径向渐变") {
      // 创建径向渐变
      var gradient = ctx.createRadialGradient(
        canvas.value.width / 2,
        canvas.value.height / 2,
        0,
        canvas.value.width / 2,
        canvas.value.height / 2,
        canvas.value.width
      );
    }
    gradient.addColorStop(0, currentGradient.value.color); // 中间白色
    gradient.addColorStop(1, backgroundColor.value); // 外边蓝色
    return gradient;
  }
};
// watch(backgroundColor, (newColor) => {
//   // 自动换背景渐变色
//   if (currentGradient.value.color === "#ffffff") {
//     // 调用获取浅色的方法
//     currentGradient.value.color = lightenHexColor(newColor, 0.8);
//   }
// });
function lightenHexColor(hex, brightness = 0.8) {
  // 获取此颜色的亮一些趋向于白色的颜色
  // 检查输入的16进制颜色值是否有效
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    messageApi.error("无效的十六进制颜色格式");
    throw new Error("无效的十六进制颜色格式");
  }

  // 如果是简写形式的颜色值，将其转换为完整形式
  if (hex.length === 4) {
    hex = "#" + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  // 提取RGB分量
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // 根据亮度值计算新的RGB分量
  const newR = Math.min(255, Math.floor(r + (255 - r) * brightness));
  const newG = Math.min(255, Math.floor(g + (255 - g) * brightness));
  const newB = Math.min(255, Math.floor(b + (255 - b) * brightness));
  // 将新的RGB分量转换为16进制字符串
  const result =
    "#" +
    newR.toString(16).padStart(2, "0") +
    newG.toString(16).padStart(2, "0") +
    newB.toString(16).padStart(2, "0");
  return result;
}

const drawCanvas = () => {
  if (!photo.value?.complete) return; // 确保图片已加载
  const ctx = canvas.value.getContext("2d");
  canvas.value.width = rect_canvas.width;
  canvas.value.height = rect_canvas.height;

  // 设置填充样式并填充画布
  // ctx.fillStyle = backgroundColor.value;
  ctx.fillStyle = getCurrentGradient(ctx);
  ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  // 绘制图片
  // console.log(rect_img);

  if (photo.value.complete) {
    ctx.drawImage(
      photo.value,
      canvas_img.x,
      canvas_img.y,
      canvas_img.width,
      canvas_img.height
    );
  }
  photo.value.style.display = "none";
};
function handleUpload(file) {
  let reader = new FileReader();
  reader.onload = (e) => {
    base64String.value = e.target.result;
    photoSrc.value = e.target.result;
    photo.value.onload(); // 确保图片加载后调用drawCanvas
  };
  reader.readAsDataURL(file);
  return false;
}
function beforeUpload() {
  let base64Str = base64String.value;
  // 判断图片大小是否超过5M
  const fileSizeInBytes = new Blob([base64Str]).size;
  const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
  if (!base64Str) { 
    messageApi.error("未选择图片"); 
    // alert("未选择图片"); 
    return};
  if (fileSizeInMB >= 5) {
    messageApi.error("图片大小不能超过5M")
    // alert("图片大小不能超过5M");
    console.log("图片大小不能超过5M");
    return;
  }

  // 判断图片分辨率是否大于2000px
  const image = new Image();
  image.src = base64Str;
  image.onload = () => {
    const width = image.width;
    const height = image.height;
    if (width >= 2000 || height >= 2000) {
      messageApi.error("图片分辨率不能大于2000px")
      // alert("图片分辨率不能大于2000px");
      console.log("图片分辨率不能大于2000px");
      return;
    }
  };
  return true;
}
async function handleAI() {
  // beforeUpload()
  // console.log(beforeUpload());
  if (!beforeUpload()||!confirm(`AI抠图，将图片上传至服务器，是否上传？\n注：服务器免费次数有限\n本月剩余总数约：${used.value}次`)) {
    // messageApi.warning("取消上传");
    console.log("取消上传");
    return;
  }
  // return
  let uploadUrl = "https://api.gcqweb.cn/IDPhoto/";
  // 创建一个新的FormData实例
  const formData = new FormData();
  formData.append("密码", "123456");
  formData.append("文件", base64String.value);
  try {
    messageApi.success("正在上传，请等待AI处理结果...");
    console.log("开始上传图片至服务器");
    // 使用fetch发送POST请求
    const response = await fetch(uploadUrl, {
      method: "POST", // or 'PUT'
      body: formData,
    });
    // 解析响应为JSON
    const data = await response.json();
    photoSrc.value = "data:image/png;base64," + data["photo_base64"];
    used.value = data["used-id"][1]-data["used-id"][0];
    return;
    // 在这里处理数据，例如将其保存到变量中
    console.log(data);
    // photoSrc.value = data;
  } catch (error) {
    messageApi.error("服务器响应异常！");
    console.error("Error:", error);
  }
}
const sizeChange = () => {
  watch(selectedSize, (newValue, oldValue) => {
    document.querySelector(".vdr-container").classList.add("drag");
    // var myDiv = document.querySelector(".vdr-container"); // 替换 'yourDivId' 为实际的 div ID
    // // 获取 div 中的所有 p 元素
    // var paragraphs = myDiv.getElementsByTagName("div");
    // console.log(paragraphs);
    // // 为每个 p 元素添加内联样式 display: block;
    // for (var i = 0; i < paragraphs.length; i++) {
    //   paragraphs[i].style.display = "block";
    // }
    document.querySelector(".vdr-handle").style.display = "block";
    let currentWidth = sizes.value[selectedSize.value].width;
    let currentHeight = sizes.value[selectedSize.value].height;
    let currentSelected = sizes.value[selectedSize.value].label;
    // console.log(currentWidth);
    if (!currentSelected || currentSelected === "原图") {
      currentWidth = photo.value.naturalWidth;
      currentHeight = photo.value.naturalHeight;
    }
    rect_canvas.width = currentWidth;
    rect_canvas.height = currentHeight;
    if (currentHeight && currentHeight != 400) {
      canvas_display.height = 400;
      canvas_display.width = currentWidth / (currentHeight / 400);
      rect_img.width = canvas_display.width;
      rect_img.height =
        canvas_display.width /
        (photo.value.naturalWidth / photo.value.naturalHeight);
      rect_drag.width = canvas_display.width;
      rect_drag.height =
        canvas_display.width /
        (photo.value.naturalWidth / photo.value.naturalHeight);
    }
    canvas_img.x = rect_drag.x * (rect_canvas.width / rect_drag.width);
    canvas_img.y =
      rect_drag.y /
      (canvas_display.height / sizes.value[selectedSize.value]?.height);
    canvas_img.width =
      rect_drag.width * (canvas.value.width / canvas_display.width);
    canvas_img.height =
      rect_drag.height * (canvas.value.height / canvas_display.height);
  });
};
const draggingHandle = () => {
  rect_img.width =
    rect_drag.width * (canvas.value.width / canvas_display.width);
  rect_img.height =
    rect_drag.height * (canvas.value.height / canvas_display.height);
  rect_img.x =
    rect_drag.x /
    (canvas_display.width / sizes.value[selectedSize.value]?.width);
  rect_img.y =
    rect_drag.y /
    (canvas_display.height / sizes.value[selectedSize.value]?.height);
};
const ing = () => {};
const resizingHandle = () => {
  photo.value.style.display = "block";
  // clearCanvas();
  rect_img.width = rect_drag.width;
  rect_img.height = rect_drag.height;
  rect_img.x = rect_drag.x * (photo.value.naturalHeight / rect_drag.height);
  rect_img.y = rect_drag.y * (photo.value.naturalHeight / rect_drag.height);

  canvas_img.x =
    rect_drag.x /
    (canvas_display.width / sizes.value[selectedSize.value]?.width);
  canvas_img.y =
    rect_drag.y /
    (canvas_display.height / sizes.value[selectedSize.value]?.height);
  canvas_img.width =
    rect_drag.width * (canvas.value.width / canvas_display.width);
  canvas_img.height =
    rect_drag.height * (canvas.value.height / canvas_display.height);
  // console.log(rect_canvas,rect_img);
  drawCanvas();
};
function toggleClass() {
  document.querySelector(".vdr-container").classList.toggle("drag");
}
const clearCanvas = () => {
  photo.value.style.display = "block";
  document.querySelector(".vdr-container").classList.remove("drag");

  // 清空画布中的ctx.drawImage
  if (canvas.value.getContext) {
    const ctx = canvas.value.getContext("2d");
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    // 清空画布中的ctx.drawImage
    // const ctx = canvas.value.getContext("2d");
    canvas.value.width = rect_canvas.width;
    canvas.value.height = rect_canvas.height;

    // 设置背景颜色
    // ctx.fillStyle = backgroundColor.value;
    ctx.fillStyle = getCurrentGradient(ctx);
    ctx.fillRect(0, 0, canvas.value.width, canvas.value.height);
  }
  // photo.value.style.display = "block";
};

// 保存 Canvas 为图片
const saveCanvasAsImage = () => {
  const link = document.createElement("a");
  link.download = "canvas_image.png";
  link.href = canvas.value.toDataURL("image/png");
  link.click();
};

// ==============================
const active = ref(false);

function print(val) {
  console.log(val);
}
</script>
<style>
.main {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  position: relative;
  /* border: 1px solid #000; */
  user-select: none;
  /* background: -webkit-linear-gradient(top, transparent 19px, #e7e7e7 20px), -webkit-linear-gradient(left, transparent 19px, #e7e7e7 20px);
    background-size: 20px 20px; */
  background: linear-gradient(
      125.84deg,
      rgba(255, 232, 227, 0.5),
      rgba(255, 244, 236, 0.295) 12.8%,
      hsla(0, 0%, 100%, 0.396137) 34.17%,
      hsla(0, 0%, 100%, 0.0747951) 75.81%,
      rgba(211, 255, 247, 0.085) 87.48%,
      rgba(201, 235, 255, 0.5) 117.01%,
      rgba(201, 235, 255, 0.5) 0
    ),
    #f8f9f9;
}
.setting {
  max-width: 500px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* border: 1px solid #000; */
  user-select: none;
}
.parent {
  width: 300px;
  height: 400px;
  /* position: absolute; */
  top: 100px;
  left: 100px;
  /* border: 1px solid #000; */
  user-select: none;
}
.parent img {
  width: 100%;
  /* opacity: 0.7; */
  /* max-height: 200px; */
  /* position: absolute; */
  /* display: none; */
  /* top: 0;
  left: 0; */
  /* z-index: 100; */
  user-select: none;
}
.size {
  display: flex;
  justify-content: center;
  align-items: center;
}
.size_text {
  text-align: start;
  position: relative;
  z-index: 1;
}
.edit {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  /* border: 1px solid #000; */
  user-select: none;
}
.drag {
  border: 1px solid #000000;
}
.dragged_box {
  z-index: 0;
}
.color-btn {
  width: 40px;
  height: 40px;
  border-radius: 0;
  margin: 0 5px;
  cursor: pointer;
  /* border: 1px solid #33aaee; */
  background-color: #fff;
  box-shadow: 0px 2px 9px -7px #000000;
  transition: all 0.3s;
  /* &:hover{
  } */
}
.flex {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
