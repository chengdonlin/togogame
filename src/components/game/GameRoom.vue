<script setup>
import {storeToRefs} from "pinia";
import {computed, defineEmits, getCurrentInstance, nextTick, onMounted, ref, toRaw, watch} from "vue";
import useGoBang from "@/stores/goBangSocket";
import useUserInfo from "@/stores/userInfo";
import useMainSocket from "@/stores/mainSocket";
import router from "@/router";
const {$axios} = getCurrentInstance().appContext.config.globalProperties
const GoBang  = useGoBang()
const Main = useMainSocket()
const emits = defineEmits(["switch", "openCustomGames", "openVisitorLogin"])
//建立连接
GoBang.connectSocket()

let {user, userGameInfo} = storeToRefs(useUserInfo())   //自己的信息
let GameData = ref(null)    //游戏数据
let rivalInfo = ref(null)   //对手信息
let round= null       //el元素
let Timer = null    //计时器
let leaveRoomEnable = ref(false)
let settlementAnimation = ref(false)
//计算你是不是先手
let isFirstPlayer = computed(()=>{
  return user.value.id === GameData.value.firstPlayer
})
//计算你是不是玩家一
let isPlayer1 = computed(()=>{
  return user.value.id === GameData.value.player1
})
onMounted(()=>{
  let gi = new Promise((resolve, reject)=>{
    $axios.get("/gobang/gameInfo").then(
        response =>{
          if(response.data.code === 200){
            GameData.value = response.data.data
            console.log(response.data.data)
            router.push({
              name: response.data.data.gameType + "Board"
            })
            resolve()
          }
        },
        error =>{
          console.log(error)
          reject()
        }
    ).catch(error =>{
      console.log(error)
    })
  })
  gi.then(() =>{
    $axios.get("/gobang/rival").then(
        response =>{
          rivalInfo.value = response.data.data
          initStore()
        }
    )
  }).catch(error =>{
    console.log(error)
  })
})

/**
 * 判断实际时间
 * @return {*|string|number}  秒数
 */
function remainder(){
  let time = GameData.value.config.stepTime
  if(GameData.value.config.stepTime > GameData.value.stepTime){
    time = GameData.value.stepTime
    GameData.value.stepTime += GameData.value.config.stepTime
  }
  return time
}
//监听最新一步棋
watch(()=> GoBang.step, () =>{
  round[GoBang.currentChess - 1].style.cssText = `animation-duration: ${remainder()}s;`
})
//监听游戏是否结束
watch(()=> GoBang.gameOver, value =>{
  if(value){
    gameOverAfterReachAnimation()
  }
})
/**
 * 游戏初始化
 * 1、初始化状态管理数据
 * 2、开启动画监听器和时间计时器
 * 3、判断游戏开始状态及是否执行预动画
 */
function initStore(){
  let number = GameData.value.steps.length
  if(number){
    console.log("校准step")
    GoBang.step = GameData.value.steps[number-1]
  }
  GoBang.camp = isFirstPlayer.value? 1 : 2
  GoBang.first = GameData.value.firstPlayer
  round = document.querySelectorAll(".round")
  listen()
  console.log("游戏开始了吗？"+ GameData.value.state)
  if(!GameData.value.state){
    StartGameReachAnimation()
  }else {
    countWho()
  }
  openCumulativeTime(GameData.value.remainder1, GameData.value.remainder2)
}
/**
 * 开启动画监听器
 */
function listen(){
  round.forEach(item =>{
    item.addEventListener("animationend", ()=>{
      console.log("动画结束")
      item.nextElementSibling.style.opacity = 1
    })
  })
}
/**
 * 游戏开始及预动画
 */
function StartGameReachAnimation(){
  console.log("执行预动画")
  let number = 4
  let t = null
  let span
  nextTick(()=>{
    span = document.querySelector(".tp")
  })
  t = setInterval(()=>{
    if(number < 0){
      clearInterval(t)
      GoBang.sendMessage({
        type: "Start"
      })
      gameMsg("游戏开始！")
      // GameData.value.state = true
      GoBang.gameStart = true
      countWho()
    }
      span.innerText = number--
  },1000)
}
/**
 * 重置游戏
 */
