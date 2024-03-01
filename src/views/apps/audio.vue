<template>
    <context-holder />

    <a-form style="max-width: 400px display:flex">
        <a-form-item label="格式" style="width: 30%">
            <a-select v-model:value="format" placeholder="格式">
                <a-select-option value="mp3">mp3</a-select-option>
                <a-select-option value="wav">wav</a-select-option>
                <a-select-option value="ogg">ogg</a-select-option>
                <a-select-option value="flac">flac</a-select-option>
            </a-select></a-form-item>
        <a-row :gutter="24">
            <a-col :span="8">
                <a-form-item label="起始时间/秒">
                    <a-input type="number" v-model:value="start_time" /> </a-form-item></a-col>
            <a-col :span="8">
                <a-form-item label="结束时间/秒">
                    <a-input type="number" v-model:value="end_time" />
                </a-form-item>
            </a-col>
            <a-col :span="8"> 当前选择约{{ 选择 }}秒 </a-col></a-row>
        <a-form-item>
            <a-flex wrap="wrap" gap="small">
                <!-- <a-row :gutter="24">
        <a-col :span="12"> -->
                <!-- <a-form-item label="淡入时长" style="width: 300px"> -->
                淡入时长<a-input type="number" v-model:value="fade_in" style="width: 30%" />
                淡出时长<a-input type="number" v-model:value="fade_out" style="width: 30%" />
                <!-- </a-form-item> -->
                <!-- </a-col>
        <a-col :span="12"> -->
                <!-- <a-form-item label="淡出时长" style="width: 300px">
            <a-input v-model:value="fade_out" />
          </a-form-item> -->
                <!-- </a-col
      ></a-row> -->
            </a-flex></a-form-item>
        <a-form-item label="文件">
            <a-spin :spinning="uploading">
                <a-upload-dragger :file-list="fileList" @change="handleChange" :before-upload="beforeUpload"
                    @remove="handleRemove">
                    <p class="ant-upload-drag-icon">
                        <PaperClipOutlined />
                    </p>
                    <p class="ant-upload-text">选择文件，单击或拖动文件到此区域</p>
                </a-upload-dragger>
            </a-spin>
        </a-form-item>
        <a-button
          v-if="fileList.length > 0"
          type="primary"
          @click="handleUpload"
        >
          上传
        </a-button>
    </a-form>
    <a-space direction="vertical" style="width: 100%">
        <a-button @click="get_poem">小憩一下~</a-button>
        <div id="poem_sentence"></div>
        <div id="poem_info"></div>
        <div id="gushici"></div>
    </a-space>
    <div ref="waveform"></div>
    <!-- <div class="timeline" id>{{ paused_time }}{{ currernt_time }}</div> -->
    <div id="minPxPerSec"></div>
    <div ref="audioContainer"></div>
    <button id="play">Play/Pause</button>
    <button id="backward">Backward 0.5s</button>
    <button id="forward">Forward 0.55s</button>
</template>
<script setup>
// import { reReadExcel } from '@/api/excel'
import { ref, watch, onMounted, computed } from "vue";
//   import http from "../api/http";
import axios from 'axios';
import { message } from "ant-design-vue";
import { PaperClipOutlined } from "@ant-design/icons-vue";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";
import ZoomPlugin from "wavesurfer.js/dist/plugins/zoom.esm.js";
import TimelinePlugin from "wavesurfer.js/dist/plugins/timeline.js";
// import Minimap from "wavesurfer.js/dist/plugins/minimap.js";
import audioSrc from "./1.wav";
//   audioSrc=undefined
const audio = new Audio();
audio.src = audioSrc;
audio.controls = true;
// 获取音频总时间
const duration = ref(0);
audio.addEventListener("loadedmetadata", () => {
    duration.value = audio.duration;
    console.log("音频总时长:", audio.duration);
});
const audioContainer = ref(null);
// 截取音频段
const start_time = ref(1.0); // 起始时间/秒
const end_time = ref(duration.value || 10);
// 已经选择的时间

const 选择 = ref(parseInt(end_time.value - start_time.value));
// 淡入淡出
const fade_in = ref(2.5);
const fade_out = ref(3);

