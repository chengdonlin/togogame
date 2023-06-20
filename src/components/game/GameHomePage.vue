<script setup>
import router from "@/router";
import {computed, defineEmits, getCurrentInstance, nextTick, ref, watch, defineAsyncComponent} from "vue";
import useMainSocket from "@/stores/mainSocket";
import useUserInfo from "@/stores/userInfo";
const TheCharts = defineAsyncComponent(()=> import("./TheCharts.vue"))
const mainSocket = useMainSocket()
const userInfo = useUserInfo()
const {$axios} = getCurrentInstance().appContext.config.globalProperties
let emit = defineEmits(["openCustomGames", "openVisitorLogin", "switch"])

let path = router.currentRoute.value.path.slice(1)
// let isVisitorShow = ref(false)
let gameType = computed(()=>{
  switch (path) {
    case "chess":
      return "象棋"
    case "gobang":
      return "五子棋"
  }
  return undefined
})
function createGame(operateType){
  //TODO 根据operateType判断游戏模式
  if(!userInfo.status){
    console.log("执行游客登录")
  // 未登录状态执行游客登录
    emit("openVisitorLogin", gameType.value)
  }else {
    mainSocket.type = path
    //判断游戏模式是否是 "在线模式"
    if(operateType === "online"){
      mainSocket.sendMessage({
        type: "StartMatching",
        data: {
          'gameType': path,
          gameMode: operateType
        }
      })
    }else {
      emit("openCustomGames", gameType.value)
    }
  }
}

//监听匹配状态
watch(()=> mainSocket.matchState, newValue => {
  switch (newValue){
    case 0:

      break
    case 1:

        break
    case 2:
      switch (mainSocket.type){
        case "gobang":
          emit("switch", "gameRoom")
          break
      }
      break
  }
})
//监听在线状态
watch(()=> userInfo.status, newValue => {
  if(newValue){
    getUserAssets()
  }
}, {immediate:true})
function getUserAssets(){
  console.log("获取等级信息")
  $axios.get(`/${path}/assets`).then(
      response =>{
        userInfo.userGameInfo = response.data.data
        nextTick(()=>{
          document.querySelector(".actual_progress").style.width = userInfo.userGameInfo.exp / userInfo.userGameInfo.grade + "%"
        })
      }
  ).catch(error =>{
    console.log(error)
  })
}

let imgPath = computed(()=>{
  return `../../assets/img/${path}.png`
})
</script>

<template>
  <div class="mode_cover">
      <div class="context">
        <div class="head_info">
          <h1 class="gameType">{{ gameType }}</h1>
          <div class="user_grade" v-if="userInfo.userGameInfo">
            <div class="progress">
              <div class="progress_bar">
                <span class="label">级别</span>
                <div class="actual_progress" style="width: 0;"></div>
              </div>
              <div class="level">
                <img src="../../assets/img/level.svg" alt="等级">
                <span class="funky">{{ userInfo.userGameInfo.grade }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="mode_top">
          <div class="genre_img">
            <img :src="require('@/assets/img/'+ path +'.png')" alt="游戏">
          </div>
          <ul class="control">
            <li @click="createGame('online')">在线玩</li>
            <li @click="createGame('LAN')">跟好友玩</li>
            <li @click="createGame('AI')">AI人机</li>
            <li @click="createGame('custom')">创建锦标赛</li>
          </ul>
        </div>
        <div class="mode_bottom">
          <h1>排行榜</h1>
        </div>
        <Suspense>
          <template v-slot:default>
            <TheCharts></TheCharts>
          </template>
          <template v-slot:fallback>
            <h1>稍等下~</h1>
          </template>
        </Suspense>
      </div>
  </div>
</template>

<style scoped>
  .genre_img img{
    width: 160px;
  }
  .mode_cover{
    width: 680px;
    height: 800px;
    margin: 0 auto;
    transform: translateY(40px);
    background-color: white;
    box-shadow: #001b3814 0 4px 16px;
  }
  .context{
    display: flex;
    flex-direction: column;
    padding: 20px;
  }
  .mode_top{
    display: flex;
    height: 180px;
  }
  .genre_img{
    width: 180px;
  }
  .control{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    flex: 1;
  }
  .control li{
    text-align: center;
    color: white;
    padding: 10px 50px;
    background-color: rgb(24,188,156);
    border-radius: 5px;
    cursor: pointer;
  }
  .control li:hover{
    background-color: rgb(59,198,171);
  }
  .mode_bottom {
    text-align: center;
    margin: 20px 0;
  }
  .gameType{
    text-align: center;
  }
  .head_info{
    display: flex;
    align-items: center;
    margin-bottom: 10px;
  }
  .user_grade{
    flex: 1;
    margin-left: 20px;
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

</style>