<template>
  <context-holder />
  <a-upload
    :before-upload="beforeUpload"
    @change="handleUpload"
    :showUploadList="false"
  >
    <a-button> 选择图片 </a-button>
  </a-upload>
  <a-divider orientation="left">图片压缩/格式转换</a-divider>
  <a-space>
    <div
      class="setting-item"
      style="display: flex; justify-content: space-between; align-items: center"
    >
      <div class="canvas-container">
        <canvas ref="canvasRef" id="canvas" style="height: 200px"></canvas>
      </div>
      <!-- <a-divider type="vertical" style="height: 300px" /> -->
      <a-card>
        <!-- 下拉选择框v-if="previewUrl" -->
        <!-- <a-slider v-model:value="imgPercentage" :tooltip-open="true" /> -->
        <!-- 两个输入框对应图片宽和高-->
        <div style="display: flex; flex-direction: column; width: 300px">
          <a-tabs @change="handleTabsChange">
            <a-tab-pane key="1" tab="倍数缩小" force-render>
              <a-radio-group
                v-model:value="currentScale"
                @change="handleScaleChange"
              >
                <a-radio
                  v-for="item in Scale"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.value }}
                </a-radio>
              </a-radio-group>

              <!-- <a-select
              ref="select"
              v-model:value="currentScale"
              style="width: 120px"
              :options="Scale"
              @change="handleScaleChange"
            ></a-select> -->
            </a-tab-pane>
            <a-tab-pane key="2" tab="百分比">
              <a-row :gutter="8">
                <a-col :span="12">
                  <a-slider
                    v-model:value="imgPercentage"
                    :min="0.01"
                    :max="1"
                    :step="0.01"
                    :tip-formatter="formatter"
                  >
                  </a-slider>
                </a-col>
                <a-col :span="4">
                  <a-input-number
                    v-model:value="imgPercentage"
                    :min="0.01"
                    :max="1"
                    :step="0.01"
                    style="margin-left: 16px"
                  />
                </a-col>
              </a-row>
            </a-tab-pane>
          </a-tabs>
          <div v-if="currentTab === '1'">
            <a-row :gutter="8">
              <a-col :span="12">
                <label>当前宽度:</label>
                <a-input
                  type="number"
                  id="widthInput"
                  v-model:value="imgWidth"
                  @blur="handleInputBlur"
                />
              </a-col>
              <a-col :span="12">
                <label>当前高度:</label>
                <a-input
                  type="number"
                  id="heightInput"
                  @blur="handleInputBlur"
                  v-model:value="imgHeight"
                />
              </a-col>
            </a-row>
          </div>
          <div v-if="currentTab === '2'">
            <a-tag>{{ Scale[0]?.width }} * {{ Scale[0]?.height }}</a-tag
            >->
            <a-tag color="green"
              >{{ imgWidth_def }} * {{ imgHeight_def }}</a-tag
            >
          </div>
          <!-- <a-input v-if="currentTab==='2'"
            type="number"
            id="heightInput"
            @blur="handleInputBlur"
            v-model:value="imgHeight_def"
          /> -->
          <!-- 图片格式选择 -->
          <a-space size="8">
            <div v-if="image">
              <label for="formatSelect">图片格式:</label>
              <a-select
                id="formatSelect"
                :options="formatOptions"
                @change="formatChange"
                v-model:value="format"
              >
              </a-select>

              <a-button @click="loadImage">预览</a-button>
              <a-button id="download" @click="download">下载</a-button>
            </div></a-space
          >
        </div>
      </a-card>
    </div>
  </a-space>
  <!-- base64----img--- -->
  <a-divider orientation="left">base64 = img</a-divider>
  <a-space>
    <a-button @click="base642img()">Base64转换图片</a-button>
    <a-button @click="img2base64()">图片转换base64</a-button>
  </a-space>
  <div class="base642img flex">
    <a-textarea
      style="max-width: 50%"
      :rows="10"
      :cols="30"
      v-model:value="base64String"
      placeholder="输入要转换的base64字符串"
      allow-clear
    />
    <div v-if="previewUrl">
      <img style="max-width: 300px" :src="previewUrl" />
    </div>
  </div>
</template>
<style>
html,
body {
  margin: 0;
  padding: 0;
  /* height: auto !important; */
}

.flex {
  display: flex;
  gap: 1rem;
}
.canvas-container {
  background-color: antiquewhite;
}
.ant-card-body {
  padding: 1rem;
}
</style>
<script setup>
import { ref, computed } from "vue";
import { message } from "ant-design-vue";
const [messageApi, contextHolder] = message.useMessage();
const formatOptions = [
  { label: "JPG", value: "jpg" },
  { label: "JPEG", value: "jpeg" },
  { label: "WEBP", value: "webp" },
  { label: "PNG", value: "png" },
  { label: "GIF", value: "gif" },
];
const format = ref("JPEG");
const imgWidth = ref(200);
const imgHeight = ref(200);
// const file = ref(null);
const imgPercentage = ref(1);

