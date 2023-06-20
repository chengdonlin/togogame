<script setup>
  import { defineEmits } from "vue";

  const emit = defineEmits(["switch"])
  function openGamePage(event){
    if(event.target.className === "category"){
      emit("switch", event.target.getAttribute("data-type"))
    }
  }

</script>

<template>
  <div class="term game_list" @click="openGamePage">
    <div class="category" data-type="goBangPage">
      <div class="game_ground">
        <div class="gobang"></div>
      </div>
      <div class="game_name">
        <p class="dynamic_px">五子棋</p>
      </div>
    </div>
    <div class="category" data-type="chessPage">
      <div class="game_ground"></div>
      <div class="game_name">
        <p class="dynamic_px">象棋</p>
      </div>
    </div>
    <div class="category">
      <div class="game_ground"></div>
      <div class="game_name">
        <p class="dynamic_px">井字游戏</p>
      </div>
    </div>
    <div class="category">
      <div class="game_ground"></div>
      <div class="game_name">
        <p class="dynamic_px">其他</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .term{
    padding: 100px 0;
  }
  .game_list{
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
  .category{
    height: 5rem;
    width: 4rem;
    border: 10px solid rgb(44,62,80);
    background-color: rgb(44,62,80);
    margin: 20px;
    border-radius: 15px;
    overflow: hidden;
    position: relative;
    transition: transform 0.5s;
    box-sizing: border-box;
    cursor: pointer;
  }
  .game_ground{
    height: 3.5rem;
  }
  .game_ground img{
    max-width: 100%;
    height: auto;
  }
  .game_name{
    position: absolute;
    text-align: center;
    top: 3.5rem;
    bottom: 0;
    width: 100%;
  }
  .game_name p{
    font-size: 26px;
    color: white;
    transform: translateY(15px);
  }
  .category:hover{
    transform: scale(1.1);
  }
  .game_ground, .game_name{
    pointer-events: none;
  }
  .gobang{
    background-image: url("../../assets/img/gobang.png");
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    height: 100%;
  }
</style>