// document.body.appendChild(audio);
const paused = ref(null);
const waveform = ref(null);
const ws = ref(null);
const wsRegions = ref(null);
// Create a second timeline
const bottomTimline = TimelinePlugin.create({
    height: 10,
    timeInterval: 0.1,
    primaryLabelInterval: 1,
    style: {
        fontSize: "8px",
        color: "#6A3274",
    },
});
// const wavesurfer=ref(null);
onMounted(() => {
    audioContainer.value.appendChild(audio);
    // Create an instance of WaveSurfer
    ws.value = WaveSurfer.create({
        container: waveform.value,
        waveColor: "rgb(200, 0, 200)",
        progressColor: "rgb(100, 0, 100)",
        dragToSeek: true,
        //   url: audioSrc,
        // media: audio,
        minPxPerSec: 25,
        // maxPxPerSec: 100,
        // hideScrollbar: true,
        // plugins: [TimelinePlugin.create()],
        plugins: [
            bottomTimline,
            //   Minimap.create({
            //     height: 20,
            //     waveColor: "#ddd",
            //     progressColor: "#999",
            //     // the Minimap takes all the same options as the WaveSurfer itself
            //   }),
        ],
    });
    ws.value.load(audioSrc);
    ws.value.on("click", () => {
        console.log("click");
        //   ws.value.play()
    });
    // Initialize the Regions plugin
    wsRegions.value = ws.value.registerPlugin(RegionsPlugin.create());

    // Initialize the Zoom plugin
    const wsZoom = ws.value.registerPlugin(
        ZoomPlugin.create({
            // 每个滚轮步进的缩放量，例如0.5，意味着每次滚动放大50%
            scale: 0.3,
            // （可选）指定缩放时每秒最大像素数因子
            maxZoom: 100,
        })
    );

    wsZoom.on("zoom", (zoom) => {
        const minPxPerSecSpan = document.querySelector("#minPxPerSec");
        minPxPerSecSpan.textContent = `${Math.round(zoom)}`;
    });

    // Give regions a random color when they are created
    const random = (min, max) => Math.random() * (max - min) + min;
    const randomColor = () =>
        `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`;
    // let  ringRegion=null;
    // let fade_inRegion=null;
    // let fade_outRegion=null;
    // Create some regions at specific time ranges
    ws.value.on("decode", () => {
        // Regions

        const ringRegion = wsRegions.value.addRegion({
            start: start_time.value,
            end: end_time.value,
            content: "铃声区域",
            color: randomColor(),
            minLength: 0,
            maxLength: duration.value,
            id: "ring",
        });

        const fade_outRegion = wsRegions.value.addRegion({
            // 淡出时长
            start: end_time.value - fade_out.value,
            end: end_time.value,
            content: "淡出",
            color: randomColor(),
            minLength: 0,
            maxLength:
                (parseFloat(end_time.value) - parseFloat(start_time.value)) / 2,
            // 禁止拖拽
            drag: false,
            id: "fade_out",
        });
        const fade_inRegion = wsRegions.value.addRegion({
            // 淡入时长
            start: start_time.value,
            end: start_time.value + fade_in.value,
            content: "淡入",
            color: randomColor(),
            minLength: 0,
            maxLength:
                (parseFloat(end_time.value) - parseFloat(start_time.value)) / 2,
            // 禁止拖拽
            drag: false,
            id: "fade_in",
        });
        // 监听区域的 'update-end' 事件
        // fade_inRegion.on("update-end", function () {
        //   // 如果区域的结束时间被增大，将其重置为初始结束时间
        //   console.log(fade_inRegion.end, "end");
        //   if (fade_inRegion.end > end_time.value) {
        //     region.update({ end: end_time.value });
        //   }
        // });
        // ringRegion.on("region-out", (region) => {
        //   console.log("region-out", region);
        //   audio.pause();
        // });
        ringRegion.on("update-end", function () {
            // Update the child region's start and end times
            fade_inRegion.setOptions({
                start: start_time.value,
                end: parseFloat(start_time.value) + parseFloat(fade_in.value),
            });
            //   console.log(
            //     start_time.value,
            //     fade_in.value,
            //     fade_inRegion.start,
            //     fade_inRegion.end
            //   );
            fade_outRegion.setOptions({
                start: end_time.value - fade_out.value,
                end: end_time.value,
            });
            //   console.log(
            //     end_time.value,
            //     fade_out.value,
            //     fade_outRegion.start,
            //     fade_outRegion.end
            //   );
        });
    });

    // wsRegions.value.enableDragSelection({
    //   color: "rgba(255, 0, 0, 0.1)",
    // });
    //   const minPxPerSecSpan = document.querySelector("#minPxPerSec");
    //   ws.value.on("zoom", (minPxPerSec) => {
    //     minPxPerSecSpan.textContent = `${Math.round(minPxPerSec)}`;
    //   });
    wsRegions.value.on("region-updated", (region) => {
        console.log("更新区域", region);
        // let updated_id = ref("");
        // for (let key in wsRegions.value.regions) {
        //   if (wsRegions.value.regions.hasOwnProperty(key)) {
        //     console.log(key); // 打印ID
        //     console.log(wsRegions.value.regions[key].id); // 打印值
        //     updated_id.value = wsRegions.value.regions[key].id;
        //   }
        // }
        if (region.id == "ring") {
            //   console.log(region.start, region.end, region.totalDuration);
            if (region.start) {
                start_time.value = region.start.toFixed(3);
                //   从第n秒开始播放音频
                audio.currentTime = region.start;
                audio.play();
                // console.log(start_time, "ss");
            }
            if (region.end) {
                end_time.value = region.end.toFixed(3);
                paused.value = region.end;
                // console.log(end_time, "ee");
            }
        }
        if (region.id == "fade_in") {
            //   console.log(region.start, region.end, region.totalDuration);
            fade_in.value = (region.end - region.start).toFixed(3);
            // 监听region-update事件，当区域被更新时触发
            // fade_inRegion.on("region-update", function (region) {
            //   region.on("resize", function (resize) {
            //     if (resize.direction === "w") {
            //       // 禁止向左拉伸
            //       resize.cancel = true; // 取消向左拉伸的默认行为
            //     }
            //   });
            // });
        }
        if (region.id == "fade_out") {
            fade_out.value = (region.end - region.start).toFixed(3);
        }
        // console.log(typeof wsRegions.value.regions, 666);
    });
    // Play a region on click
    let activeRegion = null;
    wsRegions.value.on("region-clicked", (region, e) => {
        e.stopPropagation();
        activeRegion = region;
        region.play();
    });
    ws.value.on("timeupdate", (currentTime) => {
        // When the end of the region is reached
        if (activeRegion && currentTime >= activeRegion.end) {
            // Stop playing
            ws.value.pause();
            activeRegion = null;
        }
    });
    // Loop a region on click
    //   let loop = true;
    // let loop = false;
    //   // Toggle looping with a checkbox
    //   document.querySelector('input[type="checkbox"]').onclick = (e) => {
    //     loop = e.target.checked;
    //   };

    //   let activeRegion = null;
    //   wsRegions.value.on("region-in", (region) => {
    //     console.log("region-in", region);
    //     activeRegion = region;
    //   });
    // wsRegions.value.on("region-out", (region) => {
    //   console.log("region-out", region);
    //   audio.pause();
    //   // if (activeRegion === region) {
    //   //   if (loop) {
    //   //     region.play();
    //   //   } else {
    //   //     activeRegion = null;
    //   //   }
    //   // }
    // });

    // Update the zoom level on slider change
    //   缩放
    //   ws.value.once("decode", () => {
    //     document.querySelector('input[type="range"]').oninput = (e) => {
    //       const minPxPerSec = Number(e.target.value);
    //       ws.value.zoom(minPxPerSec);
    //     };
    //   });
    const playButton = document.querySelector("#play");
    const forwardButton = document.querySelector("#forward");
    const backButton = document.querySelector("#backward");

    playButton.onclick = () => {
        ws.value.playPause();
    };

    forwardButton.onclick = () => {
        ws.value.skip(0.5);
    };

    backButton.onclick = () => {
        ws.value.skip(-0.5);
    };
});

