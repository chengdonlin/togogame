<script setup>
import {defineEmits, onMounted, ref} from 'vue'
import {storeToRefs} from "pinia";
import useUserInfo from "@/stores/userInfo";
import userMainSocket from "@/stores/mainSocket";
import router from "@/router";
const mainSocket = userMainSocket()

const userInfo = useUserInfo()
let session = ref(false)
let emits = defineEmits(["openMenu", "openLogin"])
let { user } = storeToRefs(userInfo)
let isShow = ref(false)

/**
 * 退出登录
 */
function exitLogin(){
  document.cookie = `token="";expires="-1"`
  sessionStorage.clear()
  window.location.reload()
}

/**
 * 初始化带上token调用自动登录功能
 */
onMounted(()=>{
  userInfo.getUserInfo().then(
      response =>{
        session.value = sessionStorage.getItem("state") === "在线"
        if(response){
          mainSocket.connectSocket()
        }
      }
  ).catch(error =>{
    console.log(error)
  })
})
</script>

<template>
  <div class="toolbar">
    <div class="mat_flat_btn" @click="emits('openMenu')">
      <span>
        <svg role="img" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="bars" class="svg-inline fa-bars" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M0 96C0 78.33 14.33 64 32 64H416C433.7 64 448 78.33 448 96C448 113.7 433.7 128 416 128H32C14.33 128 0 113.7 0 96zM0 256C0 238.3 14.33 224 32 224H416C433.7 224 448 238.3 448 256C448 273.7 433.7 288 416 288H32C14.33 288 0 273.7 0 256zM416 448H32C14.33 448 0 433.7 0 416C0 398.3 14.33 384 32 384H416C433.7 384 448 398.3 448 416C448 433.7 433.7 448 416 448z"></path></svg>
      </span>
    </div>
    <a class="mat_flat_btn mat_hide">
      <span class="mat_text" @click="router.push('/game')">游戏</span>
      <span class="mat_btn_ripple"></span>
    </a>
    <a class="mat_flat_btn mat_hide">
      <span class="mat_text">商店</span>
      <span class="mat_btn_ripple"></span>
    </a>
    <a class="mat_flat_btn mat_hide">
      <span class="mat_text">其他</span>
      <span class="mat_btn_ripple"></span>
    </a>
    <span class="flex_grow_1"></span>
    <a class="mat_flat_btn mat_right mat_hide" v-if="session">
      <span class="mat_text">
        <svg role="img" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user-group" class="svg-inline user-group" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M224 256c70.7 0 128-57.31 128-128S294.7 0 224 0C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3c-95.73 0-173.3 77.6-173.3 173.3C0 496.5 15.52 512 34.66 512H413.3C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304zM479.1 320h-73.85C451.2 357.7 480 414.1 480 477.3C480 490.1 476.2 501.9 470 512h138C625.7 512 640 497.6 640 479.1C640 391.6 568.4 320 479.1 320zM432 256C493.9 256 544 205.9 544 144S493.9 32 432 32c-25.11 0-48.04 8.555-66.72 22.51C376.8 76.63 384 101.4 384 128c0 35.52-11.93 68.14-31.59 94.71C372.7 243.2 400.8 256 432 256z"></path></svg>
      </span>
    </a>
    <a class="mat_flat_btn mat_right" v-if="session">
      <span class="mat_text">
        <svg role="img" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="comment" class="svg-inline fa-comment" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M256 32C114.6 32 .0272 125.1 .0272 240c0 49.63 21.35 94.98 56.97 130.7c-12.5 50.37-54.27 95.27-54.77 95.77c-2.25 2.25-2.875 5.734-1.5 8.734C1.979 478.2 4.75 480 8 480c66.25 0 115.1-31.76 140.6-51.39C181.2 440.9 217.6 448 256 448c141.4 0 255.1-93.13 255.1-208S397.4 32 256 32z"></path></svg>
      </span>
    </a>
    <a class="mat_flat_btn mat_right" v-if="session" @click.stop="isShow = true">
      <span class="mat_text user_info">
        <div class="user_img">
          <img src="../assets/img/user1.jpg" alt="用户头像" class="home_user_img" style="width: 100%; transition: transform 0.5s;"/>
        </div>
        <div class="info">
          <div>{{ user.name }}</div>
          <div>
            {{ user.gold }}
            <svg role="img" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="coins" class="fa-coins" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M512 80C512 98.01 497.7 114.6 473.6 128C444.5 144.1 401.2 155.5 351.3 158.9C347.7 157.2 343.9 155.5 340.1 153.9C300.6 137.4 248.2 128 192 128C183.7 128 175.6 128.2 167.5 128.6L166.4 128C142.3 114.6 128 98.01 128 80C128 35.82 213.1 0 320 0C426 0 512 35.82 512 80V80zM160.7 161.1C170.9 160.4 181.3 160 192 160C254.2 160 309.4 172.3 344.5 191.4C369.3 204.9 384 221.7 384 240C384 243.1 383.3 247.9 381.9 251.7C377.3 264.9 364.1 277 346.9 287.3C346.9 287.3 346.9 287.3 346.9 287.3C346.8 287.3 346.6 287.4 346.5 287.5L346.5 287.5C346.2 287.7 345.9 287.8 345.6 288C310.6 307.4 254.8 320 192 320C132.4 320 79.06 308.7 43.84 290.9C41.97 289.9 40.15 288.1 38.39 288C14.28 274.6 0 258 0 240C0 205.2 53.43 175.5 128 164.6C138.5 163 149.4 161.8 160.7 161.1L160.7 161.1zM391.9 186.6C420.2 182.2 446.1 175.2 468.1 166.1C484.4 159.3 499.5 150.9 512 140.6V176C512 195.3 495.5 213.1 468.2 226.9C453.5 234.3 435.8 240.5 415.8 245.3C415.9 243.6 416 241.8 416 240C416 218.1 405.4 200.1 391.9 186.6V186.6zM384 336C384 354 369.7 370.6 345.6 384C343.8 384.1 342 385.9 340.2 386.9C304.9 404.7 251.6 416 192 416C129.2 416 73.42 403.4 38.39 384C14.28 370.6 .0003 354 .0003 336V300.6C12.45 310.9 27.62 319.3 43.93 326.1C83.44 342.6 135.8 352 192 352C248.2 352 300.6 342.6 340.1 326.1C347.9 322.9 355.4 319.2 362.5 315.2C368.6 311.8 374.3 308 379.7 304C381.2 302.9 382.6 301.7 384 300.6L384 336zM416 278.1C434.1 273.1 452.5 268.6 468.1 262.1C484.4 255.3 499.5 246.9 512 236.6V272C512 282.5 507 293 497.1 302.9C480.8 319.2 452.1 332.6 415.8 341.3C415.9 339.6 416 337.8 416 336V278.1zM192 448C248.2 448 300.6 438.6 340.1 422.1C356.4 415.3 371.5 406.9 384 396.6V432C384 476.2 298 512 192 512C85.96 512 .0003 476.2 .0003 432V396.6C12.45 406.9 27.62 415.3 43.93 422.1C83.44 438.6 135.8 448 192 448z"></path></svg>
          </div>
        </div>
      </span>
      <div class="personal_menu" v-if="isShow">
        <div class="mask" @click.stop="isShow = false"></div>
        <div class="menu_content">
          <div class="menu_cover">
            <div class="menu_item">
              <span class="btn">保存账户</span>
            </div>
            <a class="menu_item">
              <span style="sp">我的账户</span>
            </a>
            <a class="menu_item">
              <span>我的资料</span>
            </a>
            <a class="menu_item">
              <span>更改头像</span>
            </a>
            <a class="menu_item" @click.stop="exitLogin">
              <span>退出登录</span>
            </a>
          </div>
        </div>
      </div>
    </a>
    <button class="login" v-if="!session" @click="emits('openLogin')">登录</button>
  </div>
