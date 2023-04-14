<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
import {router} from "./router";

const routes = router.getRoutes();
const currentRoute = router.currentRoute;

function currentMenu(name: string): string {
    if (name == currentRoute.value.name) {
        return 'currentMenu'
    }
    return ''
}

</script>

<template>
    <div id="main-box">
        <div id="left">
            <router-link v-for="item in routes" :to="item.path" class="menu-item" :key="item.name"
                         :class="currentMenu(item.name as string)"
            >
                <span>{{ item.name }}</span></router-link>
        </div>
        <div id="right">
            <router-view/>
        </div>
    </div>
</template>

<style lang="scss">

#main-box {
  display: flex;
  height: 100%;
  text-align: center;
  justify-content: space-around;
  align-items: stretch;

  #left {
    flex: 1;
    display: flex;
    text-align: center;
    flex-direction: column;
    justify-content: center;
    align-items: stretch;
    border-right: solid 1px #110b0c;

    .menu-item {
      flex: 1;
      display: flex;
      color: hsl(285, 100%, 37%);
      align-items: center;
      justify-content: center;

      &:hover {
        background-color: #fff;
        border-radius: 20px;
        color: aqua;
      }

      &.currentMenu {
        background-color: #fff;
        border-radius: 20px;
        color: aqua;
      }
    }
  }

  #right {
    flex: 6;
  }
}

</style>