function resetGame(){
  console.log("执行重置游戏数据")
  GoBang.gameOver = false
}
/**
 * 游戏结束之后需要处理的事件
 */
function gameOverAfterReachAnimation(){
  console.log("执行结算事件")

  let player = round[GameData.value.player1 === GoBang.gameOverData.winner? 1 : 0]
  document.querySelector(".table_board").style.pointerEvents = "none"
  clearInterval(Timer)
  GoBang.currentChess = GameData.value.player1 === GoBang.gameOverData.winner? 2: 1
  player.style.animationDuration = 0
  // player.nextElementSibling.style.opacity = 1
  if(GoBang.gameOverData.winner === user.value.id){
    gameMsg("您赢了！")
  }else {
    gameMsg("您输了！")
  }
  //高亮棋子
  //打开结算画面
  setTimeout(()=>{
    GoBang.gameStart = false
    player.nextElementSibling.style.opacity = 0
    GoBang.currentChess = 0
    settlementAnimation.value = true
    rewardProcess()     //奖励环节
    resetGame()         //重置游戏数据
  },3000)
}
/**
 * 奖励环节
 */
function rewardProcess(){
  let pro = document.querySelector(".actual_progress")
  console.log(pro, userGameInfo.value.exp, GoBang.gameOverData.exp, userGameInfo.value.grade)
  pro.style.width = (userGameInfo.value.exp + GoBang.gameOverData.exp) / userGameInfo.value.grade + "%"
}
/**
 * 发送游戏提示信息
 * @param msg {String} 信息内容
 */
function gameMsg(msg){
  console.log("发送游戏内提示信息")
  let message = document.querySelector(".message")
  message.querySelector("span").innerText = msg
  message.classList.remove("msg_animation")
  setTimeout(()=>{
    message.classList.add("msg_animation")
  }, 0)

}
/**
 * 计算该谁先下棋
 */
function countWho(){
  let data = GoBang
  if(GameData.value.steps.length % 2 === 0){
    data.currentChess = GameData.value.firstPlayer === GameData.value.player1? 1 : 2
    data.playChess = isFirstPlayer.value
  }else {
    data.currentChess =  GameData.value.firstPlayer === GameData.value.player1? 2 : 1
    data.playChess = !isFirstPlayer.value
  }
  round[data.currentChess - 1].style.cssText = `animation-duration: ${GameData.value.config.stepTime}s;`
}

/**
 * 计时器
 * @param Seconds1  {number}  玩家一的剩余秒数
 * @param Seconds2  {number}  玩家二的剩余秒数
 */
function openCumulativeTime(Seconds1, Seconds2){
  console.log("开启计时器")
  let playerTimer = document.querySelectorAll(".time")
  Timer = setInterval(()=>{
    if(!GoBang.currentChess){
      return
    }
    if(GoBang.currentChess === 1){
      playerTimer[0].innerText = timeConverter(Seconds1--)
    }else{
      playerTimer[1].innerText = timeConverter(Seconds2--)
    }
  }, 1000)

}
/**
 * 时间转换器
 * @param time {number}  秒数
 * @return {string}      处理过后的时间
 */
function timeConverter(time){
  let m = parseInt(time / 60)
  let s = time % 60
  return `${ m < 10? `0${m}`: m}:${s < 10? `0${s}`: s}`
}

function openLeave(){
  leaveRoomEnable.value = true
}
/**
 * 退出房间并认输
 */
function surrender(){
  GoBang.sendMessage({
    type: "Surrender"
  })
  setTimeout(()=>{
    router.push(`/${Main.type}`)
  }, 500)
}
function exit(){
  router.push(`/${Main.type}`)
}
</script>