</template>

<style scoped>
  .toolbar{
    position: fixed;
    display: flex;
    top: 0;
    height: 64px;
    padding: 0 10px;
    width: 100%;
    align-items: center;
    box-shadow: #001b3814 0 4px 16px;
    z-index: 88;
    box-sizing: border-box;
  }
  .flex_grow_1{
    flex-grow: 1!important;
  }
  .mat_flat_btn{
    position: relative;
    display: inline-block;
    height: 40px;
    line-height: 40px;
    padding: 0 16px;
    text-align: center;
    border-radius: 3px;
  }
  .mat_btn_ripple{
    opacity: 0;
    inset: 0;
    position: absolute;
    pointer-events: none;
    border-radius: inherit;
    background-color: rgba(225, 225, 225, 0.6);
  }
  .mat_text{
    position: relative;
    z-index: 9;
  }
  .mat_flat_btn:hover .mat_btn_ripple{
    opacity: 1;
  }
  .svg-inline{
    height: .4rem;
    width: .4rem;
    vertical-align: text-top;
  }
  .login{
    border: 1px solid;
    border-radius: 5px;
    padding: 10px 20px;
    background-color: white;
  }
  .login:hover{
    background-color: rgb(24,188,156);
    color: white;
  }
  .user_img{
    width: 40px;
    overflow: hidden;
    height: 40px;
    border-radius: 50%;
  }
  .user_img:hover img{
    transform: scale(1.5);
  }
  .user_info{
    display: flex;
  }
  .info{
    text-align: left;
    margin-left: 10px;
    line-height: 19px;
  }
  .info div{
    font-size: 14px;
  }
  .fa-coins{
    vertical-align: middle;
    width: 14px;
  }
  .personal_menu{
    position: absolute;
    top: 40px;
    z-index: 50;
  }
  .menu_content{
    overflow: auto;
    position: relative;
    border-radius: 4px;
    outline: 0;
    box-shadow: 0 2px 4px -1px #0003, 0 4px 5px #00000024, 0 1px 10px #0000001f;
    background: #fff;
  }
  .menu_cover{
    padding: 8px 0;
    display: flex;
    flex-direction: column;
  }
  .menu_item{
    height: 48px;
    border: none;
    padding: 0 16px;
    line-height: 48px;
  }
  .menu_item .btn{
    display: inline-block;
    font-weight: 400;
    line-height: 1.5;
    text-align: center;
    text-decoration: none;
    border-radius: 5px;
    background-color: #18bc9c;
    padding: 5px 10px;
    color: white;
    white-space: nowrap;
  }
  .menu_item:hover{
    background-color: rgb(247,247,247);
  }
  .personal_menu .mask{
    position: fixed;
    inset: 0;
    cursor: auto;
  }
</style>