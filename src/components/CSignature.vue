<template>
  <div>
    <div class="img-box" v-if="modelValue" @click="handleOpen">
      <img :src="modelValue"></img>
      <CloseCircleFilled v-if="!disabled" @click.stop="clickDelete" class="delete-icon" />
    </div>


    <a-button v-else type="dashed" :icon="h(PlusOutlined)" :disabled="disabled" @click="handleClick">签名</a-button>
    <a-modal v-model:open="open" title="请使用手机扫码签名" width="440px" class="qr-modal" :maskClosable="false" :footer="null">
      <template v-if="status !== 'done'">
        <div class="box-wrapper">
          <canvas ref="qrRef" v-show="status !== 'timeout'" class="qr-canvas"></canvas>
          <div v-if="status === 'timeout'" class="error-box">
            <img src="./qr_error.png" class="position-mid" />
          </div>
          <div v-if="!['success', 'success2'].includes(status)" class="cover position-mid"></div>
          <CheckCircleFilled v-if="status === 'signing'" class="position-mid success" />
          <div v-else-if="['timeout', 'todo'].includes(String(status))" class="position-mid refresh"
            @click="clickRefresh">
            <svg xmlns="http://www.w3.org/2000/svg" width="42" height="36" viewBox="0 0 42 36">
              <path fill-rule="nonzero"
                d="M28.574 29.205a13.02 13.02 0 0 1-8.921 2.408c-.148-.014-.293-.04-.443-.06-.285-.039-.569-.075-.845-.132a10 10 0 0 1-.507-.118q-.407-.09-.806-.211-.186-.061-.38-.13a13 13 0 0 1-2.118-.933l-.044-.023a13.6 13.6 0 0 1-3.884-3.279c-.053-.065-.103-.138-.156-.206A13.8 13.8 0 0 1 7.54 18h3.1c.083 0 .16-.047.198-.122a.22.22 0 0 0-.011-.23L5.622 9.644a.222.222 0 0 0-.376 0L.038 17.646a.22.22 0 0 0-.01.231.23.23 0 0 0 .197.122h3.1c0 3.789 1.154 7.299 3.111 10.2.025.042.042.085.067.124.204.296.43.572.647.854.08.105.159.215.242.319.321.4.661.77 1.012 1.139l.098.101a17.3 17.3 0 0 0 5.347 3.736l.323.147c.371.157.756.296 1.138.428.18.062.36.127.543.183.338.102.68.186 1.026.271.232.056.457.116.694.16.095.023.187.051.285.066.326.059.652.093.981.132l.351.05A17.15 17.15 0 0 0 31 32.742a2.19 2.19 0 0 0 .518-3.006 2.075 2.075 0 0 0-2.944-.53M38.495 18A18.2 18.2 0 0 0 35.398 7.82c-.03-.05-.05-.102-.078-.144a19 19 0 0 0-.77-1.015l-.091-.121a17.4 17.4 0 0 0-6.563-5.05l-.209-.098a22 22 0 0 0-1.235-.465c-.159-.051-.306-.108-.462-.153a16 16 0 0 0-1.104-.293c-.204-.048-.41-.101-.62-.144-.102-.02-.197-.05-.3-.07-.28-.05-.558-.07-.837-.107-.19-.026-.382-.057-.574-.076a18 18 0 0 0-1.394-.07c-.083 0-.167-.015-.254-.015a17.17 17.17 0 0 0-10.083 3.256 2.19 2.19 0 0 0-.521 3.009c.318.468.809.788 1.363.887.553.1 1.123-.03 1.58-.36a13.07 13.07 0 0 1 8.935-2.408l.355.05q.48.056.945.147c.136.026.273.062.407.093.303.071.61.147.906.237l.278.099c.34.113.672.234 1.001.375l.103.048c1.966.865 3.691 2.199 5.038 3.868l.025.034A13.8 13.8 0 0 1 34.275 18h-3.097a.22.22 0 0 0-.2.12.23.23 0 0 0 .013.233l5.21 7.998a.222.222 0 0 0 .374 0l5.204-7.998a.226.226 0 0 0 .083-.434.22.22 0 0 0-.27.081h-3.097z" />
            </svg>
          </div>
        </div>
        <div class="tip">{{ statusMap[status] }}</div>
      </template>
      <template v-else>
        <img :src="modelValue" style="height: 172px;">
        <div class="btns" v-if="!disabled" style="margin-top: 24px;">
          <a-button @click="handleClick">重新签名</a-button>
          <a-button @click="() => open = false" style="margin-left: 16px;" type="primary">确定</a-button>
        </div>
      </template>
    </a-modal>
  </div>

