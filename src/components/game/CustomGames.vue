<script setup>
import {defineEmits, defineProps, reactive, toRaw, toRefs} from "vue"
import useMainSocket from "@/stores/mainSocket";
let Main = useMainSocket()
const emit = defineEmits(["closeSuspension", "switch"])
const props = defineProps(["gameType"])
const {gameType} = toRefs(props)
let gameConfig = reactive({
  stepTime: "10秒",
  firstPlayer: "随机",
  playerTime: "2分钟",
  regretChess: false
})

let { stepTime, firstPlayer, playerTime, regretChess} = toRefs(gameConfig)
function optionExpand(event){
  event.target.nextSibling.classList.add("expand")
}
function optionRetract(event){
  setTimeout(()=>{
    event.target.nextSibling.classList.remove("expand")
  },100)
}

function playGame(){
  //TODO 创建游戏配置对象，发送服务器。加载对应游戏

  Main.sendMessage({
    type: "MatchAi",
    data: {
      'gameType': Main.type,
      'config': pretreatment(toRaw(gameConfig))
    }
  })

  emit("closeSuspension")
    //接收到服务器响应的信息后打开游戏界面
  emit("switch", "gameRoom")
}

function pretreatment(data){
  console.log(data);
  return {
    "stepTime": parseInt(data["stepTime"]),
    "firstPlayer": data["stepTime"] === "随机"? 0 : data["stepTime"] === "我先开始"? 1 : 2,
    "playerTime": parseInt(data["playerTime"]) * 60,
    "regretChess": data["regretChess"]
  }

}


function timePerRoundSelect(event){
  stepTime.value = event.target.innerText
}
function firstPlayerSelect(event){
  firstPlayer.value = event.target.innerText
}
function playerTimeSelect(event){
  playerTime.value = event.target.innerText
}
</script>

