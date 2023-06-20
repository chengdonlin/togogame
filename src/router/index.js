import { createRouter, createWebHistory } from 'vue-router'
import GameList from "@/components/game/GameList.vue";
import GameHomePage from "@/components/game/GameHomePage.vue";
import GameRoom from "@/components/game/GameRoom.vue";
import GobangBoard from "@/components/game/GobangBoard.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
          path: "/",
          redirect: "/game"
        },
        {
            name: "game",
            path: "/game",
            component: GameList

        },
        {
            name: "chessPage",
            path: "/chess",
            component: GameHomePage,


        },
        {
            name: "goBangPage",
            path: "/gobang",
            component: GameHomePage
        },
        {
            name: "gameRoom",
            path: "/room",
            component: GameRoom,
            children: [
                {
                    name: "gobangBoard",
                    path: "gb",
                    component: GobangBoard
                }
            ]
        }
    ]
})

router.beforeEach((to, from, next)=>{
    if(to.matched[0].path === "/room" && window.location.pathname === to.path){
        console.log("游戏页面刷新")
    }
    next()
})

router.afterEach((to)=>{
    if(to.matched[0].path === "/room"){
        document.querySelector(".toolbar").classList.add("hide")
        document.querySelector(".main").classList.add("in-game")
    }else {
        document.querySelector(".toolbar").classList.remove("hide")
        document.querySelector(".main").classList.remove("in-game")
    }
})
export default router
