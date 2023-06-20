<script setup>

</script>

<template>
<div class="contextual">
  <div class="header">
    <h1 class="mg">用户名</h1>
    <div class="mg">游客</div>
    <div class="user_img">
      <img src="">
    </div>
    <div class="close">
      <svg class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M614.69312 511.99872l308.08448 308.09088c18.9056 18.8992 18.9056 49.55008 0 68.45824l-34.22976 34.22976c-18.9056 18.90688-49.56032 18.90688-68.45952 0L511.99872 614.6944l-308.0896 308.0832c-18.90048 18.90688-49.55008 18.90688-68.45568 0l-34.23488-34.22976c-18.90432-18.90816-18.90432-49.56032 0-68.45824l308.08576-308.09088L101.21856 203.9104c-18.90432-18.90048-18.90432-49.55008 0-68.45952l34.23488-34.22976c18.9056-18.9056 49.5552-18.9056 68.45568 0L511.99872 409.3056 820.08832 101.22112c18.90048-18.9056 49.5552-18.9056 68.45952 0l34.22976 34.22976c18.9056 18.90944 18.9056 49.56416 0 68.45952L614.69312 511.99872 614.69312 511.99872zM614.69312 511.99872" fill="#ffffff"></path></svg>
    </div>
  </div>
  <div class="section">
    <div class="_options">
      <h4>五子棋</h4>
      <div class="">

        <span class="badge">
          <span class="me-1">级别</span>
          <span>9</span>
        </span>
        <div>
          <span class="success">10</span>
          /
          <span class="danger">4</span>
          /
          <span>1</span>
        </div>
      </div>
    </div>
    <div class="_options">
      <h4>象棋</h4>
      <div>
        <span>从未玩过</span>
      </div>
    </div>
    <div class="_options">
      <h4>井字棋</h4>
      <div>
        <span>从未玩过</span>
      </div>
    </div>
  </div>
  <div></div>
</div>
</template>

<style scoped>
.contextual{
  width: 300px;
  top: 0;
  right: 0;
  position: fixed;
  height: 100%;
  z-index: 900;
  transition: .4s;
  border: 1px solid;
  border-left: 1px solid #dee2e6;
  box-shadow: #001b3814 0 4px 16px;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  transform: translateX(320px);
}
.header{
  background: #2c3e50;
  color: white;
  padding: 20px;
  text-align: center;
}
.mg{
  margin-bottom: 10px;
}
.user_img{
  display: flex;
  justify-content: center;
}
.user_img img{
  width: 50%;
}
.close{
  width: 30px;
  height: 30px;
  position: absolute;
  top: 10px;
  right: 10px;
  transition: transform 1s;
}
.section{
  padding: 20px;
}
._options{
  margin-bottom: 20px;
}
h4{
  color: #343a40;
  margin-bottom: 5px;
  font-size: 30px;
}
.badge{
  color: #d63384;
  background-color: #dee2e6;
  display: inline-block;
  padding: 5px 10px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 3px;
  margin-bottom: 5px;
}
.me-1{
  margin-right: 5px;
}
.success{
  color: rgb(25,135,84);
}
.danger{
  color: rgb(220,53,69);
}
</style>