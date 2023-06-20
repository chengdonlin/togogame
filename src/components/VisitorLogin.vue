<script setup>
import {computed, ref, getCurrentInstance} from "vue";
const {$axios, $layer} = getCurrentInstance().appContext.config.globalProperties

let visitorName = ref("")
let isDisabled = computed(()=>{
  return visitorName.value.length >= 3
})

function executeTouristLogin(){
  //TODO 执行游客登录，更新顶部导航头像信息
  //   emit("automaticSkip", props.gameType)
  $axios.get("/user/visitorLogin?name="+ visitorName.value).then(
      response =>{
        if(response.data.code === 200){
          $layer.msg("登录成功！")
          setTimeout(()=>{
            window.location.reload()
          },500)
        }
      }
  ).catch(
      err =>{
        console.log(err)
      }
  )
}
</script>

<template>
  <div class="visitor_login" >
    <div class="visitor_item">
      <h1 class="visitor_title">Who Are You？</h1>
      <input type="text" placeholder="昵称" maxlength="10" v-model="visitorName">
      <button :class="{'disabled': isDisabled}" @click="executeTouristLogin">继续</button>
    </div>
  </div>
</template>

<style scoped>
.visitor_login{
  padding: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.7);
  background-color: white;
  box-shadow: 0 11px 15px -7px #0003, 0 24px 38px 3px #00000024, 0 9px 46px 8px #0000001f;
  transition: transform 0.3s;
  pointer-events: none;
  opacity: 0;
  z-index: 99;
}
.visitor_item button{
  padding: 10px 15px;
  border-radius: 5px;
  border: none;
  color: white;
  background-color: rgb(105,211,191);
  font-size: 20px;
  font-weight: 600;
  pointer-events: none;
}
.visitor_item{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.visitor_title{
  font-weight: 400;
  margin-bottom: 20px;
}
.visitor_item input{
  text-align: center;
  padding: 15px ;
  font-size: 24px;
  border: none;
  border-radius: 5px;
  background-color: rgb(241,243,245);
  outline: none;
  font-weight: 600;
  margin-bottom: 20px;
}
.open_visitor{
  transform: translate(-50%, -50%) scale(1);
  pointer-events: auto;
  opacity: 1;
}
.disabled{
  pointer-events: auto!important;
  background-color: rgb(24,188,156)!important;
}
</style>