const [messageApi, contextHolder] = message.useMessage();

const format = ref("wav");
// const start_time = ref(1000);
// const end_time = ref(15000);
// const fade_in = ref(2100);
// const fade_out = ref(3100);
const uploadUrl = "https://api.gcqweb.cn/mp3/";
// 创建响应式FormData对象
const fileList = ref([]);

watch(fileList, (newVal, oldVal) => {
    console.log(newVal);
    if (newVal.length > 0) {
        // Create a Blob URL from the file
        const url = URL.createObjectURL(newVal[newVal.length - 1]);
        wsRegions.value.clearRegions(); // 清除所有的区域
        ws.value.load(url);
        audio.src = url;
        // ws.value = WaveSurfer.setOptions({
        //   container: waveform.value,
        //   waveColor: "violet",
        //   progressColor: "purple",
        //   url: url,
        // });
    }
});
const handleChange = (info) => {
    //   return;
    const status = info.file.status;
    if (status !== "uploading") {
        messageApi.success(`读取中…`);
        // handleUpload();
        console.log(info.file, info.fileList, "file info");
    }
    if (status === "done") {
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
    return false;
};
const handleUpload = async () => {
    const formData = new FormData();
    formData.append("格式", format.value);
    formData.append("起始时间", start_time.value * 1000);
    formData.append("结束时间", end_time.value * 1000);
    formData.append("淡入时长", fade_in.value * 1000);
    formData.append("淡出时长", fade_out.value * 1000);
    fileList.value.forEach((file) => {
        formData.append("文件", file);
    });
    uploading.value = true;
    try {
        const response = await axios.post(uploadUrl, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            responseType: "blob",
        });
        messageApi.success(response.data);
        console.log(response.data);
        // // 下载文件的代码
        // const url = window.URL.createObjectURL(new Blob([response.data]));
        // const link = document.createElement("a");
        // link.href = url;
        // link.setAttribute("download", file_name.value); // 'file.pdf' 是你想要保存的文件名
        // document.body.appendChild(link);
        // messageApi.success(`处理完成，等待下载...`);
        // link.click();

        uploading.value = false;
    } catch (error) {
        uploading.value = false;
        messageApi.error(`服务器拒绝请求⚡`);
        console.error(error);
    }
};

const get_poem = () => {
    var xhr = new XMLHttpRequest();
    xhr.open("get", "https://v1.jinrishici.com/all.txt");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            var gushici = document.getElementById("gushici");
            gushici.innerText = xhr.responseText;
            messageApi.success(xhr.responseText);
        }
    };
    xhr.send();
};
</script>
  