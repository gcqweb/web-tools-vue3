<template>
    <a-card>
        <h1>五子棋</h1>
        <div class="board">
            <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
                <div v-for="(cell, colIndex) in row" :key="colIndex" class="cell"
                    @click="handleCellClick(rowIndex, colIndex)">
                    <div v-if="cell === 1" class="black-stone"></div>
                    <div v-else-if="cell === 2" class="white-stone"></div>
                </div>
            </div>
        </div>
        <a-button @click="undoMove" :disabled="moves.length === 0">
            悔棋
        </a-button>
        <a-button @click="restartGame">
            重开游戏
        </a-button>
        <div>当前执子方：{{ currentPlayer === 1 ? '黑棋' : '白棋' }}</div>
        <div>当前棋局：{{ moves.length }} 步{{ winner }}</div>
        <!-- //当前游戏时间 -->
        <div>当前游戏时长：{{ formattedTime }} </div>
        <!-- <div v-if="winner !== 0" class="winner-message"> -->
        <a-modal centered closable v-model:open="open" title="胜负已分" @ok="handleOk" ok-text="不服再战" cancel-text="点到为止">
            <p>{{ winner === 1 ? "黑棋" : '白棋' }}获胜！</p>
        </a-modal>
        <!-- </div> -->
    </a-card>
</template>

<script setup>
import { ref, onMounted, computed, watch, h } from 'vue';
import { message, Modal } from 'ant-design-vue';
const boardSize = 15; // 棋盘大小
const board = ref([]); // 棋盘数组
const currentPlayer = ref(1); // 当前玩家（1代表黑子，2代表白子）
const moves = ref([]); // 落子记录
const winner = ref(0); // 获胜方（0代表无）
const winCount = 5; // 连续多少子获胜
// const Msg = () => {
//     winner.value ? winner.value = 2 : winner.value = 1
// }

// 游戏结果弹窗
const open = ref(false);
const handleOk = (e) => {
    open.value = false;
    if (winner.value !== 0) {
        winner.value = 0;
    }
    restartGame()
};
const success = () => {
    Modal.success({
        title: '胜负已分',
        content: h('div', {}, [h('p', ` ${winner === 1 ? "黑棋" : '白棋'}获胜！`)]),
        closable: true,
        mask: false,
        // maskClosable: true,
        okText: '不服再战',
        onOk() {
            restartGame()
        },
    });
};

// const open = computed(() => winner.value > 0);
// 监听winner大于0时使open为true
watch([winner], (isopen) => {
    open.value = winner.value > 0
    // if (isopen) {
    // success()
    // message.success(`${winner.value === 1 ? "黑棋" : '白棋'}获胜！`);
    clearInterval(timer);//清空计时器
    // }
});

//游戏时长-
const gameDuration = ref(0);
// 模拟游戏时长的更新
let timer
const time = () => {
    clearInterval(timer);
    timer = setInterval(() => {
        gameDuration.value++;
    }, 1000);
}
// 格式化计时器
const formattedTime = computed(() => {
    const hours = Math.floor(gameDuration.value / 3600);
    const minutes = Math.floor((gameDuration.value % 3600) / 60);
    const seconds = gameDuration.value % 60;
    return `${hours}:${minutes}:${seconds}`;
});
// 监听落子开始计时游戏时长
const shouldWatch = computed(() => moves.value.length > 0);
watch(shouldWatch, (newValue) => {
    if (newValue) {
        time()
        // console.log(shouldWatch, moves.value.length, newValue);
    } else {
        clearInterval(timer);
    }
});

// 初始化棋盘数组
const initBoard = () => {
    for (let i = 0; i < boardSize; i++) {
        const row = [];
        for (let j = 0; j < boardSize; j++) {
            row.push(0);
        }
        board.value.push(row);
    }
};

// 处理落子事件
const handleCellClick = (row, col) => {
    if (board.value[row][col] === 0 && winner.value === 0) {
        board.value[row][col] = currentPlayer.value;
        moves.value.push({ row, col });
        checkWin(row, col);
        currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
    }
};


// 悔棋
const undoMove = () => {
    if (moves.value.length > 0 && winner.value === 0) {
        const lastMove = moves.value.pop();
        const { row, col } = lastMove;
        board.value[row][col] = 0;
        currentPlayer.value = currentPlayer.value === 1 ? 2 : 1;
        winner.value = 0;
    }
};

// 检查是否获胜
const checkWin = (row, col) => {
    const directions = [
        [1, 0], // 水平方向
        [0, 1], // 垂直方向
        [1, 1], // 正斜方向
        [1, -1] // 反斜方向
    ];

    for (const direction of directions) {
        const count = countStones(row, col, direction[0], direction[1]) +
            countStones(row, col, -direction[0], -direction[1]) + 1;
        if (count >= winCount) {
            winner.value = currentPlayer.value;
            break;
        }
    }
};

// 计算某个方向上的连续子数
const countStones = (row, col, dx, dy) => {
    const stoneType = board.value[row][col];
    let count = 0;
    let newRow = row + dx;
    let newCol = col + dy;

    while (newRow >= 0 && newRow < boardSize &&
        newCol >= 0 && newCol < boardSize &&
        board.value[newRow][newCol] === stoneType) {
        count++;
        newRow += dx;
        newCol += dy;
    }

    return count;
};
// 重开游戏
const restartGame = () => {
    board.value = [];
    moves.value = [];
    clearInterval(timer);
    gameDuration.value = 0;// 重置游戏时长为0
    currentPlayer.value = 1;
    winner.value = 0;
    initBoard();
};
onMounted(() => {
    initBoard();
});

</script>
  
<style scoped>
.board {
    display: flex;
    width: 38rem;
    flex-direction: column;
    /* align-items: center; */
    background-color: bisque;
    border: #000 2px solid;
    overflow: hidden;
}

.row {
    display: flex;
}


.cell {
    width: 2rem;
    height: 2rem;
    /* border: 1px solid #000; */
    cursor: pointer;
    position: relative;
    margin: 4px;
}

.cell::before,
.cell::after {
    content: "";
    position: absolute;
    background-color: #000;
}

.cell::before {
    width: 2px;
    height: 150%;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
}

.cell::after {
    width: 150%;
    height: 2px;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
}

.row .cell:first-child::after {
    /* 在这里设置您想要的样式 */
    left: 1rem;
}

.row .cell:last-child::after {
    /* 在这里设置您想要的样式 */
    left: -2rem;
}

.board .row:first-child .cell::before {
    top: 1rem;
}

.board .row:last-child .cell::before {
    top: -2rem;
}

.black-stone {
    width: 100%;
    height: 100%;
    background-color: #000;
    border-radius: 50%;
    position: absolute;
    z-index: 9;
}

.white-stone {
    width: 100%;
    height: 100%;
    background-color: #fff;
    border-radius: 50%;
    border: #aaa 1px solid;
    position: absolute;
    z-index: 9;
}

button {
    margin-top: 10px;
}

.winner-message {
    margin-top: 10px;
    font-weight: bold;
}
</style>
  