<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
</script>

<template>
  <div id="main-box">
    <div id="left">
      <router-link to="/kafka" class="menu-item"><span>Kafka</span></router-link>
      <router-link to="/rabbit" class="menu-item"><span>Rabbit</span></router-link>
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
    }
  }

  #right {
    flex: 6;
  }
}

</style>
