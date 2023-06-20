<script setup>
  import {initCheckerboard} from "@/assets/js/chessBoard-drawing"
  import {onMounted, ref, defineProps, reactive, toRaw, watch, computed, getCurrentInstance} from "vue";
  import useGoBangSocket from "@/stores/goBangSocket";
  import chessBoardVictoryChess from "@/assets/js/chessBoard-VictoryChess";
  const {$layer} = getCurrentInstance().appContext.config.globalProperties
  const GoBang = useGoBangSocket()
  let timer = ref(null)
  let props = defineProps(["checkBoard"])
  let checkerboard = reactive(toRaw(props.checkBoard))
  let movePosition = ref("")
  //计算最新的一步棋的坐标
  let latest = computed(()=>{
    if(!GoBang.step){
      return false
    }
    return (GoBang.step.x+1) +""+(GoBang.step.y+1)
  })
  //棋盘点击事件
  function chessEvent(event){
    if(timer.value){
      console.log("节流")
      return
    }
    timer.value = setTimeout(()=>{
      timer.value = null
    },500)
    if(!GoBang.playChess){
      $layer.msg("对手正在思考中!")
      return;
    }
    if(event.target.dataset.coordinate){
      let arr = event.target.dataset.coordinate.split("-")
      GoBang.sendMessage({
        type: "Drop",
        data: {
          x: arr[0],
          y: arr[1]
        }
      })
    }
  }
  //棋盘移入事件
  function chessMove(event){
    if(event.target.dataset.coordinate){
      movePosition.value = event.target.dataset.coordinate
    }else {
      movePosition.value = ""
    }
  }
  //棋盘移出事件
  function chessLeave(){
    movePosition.value = ""
  }
  //监听最新的一步棋
  watch(()=> GoBang.step, newValue =>{
    movePosition.value = ""
    checkerboard[newValue.x][newValue.y] = newValue.uid === GoBang.first? 1 : 2
  })
  watch(()=> GoBang.gameOver, newValue =>{
    if(newValue && GoBang.step){
      let st = GoBang.step
      highlightPieces(chessBoardVictoryChess.checkOver(st.x, st.y, checkerboard[st.x][st.y], checkerboard))
    }
  })
  onMounted(()=>{
    //初始化棋盘
    initCheckerboard()
  })

  function highlightPieces(arr){
    console.log(arr)
    if(!arr){
      return
    }
    let table = document.querySelector("table")
    arr.forEach(item =>{
      let step = item.split("-")
      table.rows[step[0]].cells[step[1]].classList.add("win_piece")
    })
    setTimeout(()=>{
      arr.forEach(item =>{
        let step = item.split("-")
        table.rows[step[0]].cells[step[1]].classList.remove("win_piece")
      })
    }, 5000)
  }
</script>

<template>
  <div class="gomoku-container">
    <canvas id="chess" width="560" height="560"></canvas>
    <table class="table_board" @click="chessEvent" @mouseover="chessMove" @mouseleave="chessLeave" :class="{'disable':!GoBang.playChess}">
      <tr v-for="x in 16" :key="x">
        <td v-for="y in 16" :key="y" class="clickable" :data-coordinate="`${x-1}-${y-1}`" :class="{ no:checkerboard[x-1][y-1] !== 0 }">
          <svg viewBox="0 0 100 100" class="symbol animated" v-if="checkerboard[x-1][y-1] !== 0 || movePosition === `${x-1}-${y-1}`"
               :class="{'last': latest === x+''+y && checkerboard[x-1][y-1] !== 0}">
            <circle cx="50" cy="50" r="50"
                    :class="checkerboard[x-1][y-1] === 1? 'circle-dark' : 'circle-light'"></circle>
            <circle cx="50" cy="50" r="50"
                    :class="GoBang.camp === 1? 'circle-dark' : 'circle-light'"
                    v-if="movePosition === `${x-1}-${y-1}`"></circle>
            <circle cx="50" cy="50" r="7" class="last-move" v-if="latest === x+''+y"></circle>
            <path d="m22.833346,43.90753l20.753625,0l6.41303,-19.71587l6.413033,19.71587l20.753621,0l-16.790004,12.184939l6.413362,19.71587l-16.790012,-12.18527l-16.790009,12.18527l6.413364,-19.71587l-16.79001,-12.184939l0.000001,0z" class="circle-light"></path>
          </svg>
        </td>
      </tr>
    </table>
  </div>
  <div/>
</template>

<style scoped>
  .gomoku-container{
    position: relative;
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    width: 100%;
  }
  #chess{
    table-layout: fixed;
    background-color: white;
  }
  .table_board{
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    border-collapse: collapse;
  }
  .table_board .clickable{
    width: 35px;
    height: 35px;
    text-align: center;
    min-width: 35px;
    min-height: 35px;
    cursor: pointer;
    vertical-align: middle;
  }
  .symbol{
    width: 28px;
    pointer-events: none;
    transition: fill .1s;
    vertical-align: middle;
    transform-origin: center;
    animation-duration: 1s;
    animation-timing-function: linear;
  }
  svg path{
    opacity: 0;
    transition: opacity 0.3s;
  }
  .circle-dark{
    fill: #2c3e50
  }
  .circle-light{
    fill: #18bc9c;
  }
  .win_piece svg path{
    opacity: 1;
  }
  .disable{
    pointer-events: none!important;
  }
  .last-move{
    fill: white;
  }
  .last{
    animation-name: last;
  }
  .no{
    pointer-events: none;
  }
  @keyframes last {
    50%, 70%, 90% {
      transform: scale(1.3);
    }
    60%, 80%, 100% {
      transform: scale(1);
    }
  }
</style>