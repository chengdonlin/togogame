<script setup>
import {getCurrentInstance, ref} from "vue";
const {$axios} = getCurrentInstance().appContext.config.globalProperties
let charts = ref(null)
$axios.get("/gobang/gameTop").then(
    response =>{
      if(response.data.code === 200){
        charts.value = response.data.data
      }
    }
)
</script>

<template>
<div class="leaderboard_container">
  <div class="leaderboard">
    <table>
      <tr class="small">
        <th colspan="3">近30天综合排名</th>
        <th class="mat-tooltip-trigger pe-4">赢/输/平</th>
        <th >得分</th>
      </tr>
      <tr class="leaderboard_item" v-for="(item, index) in charts" :key="index">
        <td>
          <span>{{ index }}.</span>
        </td>
        <td>
          <div class="medium">

          </div>
        </td>
        <td class="info">
          <div>
            <span>{{ item.userDto.name }}</span>
          </div>
        </td>
        <td class="charts pe-4">
          <div>
            <span class="success">1</span>
            /
            <span class="danger">2</span>
            /
            <span>0</span>
          </div>
        </td>
        <td>{{ item.rank }}</td>
      </tr>
    </table>
  </div>
</div>
</template>

<style scoped>
.leaderboard_container{
}
.leaderboard{
  height: 410px;
  overflow-y: scroll;
  box-sizing: border-box;
}
.leaderboard::-webkit-scrollbar-track {
  border-radius: 4px;
  background-color: #dee1e6;
}

/*定义滑块 内阴影+圆角*/
.leaderboard::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background-color: rgb(190, 186, 186);
}
.leaderboard::-webkit-scrollbar { width: 0!important }
table{
  width: 100%;
  position: relative;
  caption-side: bottom;
  border-collapse: collapse;
}
.small{
  color: #868e96;
  font-weight: 700;
  text-align: center;
}
th, td{
  border-color: inherit;
  border-style: solid;
  border-width: 0;
}
td{
  padding: 5px;
}
.medium{
  width: 36px;
  height: 36px;
}
.info{
  width: 100%;
}
.charts{
  white-space: nowrap;
  text-align: right;
  padding-right: 10px;
  font-weight: 300;
}
.charts div{
  overflow: hidden;
}
.success{
  color: rgb(25, 135, 84);
}
.danger{
  color: rgb(220, 53, 69);
}

</style>