<template>
  <div class="full_screen">
    <div class="content_cover">
      <div v-if="!GameData">
        <img src="../../assets/img/gameLoading.gif" class="game_loading" alt="游戏数据初始化中"/>
      </div>
      <div class="content_flex" v-if="GameData">
        <div class="game_top">
          <div class="message">
            <div class="message-text">
              <span></span>
            </div>
          </div>
          <div class="game_info">
            <div class="row">
              <div class="game_player gap_1">
                <div class="level">
                    <img src="../../assets/img/level.svg" alt="Ruby" class="icon">
                    <span class="funky lead">{{isPlayer1? userGameInfo.grade : rivalInfo? rivalInfo.grade : "0"}}</span>
                </div>
                <div class="insert">
                  <svg aria-label="O" viewBox="0 0 100 100" role="img" class="inserted">
                    <circle cx="50" cy="50" r="35" class="shape"
                            :class="GameData.firstPlayer === GameData.player1? 'circle-dark' : 'circle-light'"></circle></svg>
                </div>
                <div class="player_info">
                  <span class="text_name">{{isPlayer1? user.name : rivalInfo? rivalInfo.name : "玩家一"}}</span>
                  <div>
                    <span class="chronometer" :class="{'secondary': GoBang.currentChess === 1}">
                      <span class="time">{{timeConverter(GameData.remainder1)}}</span>
                    </span>
                  </div>
                </div>
                <div class="avatar">
                  <div class="head_sculpture">
                    <img src="../../assets/img/user1.jpg" alt="头像">
                  </div>
                  <svg aria-label="O" viewBox="0 0 264 264" role="img" class="progress-circle animated">
                    <circle  cx="132" cy="132" r="115" class="round"
                             :class="{'animation': GoBang.currentChess === 1 }"
                             ></circle>
                    <path  d="M 211.642 121.585 C 208.804 103.416 200.421 88.421 186.503 76.636 C 171.871 64.001 154.044 57.678 133.022 57.678 C 111.994 57.678 94.168 63.929
                     79.543 76.418 C 65.619 88.359 57.311 103.416 54.615 121.585 C 54.044 124.571 53.757 127.411 53.757 130.115 C 53.757 142.047 57.662 152.482 65.481 161.435
                     C 73.289 170.383 84.3 176.925 98.51 181.031 L 98.51 184.241 C 98.51 188.213 99.857 191.554 102.555 194.249 C 105.251 196.951 108.59 198.445 112.569 198.726
                      C 116.688 199.014 119.738 198.301 121.728 196.597 C 124.851 198.865 128.333 200 132.171 200 C 135.721 200 138.992 198.94 141.97 196.809 C 143.961 198.367
                       146.87 199.014 150.709 198.726 C 154.683 198.301 158.025 196.773 160.722 194.148 C 163.419 191.507 164.767 188.214 164.767 184.241 L 164.767 181.899 C
                       180.106 177.917 191.969 171.244 200.355 161.858 C 208.45 152.915 212.498 142.336 212.498 130.115 C 212.498 127.411 212.211 124.571 211.642 121.585 Z M
                        114.699 142.151 C 110.436 147.057 105.318 149.5 99.358 149.5 C 93.393 149.5 88.278 147.058 84.017 142.151 C 79.756 137.251 77.623 131.316 77.623 124.355
                         C 77.623 117.4 79.756 111.466 84.017 106.576 C 88.278 101.677 93.393 99.227 99.358 99.227 C 105.318 99.227 110.436 101.677 114.699 106.576 C 118.962
                         111.466 121.097 117.4 121.097 124.355 C 121.097 131.316 118.962 137.25 114.699 142.151 Z M 133.233 170.383 C 129.681 170.383 127.053 169.468 125.352
                         167.648 C 124.356 166.512 123.863 165.114 123.863 163.424 C 123.863 160.761 124.89 158.093 126.95 155.418 C 129.008 152.756 131.029 151.421 133.022
                         151.421 C 135.011 151.421 136.887 152.893 138.666 155.855 C 140.441 158.802 141.336 161.605 141.336 164.281 C 141.336 168.355 138.632 170.383 133.233
                          170.383 Z M 180.217 142.151 C 176.025 147.057 170.878 149.5 164.767 149.5 C 158.804 149.5 153.728 147.058 149.537 142.151 C 145.342 137.251 143.246
                          131.316 143.246 124.355 C 143.246 117.4 145.342 111.466 149.537 106.576 C 153.728 101.677 158.804 99.227 164.767 99.227 C 170.878 99.227 176.027 101.677
                           180.217 106.576 C 184.404 111.466 186.503 117.4 186.503 124.355 C 186.504 131.316 184.404 137.25 180.217 142.151 Z" class="skull" >
                    </path>
                  </svg>
                </div>
                <div>-</div>
              </div>
              <div class="game_player gap_2">
                <div class="level">
                  <img src="../../assets/img/level.svg" alt="Ruby" class="icon">
                  <span class="funky lead">{{!isPlayer1? userGameInfo.grade : rivalInfo? rivalInfo.grade : "0"}}</span>
                </div>
                <div class="insert">
                  <svg aria-label="O" viewBox="0 0 100 100" role="img" class="inserted">
                    <circle cx="50" cy="50" r="35" class="shape"
                            :class="GameData.firstPlayer === GameData.player2? 'circle-dark' : 'circle-light'"></circle></svg>
                </div>
                <div class="player_info player2">
                  <span class="text_name">{{ !isPlayer1? user.name : rivalInfo? rivalInfo.name : "玩家二"}}</span>
                  <div>
                    <span class="chronometer" :class="{'secondary': GoBang.currentChess === 2}">
                      <span class="time">{{timeConverter(GameData.remainder2)}}</span>
                    </span>
                  </div>
                </div>
                <div class="avatar">
                  <div class="head_sculpture">
                    <img src="../../assets/img/user1.jpg" alt="头像">
                  </div>
                  <svg aria-label="O" viewBox="0 0 264 264" role="img" class="progress-circle animated">
                    <circle  cx="132" cy="132" r="115" class="round"
                             :class="{'animation': GoBang.currentChess === 2 } "
                             ></circle>
                    <path  d="M 211.642 121.585 C 208.804 103.416 200.421 88.421 186.503 76.636 C 171.871 64.001 154.044 57.678 133.022 57.678 C 111.994 57.678 94.168 63.929
                     79.543 76.418 C 65.619 88.359 57.311 103.416 54.615 121.585 C 54.044 124.571 53.757 127.411 53.757 130.115 C 53.757 142.047 57.662 152.482 65.481 161.435
                     C 73.289 170.383 84.3 176.925 98.51 181.031 L 98.51 184.241 C 98.51 188.213 99.857 191.554 102.555 194.249 C 105.251 196.951 108.59 198.445 112.569 198.726
                      C 116.688 199.014 119.738 198.301 121.728 196.597 C 124.851 198.865 128.333 200 132.171 200 C 135.721 200 138.992 198.94 141.97 196.809 C 143.961 198.367
                       146.87 199.014 150.709 198.726 C 154.683 198.301 158.025 196.773 160.722 194.148 C 163.419 191.507 164.767 188.214 164.767 184.241 L 164.767 181.899 C
                       180.106 177.917 191.969 171.244 200.355 161.858 C 208.45 152.915 212.498 142.336 212.498 130.115 C 212.498 127.411 212.211 124.571 211.642 121.585 Z M
                        114.699 142.151 C 110.436 147.057 105.318 149.5 99.358 149.5 C 93.393 149.5 88.278 147.058 84.017 142.151 C 79.756 137.251 77.623 131.316 77.623 124.355
                         C 77.623 117.4 79.756 111.466 84.017 106.576 C 88.278 101.677 93.393 99.227 99.358 99.227 C 105.318 99.227 110.436 101.677 114.699 106.576 C 118.962
                         111.466 121.097 117.4 121.097 124.355 C 121.097 131.316 118.962 137.25 114.699 142.151 Z M 133.233 170.383 C 129.681 170.383 127.053 169.468 125.352
                         167.648 C 124.356 166.512 123.863 165.114 123.863 163.424 C 123.863 160.761 124.89 158.093 126.95 155.418 C 129.008 152.756 131.029 151.421 133.022
                         151.421 C 135.011 151.421 136.887 152.893 138.666 155.855 C 140.441 158.802 141.336 161.605 141.336 164.281 C 141.336 168.355 138.632 170.383 133.233
                          170.383 Z M 180.217 142.151 C 176.025 147.057 170.878 149.5 164.767 149.5 C 158.804 149.5 153.728 147.058 149.537 142.151 C 145.342 137.251 143.246
                          131.316 143.246 124.355 C 143.246 117.4 145.342 111.466 149.537 106.576 C 153.728 101.677 158.804 99.227 164.767 99.227 C 170.878 99.227 176.027 101.677
                           180.217 106.576 C 184.404 111.466 186.503 117.4 186.503 124.355 C 186.504 131.316 184.404 137.25 180.217 142.151 Z" class="skull" >
                    </path>
                  </svg>
                </div>
                <div>-</div>
              </div>
            </div>
          </div>
        </div>
        <div class="game_bottom">
          <div class="menu" :class="{menu_show: GoBang.gameStart}">
            <div class="leave" @click="openLeave" @touchstart.prevent="openLeave">
              <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M872.802928 755.99406 872.864326 755.99406 872.864326 755.624646Z" fill="#d81e06" ></path><path d="M927.846568 511.997953c0-229.315756-186.567139-415.839917-415.838893-415.839917-229.329059 0-415.85322 186.524161-415.85322 415.839917 0 229.300406 186.524161 415.84094 415.85322 415.84094C741.278405 927.838893 927.846568 741.29836 927.846568 511.997953M512.007675 868.171955c-196.375529 0-356.172979-159.827125-356.172979-356.174002 0-196.374506 159.797449-356.157629 356.172979-356.157629 196.34483 0 356.144326 159.783123 356.144326 356.157629C868.152001 708.34483 708.352505 868.171955 512.007675 868.171955" fill="#d81e06"></path><path d="M682.378947 642.227993 553.797453 513.264806 682.261267 386.229528c11.661597-11.514241 11.749602-30.332842 0.234337-41.995463-11.514241-11.676947-30.362518-11.765975-42.026162-0.222057L511.888971 471.195665 385.223107 344.130711c-11.602246-11.603269-30.393217-11.661597-42.025139-0.059352-11.603269 11.618619-11.603269 30.407544-0.059352 42.011836l126.518508 126.887922L342.137823 639.104863c-11.662621 11.543917-11.780301 30.305213-0.23536 41.96988 5.830799 5.89015 13.429871 8.833179 21.086248 8.833179 7.53972 0 15.136745-2.8847 20.910239-8.569166l127.695311-126.311801L640.293433 684.195827c5.802146 5.8001 13.428847 8.717546 21.056572 8.717546 7.599072 0 15.165398-2.917446 20.968567-8.659217C693.922864 672.681586 693.950494 653.889591 682.378947 642.227993" fill="#d81e06"></path></svg>
              <span class="yin_cang">离开房间</span>
            </div>
            <div class="menu_list">
              <div class="menu_item">
                <span class="item_text">悔棋</span>
                <span class="brg"></span>
              </div>
            </div>
            <div class="mcd">
              <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512.526 138.665c205.853 0 373.335 167.476 373.335 373.335 0 205.853-167.481 373.335-373.335 373.335-205.859 0-373.335-167.481-373.335-373.335 0.001-205.859 167.476-373.335 373.335-373.335m0 821.335c247.034 0 448-200.966 448-448 0-247.035-200.966-448-448-448-247.035 0-448 200.965-448 448 0 247.034 200.965 448 448 448m49.725-251.326a37.327 37.327 0 0 0 36.527 7.707 37.331 37.331 0 0 0 24.94-27.771 37.344 37.344 0 0 0-11.586-35.49L455.776 512.749l156.913-146.836c14.448-14.201 14.932-37.336 1.088-52.124-13.837-14.795-36.953-15.854-52.083-2.382L375.027 486.055a37.284 37.284 0 0 0-11.839 27.64 37.28 37.28 0 0 0 12.396 27.389l186.667 167.629v-0.039z m0-19.566" fill="#333333"></path></svg>
            </div>
          </div>
          <div class="yu_dong" v-if="!GoBang.gameStart && !GoBang.gameOver">
            <div class="text-punch">
              <span class="tp">5</span>
            </div>
          </div>
          <div class="end_of" :class="{end_show: settlementAnimation}">
            <div class="Level_settlement">
              <div class="progress">
                <div class="progress_bar">
                  <span class="label">级别</span>
                  <div class="actual_progress" :style="`width: ${userGameInfo.exp / userGameInfo.grade}%;`"></div>
                </div>
                <div class="level">
                  <img src="../../assets/img/level.svg" alt="等级">
                  <span class="funky">{{ userGameInfo.grade }}</span>
                </div>
              </div>
            </div>
            <button class="exit_btn" @click="exit">离开房间</button>
          </div>
          <router-view :checkBoard="toRaw(GameData.checkBoard.checkBoard)" v-if="GoBang.gameStart !== GoBang.gameOver"></router-view>
        </div>
      </div>
    </div>
  </div>
  <div class="leaveRoom" :class="{show_leave: leaveRoomEnable}">
    <div class="container">
      <div class="container_center">
        <div class="dialog-close" @click="leaveRoomEnable = false">
          <svg t="1686105168168" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M614.69312 511.99872l308.08448 308.09088c18.9056 18.8992 18.9056 49.55008 0 68.45824l-34.22976 34.22976c-18.9056 18.90688-49.56032 18.90688-68.45952 0L511.99872 614.6944l-308.0896 308.0832c-18.90048 18.90688-49.55008 18.90688-68.45568 0l-34.23488-34.22976c-18.90432-18.90816-18.90432-49.56032 0-68.45824l308.08576-308.09088L101.21856 203.9104c-18.90432-18.90048-18.90432-49.55008 0-68.45952l34.23488-34.22976c18.9056-18.9056 49.5552-18.9056 68.45568 0L511.99872 409.3056 820.08832 101.22112c18.90048-18.9056 49.5552-18.9056 68.45952 0l34.22976 34.22976c18.9056 18.90944 18.9056 49.56416 0 68.45952L614.69312 511.99872 614.69312 511.99872zM614.69312 511.99872" fill="#272636" p-id="3319"></path></svg>
        </div>
        <h1 class="close_info">如果您离开，那您就输了！</h1>
        <div class="menu_close">
          <button class="btn cell" type="button" @click="leaveRoomEnable = false">取消</button>
          <button class="btn exit" type="button" @click="surrender">离开房间</button>
        </div>
      </div>
    </div>
  </div>
  <div class="mask" :class="{mask_show: leaveRoomEnable}"> </div>
