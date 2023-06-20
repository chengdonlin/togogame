<script setup>

import router from "@/router";
</script>

<template>
  <div class="nav_menu">
    <div class="context">
      <div class="logo">logo图片</div>
      <ul class="menu_list">
        <li class="mat_show" @click="router.push('/game')">游戏</li>
        <li class="mat_show">好友</li>
        <li class="mat_show">商店</li>
        <li>常见问题</li>
        <li>联系我们</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
  .NavMenu_animation{
    transform: translateX(0)!important;
  }
  .nav_menu{
    position: fixed;
    z-index: 99;
    left: 0;
    top: 0;
    width: 320px;
    height: 100%;
    background-color: white;
    transition: transform 0.3s;
    transform: translateX(-320px);
  }
  .context{

  }
  .logo{
    padding: 20px;
    height: 60px;
  }
  .menu_list li{
    padding: 20px;
  }
  .menu_list li:hover{
    background-color: rgb(247,247,247);
  }
  .mat_show{
    display: none;
  }
</style>