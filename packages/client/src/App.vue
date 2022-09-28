<script setup lang="ts">
import { NButton, NUpload, NList, NListItem, NPopselect } from 'naive-ui'
import { onMounted, ref, reactive, onUpdated } from 'vue';
import { RouterLink, RouterView } from 'vue-router';
import axios from 'axios';
import { io } from 'socket.io-client';
import 'vfonts/Lato.css'
interface List {
  list: {
    [key: string]: {
      id: string;
      name: string;
      filename: string;
      path: string;
      size: number;
    }
  }
}

const BaseURL = 'http://1.117.21.196';
axios.defaults.baseURL = BaseURL;
const socket = io('ws://1.117.21.196');
const { player } = reactive({ player: new Audio() });
const list = reactive<List>({ list: {} });
const isHost = ref(false);
const playMode = reactive({
  value: '循环',
  options: [
    {label: '循环', value: '循环'},
    {label: '随机', value: '随机'},
    { label: '单曲', value: '单曲' }
  ]
});
const flag = ref(true);
const progress = ref<HTMLDivElement>();
const playStatus = ref({
  name: '',
  currentTime: 0,
  currentSongsId: null,
});

socket.on('connect', () => {
});

socket.on('updateCurrentTime', (data) => {
  updateCurrentTime(data);
});

function throttle(func: any, delay: number) {
  let timeout: number | null;
  return function (this: any, event: Event) {
    // 如果 timeout 取反判断为 true，则执行一次实际操作
    if (!timeout) {
      timeout = setTimeout(() => {
        // 在一定 delay 时间设置 timeout 为 null，让下一次事件触发实际操作
        timeout = null;
        func.apply(this, event);
      }, delay);
    }
  }
}

player.ontimeupdate = () => {
  (progress.value as HTMLDivElement).style.width = player.currentTime / player.duration * 100 + '%';
}

const postPlayStatus = () => {
  if (isHost.value) {
    axios.post('/current-time', null, {
      params: {
        currentTime: player.currentTime,
      },
    });
  }
};

const postPlayStatusThrottle = throttle(postPlayStatus, 50);

const getList = async () => {
  const { data } = await axios.get('/list');
  list.list = { ...data.list };
}

const updateCurrentTime = (currentTime: string) => {
  if (!isHost.value) {
    player.currentTime = parseFloat(currentTime) + 0.5;
  }
};

const toggle = () => {
  if (player.paused) {
    flag.value = false;
    player.play();
    return;
  }
  flag.value = true;
  player.pause();
};

const previous = () => {
  player.play();
};

const next = () => {
  player.play();
};

const play = (id: string) => {
  player.src = BaseURL + '/song?id=' + id;
  player.play();
  playStatus.value.name = list.list[id].name
}

const noHost = () => {
  localStorage.clear();
}

onMounted(async () => {
  if (localStorage.getItem('isHost')) {
    isHost.value = true;
  } else {
    const flag = prompt('是 Host?');
    if (flag == 'y') localStorage.setItem('isHost', 'true');
  }
  await getList();
  for (const key in list.list) {
    if (Object.prototype.hasOwnProperty.call(list.list, key)) {
      player.src = BaseURL + '/song?id=' + key;
      playStatus.value.name = list.list[key].name;
    }
  }
});

onUpdated(() => {
})

</script>

<template>
  <div class="container">
    <header>
      <p><img class="avatar" src="./assets/50.png" alt=""></p>
    </header>
    <main>
      <n-list hoverable clickable>
        <n-list-item v-for="song in list.list">
          {{song.name}}
          <n-button @click="play(song.id)">播放</n-button>
        </n-list-item>
      </n-list>
    </main>
    <footer>
      <div class="menu">
        <n-popselect v-model:value="playMode.value" :options="playMode.options" trigger="click">
          <n-button>{{ playMode.value || '弹出选择' }}</n-button>
        </n-popselect>
        <div>音量</div>
        <div>下载</div>
        <div>倍速</div>
        <n-upload action="http://1.117.21.196/upload">
          <n-button>上传文件</n-button>
        </n-upload>
      </div>
      <div class="song-info">
        <div>曲名：{{playStatus.name}}</div>
        <div>总时长：</div>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar">
          <div class="progress-loaded"></div>
          <div class="progress-played" ref="progress">
            <div class="progress-thumb"></div>
          </div>
        </div>
      </div>
      <div class="controller">
        <n-button round @click="previous">上一首</n-button>
        <n-button v-if="flag" round @click="toggle">播放</n-button>
        <n-button v-else round @click="toggle">暂停</n-button>
        <n-button round @click="next">下一首</n-button>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

header {
  flex: 1
}

header p {
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.avatar {
  width: 10%;
  border-radius: 50%;
  animation: rotate 8s linear infinite;
}

.song-info {
  display: flex;
  justify-content: space-between;
}

main {
  flex: 5
}

footer {
  flex: 1
}

.progress-bar-wrap {
  margin: 0 5px 0 5px;
  padding: 4px 0;
  cursor: pointer !important;
  flex: 1;
}

.progress-bar {
  position: relative;
  height: 2px;
  width: 100%;
  background: #999999;
}

.progress-loaded {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: #aaa;
  height: 2px;
  transition: all .5s ease;
}

.progress-played {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  height: 2px;
  width: 0px;
  background: rgba(0, 0, 0, 1);
  transition: width 0.1s;
}

.progress-thumb {
  position: absolute;
  right: -5px;
  top: -4px;
  height: 10px;
  width: 10px;
  border-radius: 50%;
  cursor: pointer;
  transition: all .3s ease-in-out;
  background: rgba(0, 0, 0, 1);
}

.controller {
  display: flex;
  justify-content: space-around;
}

.menu {
  display: flex;
  justify-content: space-around;
}

.menu>div {
  flex: 1;
}
</style>