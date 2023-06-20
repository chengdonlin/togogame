<script setup>
import router from "@/router";
import {computed, ref} from "vue";
import useMainSocket from "@/stores/mainSocket";
import Toolbar from "@/components/Toolbar.vue";
import CustomGames from "@/components/game/CustomGames.vue";
import NavMenu from "@/components/NavMenu.vue";
import LoginAndRegistration from "@/components/LoginAndRegistration.vue";
import VisitorLogin from "@/components/VisitorLogin.vue";
import UserInfo from "@/components/UserInfo.vue";

let GameType = ref("")
let maskEnable = ref(false)
let customGameEnable = ref(false)
let navMenuEnable = ref(false)
let loginEnable = ref(false)
let visitorLoginEnable = ref(false)
let leaveRoomEnable = ref(false)
let infoEnable = ref(false)
const mainSocket = useMainSocket()

/**
 * 切换路由
 * @param name {String} 路由名称
 */
function switchPath(name){
  router.push({
    name: name
  })
}
/**
 * 打开左侧菜单
 */
function openMenuPage(){
  maskEnable.value = true
  navMenuEnable.value = true
}
/**
 * 关闭所有弹出层
 */
function closeSuspensionComponent(){
  customGameEnable.value = false
  navMenuEnable.value = false
  maskEnable.value = false
  loginEnable.value = false
  visitorLoginEnable.value = false
  leaveRoomEnable.value = false
}
/**
 * 打开游戏配置界面
 * @param gameType {String} 游戏类型
 */
function openCustomGamesPage(gameType){
  GameType.value = gameType
  customGameEnable.value = true
  maskEnable.value = true
}
/**
 * 打开登录界面
 */
function openLoginPage(){
  maskEnable.value = true
  loginEnable.value = true
}
/**
 * 打开游客登录界面
 * @param gameType {String} 游戏类型
 */
function openVisitorLoginPage(gameType){
  GameType.value = gameType
  maskEnable.value = true
  visitorLoginEnable.value = true
}
function unMatch(){
  mainSocket.sendMessage({
    type: "UnMatch"
  })
}
let state = computed(()=>{
  return mainSocket.matchState === 1
})
</script>

<template>
  <Toolbar
      @openMenu="openMenuPage"
      @openLogin="openLoginPage">
  </Toolbar>
  <div class="main">
    <router-view
        @switch="switchPath"
        @openCustomGames="openCustomGamesPage"
        @openVisitorLogin="openVisitorLoginPage">
    </router-view>
    <div class="main_info">
        <img src="https://papergames.io/zh/assets/images/banners/subscription-video-poster.jpg" loading="lazy" alt="Gruppo plan" class="img-fluid">
        <ul>
          <li>联系我们</li>
          <li>关注我们</li>
        </ul>
    </div>
    <div class="main_footer">
      <a href="http://beian.miit.gov.cn/" target="_blank">蜀ICP备2023008851号-1</a>
    </div>
  </div>
  <div class="mask"
       :class="{mask_animation: maskEnable || state || mainSocket.networkStatus === -1}"
       @click="closeSuspensionComponent">
  </div>
  <CustomGames
      :class="{CustomGames_animation: customGameEnable}"
      @closeSuspension="closeSuspensionComponent"
      @switch="switchPath"
      :gameType="GameType">
  </CustomGames>
  <NavMenu
      :class="{NavMenu_animation: navMenuEnable}">
  </NavMenu>
  <LoginAndRegistration
      :class="{login_animation: loginEnable}"
      @closeLogin="closeSuspensionComponent">
  </LoginAndRegistration>
  <VisitorLogin
      :class="{open_visitor: visitorLoginEnable}">
  </VisitorLogin>
  <UserInfo :class="{info_show: infoEnable}" v-if="infoEnable"></UserInfo>
  <div class="matching" :class="{'enable': state}">
    <img src="../assets/img/loading_big.gif" height="245" width="245" alt="加载中"/>
    <button @click="unMatch">取消匹配</button>
  </div>
  <div class="disconnection" :class="{'enable': mainSocket.networkStatus === -1}">
    <img src="../assets/img/wait.gif" height="50" width="50" alt="等待"/>
    <button @click="mainSocket.networkStatus = 0" >取消重连</button>
  </div>

</template>

<style scoped>
  .main{
    margin-top: 64px;
    position: absolute;
    inset: 0;
    overflow-y: scroll;
    background-color: rgb(248,249,250);
  }
  .mask{
    z-index: 99;
    position: absolute;
    inset: 0;
    background-color: #000000;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .mask_animation{
    opacity: 0.5;
    pointer-events: auto;
  }
  .matching, .disconnection {
    position: absolute;
    display: flex;
    flex-direction: column;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
    z-index: 99;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: transparent;
    align-items: center;

  }
  .matching img{
    border-radius: 50%;
    box-shadow: 0 11px 15px -7px #0003, 0 24px 38px 3px #00000024, 0 9px 46px 8px #0000001f;
  }
  .matching button{
    border: none;
    padding: 10px 20px;
    width: 200px;
    background-color: transparent;
    color: white;
    border-radius: 10px;
    margin-top: 50px;
  }
  .enable{
    opacity: 1;
    pointer-events: auto;
  }
  .info_show{
    transform: translateX(0);
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
    background-color: #dee1e6;
  }
  .main_info{
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    align-items: center;
    flex-direction: column;
    margin-top: inherit;
  }
  .main_info ul{
    display: flex;
    padding: 30px 0;
    justify-content: center;
  }
  .main_info ul li{
    padding: 10px 30px;
  }
  .main_footer{
    padding: 50px 0;
    text-align: center;
    background-color: rgba(0, 0, 0, 0.05);
  }
  .main_footer a{
    color: black;
  }
  .img{
  }
  .img-fluid{
    width: 10rem;
  }
</style>