const currentScale = ref("原图");
const Scale = ref([
  { num: 1, width: 1200, height: 1200, value: "原图" },
  { num: 2, width: 600, height: 600, value: "2倍" },
  { num: 3, width: 400, height: 400, value: "3倍" },
  { num: 4, width: 300, height: 300, value: "4倍" },
  { num: 6, width: 200, height: 200, value: "6倍" },
]);
const imgWidth_def = computed(() => {
  imgWidth.value = parseInt(
    imgPercentage.value * (Scale.value[0]?.width || imgWidth.value)
  );
  return parseInt(
    imgPercentage.value * (Scale.value[0]?.width || imgWidth.value)
  );
});
const imgHeight_def = computed(() => {
  imgHeight.value = parseInt(
    imgPercentage.value * (Scale.value[0]?.height || imgHeight.value)
  );
  return parseInt(
    imgPercentage.value * (Scale.value[0]?.height || imgHeight.value)
  );
});
const currentTab = ref("1");

function handleTabsChange(activeKey) {
  console.log(typeof activeKey);
  currentTab.value = activeKey;
}
const formatter = (value) => {
  // const newWidth = Math.round(imgWidth.value * parseFloat(value));
  // const newHeight = Math.round(imgHeight.value * parseFloat(value));
  // imgWidth.value = newWidth;
  // imgHeight.value = newHeight;
  console.log(imgWidth_def, imgHeight_def.value);
  // bai.value = value;

  return `${value}倍`;
};
const fileName = ref(null);
const previewUrl = ref(null);
const base64String = ref(null);
const canvasRef = ref(null); // Canvas元素引用
const image = ref(null); // 图片引用
let uploadImage = null; // 上传的图片文件

const beforeUpload = (file) => {
  fileName.value = file.name.split(".")[0];
  // console.log(fileName.value);
  // 检查文件类型，只允许上传图片文件
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    alert("只能上传图片文件！");
    return false; // 阻止文件上传
  }
  uploadImage = file; // 保存上传的图片文件
  return true; // 允许文件上传
};

const handleUpload = () => {
  if (uploadImage) {
    // 创建Image对象并设置src为上传的图片文件的URL
    image.value = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = reader.result;
      base64String.value = reader.result;
      image.value.onload = () => {
        console.log("图片加载完成");
        imgWidth.value = image.value.width;
        imgHeight.value = image.value.height;
        Scale.value.forEach((obj) => {
          if (obj.num === 1) {
            obj.width = image.value.width;
            obj.height = image.value.height;
            obj.value = "原图：" + obj.width + " * " + obj.height;
          } else {
            // 在这里为每个对象的width和height属性赋值
            // 例如，可以根据num的值来设定不同的width和height
            obj.width = parseInt(image.value.width / obj.num);
            obj.height = parseInt(image.value.height / obj.num);
            obj.value = obj.num + "倍：" + obj.width + " * " + obj.height;
          }
        });
        // 图片加载完成后执行的操作，例如绘制到Canvas上
        loadImage();
      };
      image.value.src = e.target.result; // 设置图片的src属性为上传的图片文件的URL
    };
    reader.readAsDataURL(uploadImage); // 将文件读取为DataURL格式的数据
    return false; // 阻止上传
  }
};

const loadImage = () => {
  if (image.value && canvasRef.value) {
    const canvas = canvasRef.value;
    const ctx = canvas.getContext("2d"); // 获取Canvas的上下文对象
    if (ctx) {
      // canvas.width = imgWidth.value; // 设置Canvas的宽度为输入的宽度值
      // canvas.height = imgWidth.value; // 设置Canvas的高度为输入的高度值
      var width = imgWidth.value;
      var height = imgHeight.value;
      // 根据原始图片宽高比计算高度
      // canvas.width = 200; // 设置宽度为200px
      if (width == "" && height == "") {
        // 提示消息
        alert("请先输入图片宽高");
        width = image.width;
        height = image.height;
      } else {
        if (height == "") {
          height = (width * image.height) / image.width;
        }
        if (width == "") {
          width = (height * image.width) / image.height;
        }
      }
      canvas.width =
        currentTab.value === "1" ? imgWidth.value : imgWidth_def.value; // 设置宽度为200px
      // canvas.height = (width * img.height) / img.width;
      canvas.height =
        currentTab.value === "1" ? imgHeight.value : imgHeight_def.value;
      // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(image.value, 0, 0, canvas.width, canvas.height); // 将图片绘制到Canvas上，指定目标位置和尺寸
      message.success(`当前像素：${width} x ${height}`);
    } else {
      alert("Canvas上下文对象获取失败！");
    }
  } else {
    alert("请先选择一个图片文件并输入宽度和高度！");
  }
};
function handleScaleChange() {
  // 从事件对象中获取被选中的值
  const selectedItem = Scale.value.find(
    (item) => item.value === currentScale.value
  );
  // 将 width 和 height 分别赋值给不同的变量
  imgWidth.value = selectedItem?.width;
  imgHeight.value = selectedItem?.height;
  console.log(currentScale.value, Scale.value, imgWidth.value, imgHeight.value);
}
const formatChange = (value) => {
  console.log(value);
};

// 传入canvas.toDataURL将图片下载到本地
const download = () => {
  // 获取选择框的选择结果;
  var dataURL = canvas.toDataURL(`image/${format.value}`);
  var a = document.createElement("a");
  a.href = dataURL;
  a.download = fileName.value + "." + format.value;
  a.click();
};
// 宽和高输入框失焦后获取图片宽高;
const handleInputBlur = () => {
  let width = imgWidth.value;
  let height = imgHeight.value;
  if (width != "" || width || height != "" || height) {
    // readFile();
  }
};
const base642img = () => {
  previewUrl.value = base64String.value;
  message.success("Ok");
};
const img2base64 = () => {
  base64String.value = previewUrl.value;
  message.success("Ok");
};
</script>
