<template>
  <div :class="['c-avatar', modelValue ? '' : 'is-empty']">
    <img :src="modelValue || emptyPng">
    <div class="btns" v-if="mode !== 'detail'">
      <template v-if="modelValue">
        <span class="btn" @click="clickOpen">重新上传</span>
        <span class="btn" style="color: #FF000C;" @click="clickDelete">删除</span>
      </template>
      <span v-else class="btn" @click="clickOpen">上传</span>
    </div>
  </div>
  <a-modal v-model:open="uploadOpen" title="头像上传" :keyboard="false" :maskClosable="false"
    :ok-button-props="{ disabled: !currentImg, type: 'primary' }" @ok="confirmUpload">
    <div class="cropper-box">
      <vueCropper v-if="currentImg" :autoCropWidth="148" :autoCropHeight="200" :fixed="false" ref="cropperRef"
        :img="currentImg" :fixedBox="true" :autoCrop="true" :centerBox="true" outputType="png" :info="false"
        :canMoveBox="false">
      </vueCropper>
      <div v-else class="upload-box">
        <input type="file" @change="beforeUpload" style="display: none;" ref="uploadRef"></input>
        <a-button @click="clickUpload">选择图片</a-button>
        <div class="tip">仅支持JPG、PNG、JPEG，大小不超过5M</div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import 'vue-cropper/dist/index.css'
  import { VueCropper } from "vue-cropper";
  import { message } from 'ant-design-vue';
  import emptyPng from '../assets/images/avatar.png'
  import { ref } from 'vue'
  const props = defineProps({
    // emptyPng: { type: String, default: '../assets/images/avatar.png' },
    mode: { type: String, default: 'edit' },
    modelValue: { type: String, default: '' }
  })

  const emits = defineEmits(['update:modelValue'])

  const uploadOpen = ref(false)
  const currentImg = ref('')

  function clickOpen() {
    uploadOpen.value = true
    currentImg.value = props.modelValue
  }

  function clickDelete() {
    emits('update:modelValue', '')
  }


  const uploadRef = ref(null)
  function clickUpload() {
    uploadRef.value.click()
  }
  function beforeUpload(e) {
    const file = e.target.files[0];
    const { type, size } = file
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(type) || size > 5 * 1024 * 1024) {
      message.warning('仅支持JPG、PNG、JPEG，大小不超过5M');
      return
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      currentImg.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  const cropperRef = ref(null)
  function confirmUpload() {
    cropperRef.value.getCropData(data => {
      emits('update:modelValue', data)
      uploadOpen.value = false
    })
  }
</script>

<style lang="less" scoped>
.c-avatar {
  position: relative;
  width: 148px;
  height: 200px;

  &.is-empty {
    border: 1px dashed #999;
  }

  &:hover {
    border: none;

    .btns {
      display: flex;
    }

  }

  img {
    height: 100%;
    width: 100%;
    display: block;
  }
}

.btns {
  display: none;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 24px;
  background: rgba(0, 130, 255, 0.6);
  width: 100%;
  z-index: 1;
  line-height: 24px;

  .btn {
    min-width: 0;
    flex: 1;
    font-family: PingFangSC;
    font-size: 12px;
    color: #FFFFFF;
    text-align: center;
    cursor: pointer;
    position: relative;

    +.btn::before {
      display: inline-block;
      content: '|';
      font-size: 14px;
      position: absolute;
      left: 0;
      color: #FFFFFF;
    }
  }
}


.cropper-box {
  width: 472px;
  height: 300px;

  .upload-box {
    height: 200px;
    background-color: #EAEFF4;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .tip {
      color: #999;
      margin-top: 8px;
      font-size: 12px;
    }
  }

}
</style>