</template>

<style scoped>
  .end_of{
    position: absolute;
    inset: 0;
    z-index: 98;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: rgb(248,249,250);
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
    min-width: 560px;
  }
  .end_show{
    pointer-events: auto;
    opacity: 1;
  }
  .Level_settlement{
    width: 330px;
    padding: 20px;
    background-color: rgb(248,249,250);
    box-shadow: #001b3814 0 4px 16px;
    border-radius: 10px;
    margin-bottom: 50px;
  }
  .exit_btn{
    padding: 10px 15px;
    border-radius: 5px;
    background-color: #dc3545;
    color: white;
    border: none;
    font-size: 18px;
    transition: background-color 0.3s;
  }
  .exit_btn:hover{
    background-color: #a42731;
  }
  .mask{
    z-index: 98;
    position: absolute;
    inset: 0;
    background-color: #000000;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s;
  }
  .mask_show{
    opacity: .5;
    pointer-events: auto;
  }
  .chronometer{
    transition: background .3s ease;
    font-weight: 700;
    letter-spacing: 2px;
    background-color: #e9ecef;
    padding: 5px;
  }
  .secondary {
    background-color: rgba(24, 188, 156, 1)!important;
    color: rgba(255, 255, 255, 1)!important;
  }
  .msg_animation{
    animation: msg linear 2s;
  }
  .yu_dong{
    display: flex;
    flex-direction: column;
  }
  .text-punch, .message-text{
    color: #d63384;
    line-height: 1.2;
    display: flex;
    justify-content: center;
    align-items: center;
    text-shadow: -1px 0 #000, 0 1px #000, 1px 0 #000, 0 -1px #000;
    font-weight: 600!important;
    letter-spacing: 1px;

  }
  .leave, .mcd{
    width: 30px;
    height: 30px;
    position: relative;
    cursor: pointer;
    margin-left: 10px;
  }
  .yin_cang{
    position: absolute;
    display: inline-block;
    width: 65px;
    right: 0;
    top: 40px;
    color: white;
    background-color: rgb(110,110,111);
    padding: 5px;
    border-radius: 3px;
    pointer-events: none;
    opacity: 0;
    transition: opacity .3s;
  }
  .leave:hover .yin_cang{
    opacity: 1;
    pointer-events: auto;
  }
  .message{
    position: absolute;
    z-index: 20;
    opacity: 0;
    width: 100%;
    pointer-events: none;
  }
  .message-text span{
    font-family: Luckiest Guy,Roboto,Helvetica Neue,Helvetica,Arial,sans-serif!important;
    font-size: 80px!important;
  }
  .text-punch span{
    font-family: Luckiest Guy,Roboto,Helvetica Neue,Helvetica,Arial,sans-serif!important;
    font-size: 60px!important;
  }
  .full_screen{
    position: absolute;
    inset: 0;
    background-color: rgb(241,243,245);
  }
  .menu{
    position: absolute;
    right: 0;
    top: 1rem;
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    vertical-align: middle;
    opacity: 0;
    pointer-events: none;
    transition: opacity .3s;
  }
  .menu_show{
    opacity: 1;
    pointer-events: auto;
  }
  .menu_item:hover .brg{
    opacity: 1;

  }
  .item_text{
    position: relative;
    z-index: 9;
  }
  .menu_list{
    background-color: beige;
    width: 0;
    overflow: hidden;
  }
  .menu_item{
    position: relative;
    box-sizing: border-box;
    text-align: center;
    line-height: 36px;
    padding: 0 16px;
    border-radius: 4px;
    overflow: visible;
    white-space: nowrap;
    text-decoration: none;

  }
  .brg{
    opacity: 0;
    inset: 0;
    position: absolute;
    pointer-events: none;
    border-radius: inherit;
    background-color: rgba(225, 225, 225, 0.6);
  }
  .content_cover{
    width: 66.6666%;
    height: 100%;
    margin: 0 auto;
    background-color: white;
  }
  .content_flex{
    display: flex;
    height: 100%;
    flex-direction: column;
    background-color: rgb(248,249,250);
  }
  .game_top{
    box-sizing: border-box;
    margin-top: 10px;
    position: relative;
  }
  .game_info{
    width: 100%;
    margin-right: 30px;
  }
  .row{
    display: flex;
    flex-wrap: wrap;
  }
  .game_player{
    flex: 0 0 auto;
    width: 50%;
    display: flex;
    align-items: center;
    gap: 0.2rem;
  }
  .game_player:last-child{
    flex-direction: row-reverse;
  }
  .level{
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    width: 30px;
    height: 30px;
    position: relative;
    transform: scale(0.9);
  }
  .game_loading{
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 375px;
    width: 375px;
  }
  .icon{
    width: 100%;
    position: absolute;
  }
  .level span{
    z-index: 1;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    margin-top: 5px;
    font-size: 20px;
    font-family: Luckiest Guy,Roboto,Helvetica Neue,Helvetica,Arial,sans-serif;
    font-weight: 400!important;
    letter-spacing: 1px;
  }
  .insert{
    width: 16px;
    min-width: 16px;
  }
  .circle-light{
    stroke: #18bc9c;
    color: #18bc9c;
    fill: #18bc9c;
  }
  .circle-dark{
    stroke: #2c3e50;
    color: #2c3e50;
    fill: #2c3e50;
  }
  .shape{
    stroke-width: 15;
  }
  .player_info{
    text-align: right;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
  }
  .text_name{
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    white-space: nowrap;
    font-size: .45rem;
  }
  .player_info>div{
    padding: 5px 0;
  }
  .avatar{
    width: 60px;
    height: 60px;
    min-width: 60px;
    min-height: 60px;
    box-sizing: content-box;
    display: flex;
    align-items: center;
    position: relative;
  }
  .head_sculpture{
    transition: background-color 0.3s;
    overflow: hidden;
    border-radius: 50%;
    width: 100%;
    height: 100%;
    position: relative;
  }
  .avatar img{
    width: 100%;
    transition: transform 0.8s;
  }
  .progress-circle{
    position: absolute;
    left: -5px;
    top: -5px;
    width: 70px;
  }
  .progress-circle circle{
    stroke-width: 0;
    fill: transparent;
    transition: stroke;
    stroke: #ffc107;

  }
  .animation{
    stroke-width: 30px!important;
    animation: draw-shape linear forwards;
  }
  .progress-circle path{
    transition: opacity 0.3s;
    opacity: 0;
  }
  .player2{
    text-align: left;
  }
  .game_bottom{
    overflow: auto;
    height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    position: relative;
  }
  .leaveRoom{
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    justify-content: center;
    transform: translate(-50%, -50%);
    opacity: 0;
    pointer-events: none;
    transition: opacity .3s;
    z-index: 99;
  }
  .show_leave{
    opacity: 1;
    pointer-events: auto;
  }
  .container{
    display: block;
    padding: 24px;
    border-radius: 4px;
    box-sizing: border-box;
    overflow: auto;
    outline: 0;
    width: 100%;
    height: 100%;
    min-height: inherit;
    max-height: inherit;
    box-shadow: 0 11px 15px -7px #0003, 0 24px 38px 3px #00000024, 0 9px 46px 8px #0000001f;
    background: #fff;
    color: #000000de;
  }
  .dialog-close{
    width: 30px;
    height: 30px;
    position: absolute;
    right: 5px;
    top: 5px;
    z-index: 10;
    cursor: pointer;
  }
  .close_info{
    margin-bottom: 20px;
    font-weight: 500;
  }
  .menu_close{
    text-align: center;
  }
  .menu_close .btn{
    padding: 10px 15px;
    border-radius: 5px;
    background-color: transparent;
    border: none;
    font-size: 18px;
    transition: background-color 0.3s;
  }
  .menu_close .cell{
    margin-right: 20px;
    border: 1px solid black;
  }
  .menu_close .exit{
    background-color: #dc3545;
    color: white;
  }
  .menu_close .cell:hover{
    background-color: black;
    color: white;
  }
  .menu_close .exit:hover{
    background-color: rgb(187,45,59);
  }
  .progress{
    display: flex;
    align-items: center;
  }
  .progress_bar{
    flex: 1;
    border-bottom: 0;
    position: relative;
    display: flex;
    height: 20px;
    overflow: hidden;
    font-size: 14px;
    background-color: #e9ecef;
    border-radius: 5px;
  }
  .level{
    width: 30px;
    height: 30px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .level img{
    width: 100%;
    position: absolute;
    vertical-align: middle;
  }
  .label{
    position: absolute;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    font-weight: 700;
    color: #fff;
  }
  .actual_progress{
    background: #d63384;
    transition-property: width;
    transition-timing-function: linear;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    transition: width .6s ease;
  }
  .funky{
    font-family: Luckiest Guy,Roboto,Helvetica Neue,Helvetica,Arial,sans-serif;
    font-weight: 400!important;
    letter-spacing: 1px;
    z-index: 1;
    text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;
    margin-top: 5px;
    color: white;
    font-size: 18px;
  }

  @keyframes msg {
    0%{
      transform: translateY(0);
      opacity: 0;
    }
    30%{
      transform: translatey(80px);
      opacity: 1;
    }
    100%{
      transform: translateY(80px);
      opacity: 1;
    }
  }
  @keyframes draw-shape {
    0% {
      stroke-dasharray: 760;
      stroke-dashoffset: 0;
      stroke: #18bc9c;
    }
    25% {
      stroke: #18bc9c;
    }
    26% {
      stroke: #ffc107;
    }
    73% {
      stroke: #dc3545;
    }
    74% {
      stroke: #ffc107;
    }
    75% {
      stroke: #dc3545;
    }
    76% {
      stroke: #ffc107;
    }
    77% {
      stroke: #dc3545;
    }
    78% {
      stroke: #ffc107;
    }
    79% {
      stroke: #dc3545;
    }
    80% {
      stroke: #ffc107;
    }
    81% {
      stroke: #dc3545;
    }
    80% {
      stroke: #ffc107;
    }
    81% {
      stroke: #dc3545;
    }
    82% {
      stroke: #ffc107;
    }
    83% {
      stroke: #dc3545;
    }
    84% {
      stroke: #ffc107;
    }
    85% {
      stroke: #dc3545;
      fill: transparent;
    }
    86% {
      fill: #dc3545;
    }
    87% {
      fill: transparent;
    }
    88% {
      fill: #dc3545;
    }
    89% {
      fill: transparent;
    }
    90% {
      fill: #dc3545;
    }
    91% {
      fill: transparent;
    }
    92% {
      fill: #dc3545;
    }
    93% {
      fill: transparent;
    }
    94% {
      fill: #dc3545;
    }
    95% {
      fill: transparent;
    }
    96% {
      fill: #dc3545;
    }
    100% {
      stroke-dasharray: 40 722;
      fill: #dc3545;
      stroke-dashoffset: -722;
    }
  }
</style>