</template>

<script setup>
  import { h, ref, nextTick, watch } from 'vue'
  import { PlusOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons-vue';
  import QRCode from 'qrcode';
  const props = defineProps({
    disabled: { type: Boolean, default: false },
    modelValue: { type: String, default: '' },
    refreshTime: { type: Number, default: 1500 },
    text: { type: [String, Number], default: '' },
    expiryTime: { type: Number, default: 30000 }
  });

  const emits = defineEmits(['update:modelValue'])


  const status = ref('todo')
  const statusMap = ref({
    todo: '二维码未成功生成,请刷新再试',
    success: '请使用手机扫码进行手写签名',
    signing: '已扫码,签名中',
    timeout: '二维码已超时,请刷新后再扫码',
    success2: '重新扫码签名',
    // done
  })
  const qrRef = ref('')
  function generateQR(text, successStatus) {
    const dom = qrRef.value
    QRCode.toCanvas(dom, text, {
      width: dom.clientWidth,
      margin: 0.5,
      scale: 1
    }, (error) => {
      status.value = error ? 'todo' : successStatus
      refreshStatus()
      updateExpiry()
    });
  }

  let refreshTid = ''
  let expiryTid = ''

  function updateExpiry() {
    if (expiryTid) {
      clearTimeout(expiryTid)
    }
    if (!['0', '1'].includes(String(status.value))) return
    if (props.expiryTime) {
      expiryTid = setTimeout(() => {
        if (refreshTid) {
          clearInterval(refreshTid)
        }
        status.value = 'timeout'
        const dom = qrRef.value
        QRCode.toCanvas(dom, '二维码已过期', {
          width: dom.clientWidth,
          margin: 0.5,
          scale: 1
        })

      }, props.expiryTime)
    }
  }

  function refreshStatus() {
    if (refreshTid) {
      clearInterval(refreshTid)
    }
    if (!['0', '1'].includes(String(status.value))) return

    refreshTid = setInterval(() => {
      // TODO 更新状态
      console.log('refreshStatus')
      refreshStatus()
    }, props.refreshTime)
  }



  const open = ref(false)
  function handleClick() {
    open.value = true
    status.value = ''
    nextTick(() => {
      generateQR(props.text, 'success')
    })
  }
  function clickRefresh() {
    generateQR(props.text, 'success2')
  }

  function handleOpen() {
    open.value = true
    status.value = 'done'
  }


  function clickDelete() {
    emits('update:modelValue', '')
  }
  watch(() => open.value, (v) => {
    if (!v) {
      if (refreshTid) {
        clearInterval(refreshTid)
      }
      if (expiryTid) {
        clearTimeout(expiryTid)
      }
    }
  })
</script>

<style lang="less" scoped>
.box-wrapper {
  height: 208px;
  width: 208px;
  position: relative;
}

.img-box {
  width: 143px;
  height: 40px;
  background: #FFFFFF;
  border-radius: 3px;
  border: 1px solid #D7D7D7;
  position: relative;

  img {
    height: 100%;
    width: 100%;
  }

  .delete-icon {
    position: absolute;
    z-index: 2;
    cursor: pointer;
    right: -8px;
    top: -8px;
    font-size: 16px;
    color: #FF5351;
  }
}

.position-mid {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.cover {
  background: #000000;
  opacity: 0.2;
  height: 100%;
  width: 100%;
  z-index: 2;
}

.qr-canvas {
  height: 100%;
  width: 100%;
}

.error-box {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: #fff;

  img {
    height: 100%;
  }
}

.success {
  color: #52C41A;
  font-size: 32px;
  z-index: 5;
}

.refresh {
  cursor: pointer;
  z-index: 5;

  path {
    fill: var(--colorPrimary);
  }
}

.tip {
  margin-top: 24px;
  color: #666666;
  line-height: 20px;
}
</style>
<style lang="less">
.qr-modal {
  .ant-modal-content {
    padding: 0;
  }

  .ant-modal-header {
    height: 48px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #DEDEDE;
    margin-bottom: 0;
  }

  .ant-modal-close {
    top: 11px;
  }

  .ant-modal-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 28px 0;
    align-items: center;
  }
}
</style>