<template>
  <div class="custom">
    <div class="use_Options">
      <div class="close" @click="emit('closeSuspension')">
        <svg t="1686105168168" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3318"><path d="M614.69312 511.99872l308.08448 308.09088c18.9056 18.8992 18.9056 49.55008 0 68.45824l-34.22976 34.22976c-18.9056 18.90688-49.56032 18.90688-68.45952 0L511.99872 614.6944l-308.0896 308.0832c-18.90048 18.90688-49.55008 18.90688-68.45568 0l-34.23488-34.22976c-18.90432-18.90816-18.90432-49.56032 0-68.45824l308.08576-308.09088L101.21856 203.9104c-18.90432-18.90048-18.90432-49.55008 0-68.45952l34.23488-34.22976c18.9056-18.9056 49.5552-18.9056 68.45568 0L511.99872 409.3056 820.08832 101.22112c18.90048-18.9056 49.5552-18.9056 68.45952 0l34.22976 34.22976c18.9056 18.90944 18.9056 49.56416 0 68.45952L614.69312 511.99872 614.69312 511.99872zM614.69312 511.99872" fill="#272636" p-id="3319"></path></svg>
      </div>
      <ul class="context">
        <li>
          <h1>{{ gameType }}</h1>
        </li>
        <li>
          <p class="title">每轮游戏时间</p>
          <div class="_select">
            <input type="text" readonly class="_input" :value="stepTime"
                   @focus="optionExpand"
                   @blur="optionRetract"
            />
            <ul class="_options" @click="timePerRoundSelect">
              <li class="checked">10秒</li>
              <li>20秒</li>
              <li>30秒</li>
              <li>1000秒</li>
            </ul>
          </div>
        </li>
        <li>
          <p class="title">每位玩家的分钟数</p>
          <div class="_select">
            <input type="text" readonly class="_input" :value="playerTime"
                   @focus="optionExpand"
                   @blur="optionRetract"
            />
            <ul class="_options" @click="playerTimeSelect">
              <li class="checked" :data-time="60 * 2">2分钟</li>
              <li>5分钟</li>
              <li>10分钟</li>
              <li>15分钟</li>
            </ul>
          </div>
        </li>
        <li>
          <p class="title">谁先玩?</p>
          <div class="_select">
            <input type="text" readonly class="_input" :value="firstPlayer"
                   @focus="optionExpand"
                   @blur="optionRetract"
            />
            <ul class="_options" @click="firstPlayerSelect">
              <li class="checked">随机</li>
              <li>我先开始</li>
              <li>对方先开始</li>
            </ul>
          </div>
        </li>
        <li class="regret_term">
          <p class="title">悔棋</p>
          <label class="toggle-switch">
            <input type="checkbox" v-model="regretChess">
            <div class="toggle-switch-background">
              <div class="toggle-switch-handle"></div>
            </div>
          </label>
        </li>
        <li>
          <button class="play_game" @click="playGame">开始游戏</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
  .CustomGames_animation{
    transform: scale(1)!important;
    opacity: 1!important;
    pointer-events: auto!important;
  }
  .custom{
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;
    transform: scale(.7);
    transition: transform 0.3s;
    z-index: 99;
    opacity: 0;
    pointer-events: none;
  }
  .close{
    width: 30px;
    height: 30px;
    position: absolute;
    top: 10px;
    right: 10px;
    transition: transform 1s;
  }
  .close:hover{
    transform: rotate(720deg);
  }
  .use_Options{
    box-shadow: 0 11px 15px -7px #0003, 0 24px 38px 3px #00000024, 0 9px 46px 8px #0000001f;
    position: absolute;
    z-index: 99;
    width: 400px;
    background-color: white;
    border-radius: 5px;
    padding: 20px;
  }
  .context{
    height: auto;
    min-width: 290px;
  }
  .context>li{
    margin: 20px 0;
  }
  .context>li:first-child{
    margin-top: 0;
  }
  .context>li:last-child{
    text-align: center;
  }
  .title{
    font-size: 20px;
    margin-bottom: 10px;
  }
  ._select, ._input{
    font-size: 20px;
    width: 100%;
  }
  ._input, ._options{
    box-sizing: border-box;
  }
  ._select{
    position: relative;
  }
  ._input{
    padding: 10px;
    outline: none;
    cursor: pointer;
    border-radius: 5px;
    border: 1px solid;
  }
  ._options{
    width: 100%;
    box-shadow: 0 0 3px #707070;
    cursor: pointer;
    position: absolute;
    background-color: white;
    overflow: hidden;
    height: 0;
    transition: height 0.5s;
    z-index: 10;
  }
  ._options li {
    padding: 10px;
  }
  ._options li:hover{
    background-color: rgb(247,247,247);
  }
  ._options .checked{
    background-color: rgb(229,229,229)!important;
  }
  ._select:after {
    position: absolute;
    content: "";
    right: 15px;
    top: 20px;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 6px solid;
  }
  .play_game{
    border: 0;
    padding: 10px 30px;
    font-size: 20px;
    background-color: rgb(24,188,156);
    border-radius: 5px;
    color: white;
  }
  .play_game:hover{
    background-color: rgb(59,198,171);
  }

  .regret_term{
    display: flex;
    align-items: center;
  }
  .regret_term p{
    margin-bottom: 0;
  }
  .expand{
    height: auto;
  }
  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 80px;
    height: 40px;
    cursor: pointer;
    margin-left: 20px;
  }

  .toggle-switch input[type="checkbox"] {
    display: none;
  }

  .toggle-switch-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #ddd;
    border-radius: 20px;
    box-shadow: inset 0 0 0 2px #ccc;
    transition: background-color 0.3s ease-in-out;
  }

  .toggle-switch-handle {
    position: absolute;
    top: 5px;
    left: 5px;
    width: 30px;
    height: 30px;
    background-color: #fff;
    border-radius: 50%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease-in-out;
  }

  .toggle-switch::before {
    content: "";
    position: absolute;
    top: -25px;
    right: -35px;
    font-size: 12px;
    font-weight: bold;
    color: #aaa;
    text-shadow: 1px 1px #fff;
    transition: color 0.3s ease-in-out;
  }

  .toggle-switch input[type="checkbox"]:checked + .toggle-switch-handle {
    transform: translateX(45px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2), 0 0 0 3px #05c46b;
  }

  .toggle-switch input[type="checkbox"]:checked + .toggle-switch-background {
    background-color: #05c46b;
    box-shadow: inset 0 0 0 2px #04b360;
  }

  .toggle-switch input[type="checkbox"]:checked + .toggle-switch:before {
    content: "On";
    color: #05c46b;
    right: -15px;
  }

  .toggle-switch input[type="checkbox"]:checked + .toggle-switch-background .toggle-switch-handle {
    transform: translateX(40px);
  }

</style>