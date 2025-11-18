<template>
  <a-config-provider :locale="locale">
    <CSignature text="hhhyy" v-model="img" style="margin-top: 20px;"></CSignature>
  </a-config-provider>
</template>

<script setup>
  import zhCN from 'ant-design-vue/es/locale/zh_CN';
  import { ref } from 'vue';
  import CAvatar from './components/CAvatar.vue';
  import CSignature from './components/CSignature.vue'
  import testPng from './assets/images/test.jpg';

  const locale = ref(zhCN);
  const img = ref(testPng);
</script>

<style lang="less">
:root {
  --colorPrimary: #0082FF
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

@font-face {
  font-family: "Helvetica";
  src: url("./assets/fonts/Helvetica.ttc");
}

@font-face {
  font-family: "HelveticaNeue";
  src: url("./assets/fonts/HelveticaNeue.ttc");
}

@font-face {
  font-family: "PingFangSC";
  src: url("./assets/fonts/PingFang.ttc");
}

@font-face {
  font-family: "DINAlternate";
  src: url("./assets/fonts/DINAlternate.ttf");
}

@font-face {
  font-family: "YouSheBiaoTiHei";
  src: url("./assets/fonts/YouSheBiaoTiHei.ttf");
}
</style>
