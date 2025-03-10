<template>
  <div :class="['c-avatar', modelValue ? '' : 'is-empty']">
    <img :src="modelValue || emptyPng">
    <div v-if="mode !== 'detail'" class="btns">
      <template v-if="modelValue">
        <span class="btn" @click="clickOpen">重新上传</span>
        <span class="btn" style="color: #FF000C;" @click="clickDelete">删除</span>
      </template>
      <span v-else class="btn" @click="clickOpen">上传</span>
    </div>
  </div>
  <a-modal wrapClassName="avatar-upload-modal" v-model:open="uploadOpen" title="头像上传" :keyboard="false"
    :mask-closable="false" :width="972" :ok-button-props="{ type: 'primary' }" @ok="confirmUpload">
    <div class="wrapper-box">
      <div class="left">
        <div class="crop-box" v-if="currentImg">
          <vueCropper ref="cropperRef" :auto-crop-width="`${width}px`" :auto-crop-height="`${height}px`" :fixed="false"
            :img="currentImg" :fixed-box="true" :auto-crop="true" :center-box="false" output-type="png" :info="false"
            :can-move-box="false" @realTime="handleRealTime" />
        </div>
        <div v-else class="upload-box">
          <input ref="uploadRef" type="file" style="display: none;" @change="beforeUpload"></input>
          <img src="../assets/images/picture.png">
          <a-button type="link" @click="clickUpload" style="margin-top:12px">
            <template #icon>
              <UploadOutlined />
            </template>
            选择图片
          </a-button>
        </div>
        <div class="tip">
          {{ tip }}
        </div>
      </div>
      <div class="preview-box">
        <div :style="`height: ${height}px;width:${width}px`">
          <span v-html="html"></span>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import 'vue-cropper/dist/index.css';
  import { VueCropper } from 'vue-cropper';
  import { message } from 'ant-design-vue';
  import { ref, computed } from 'vue';
  import emptyPng from '../assets/images/avatar.png';
  import { UploadOutlined, PictureOutlined } from '@ant-design/icons-vue';

  const props = defineProps({
    // emptyPng: { type: String, default: '../assets/images/avatar.png' },
    mode: { type: String, default: 'edit' },
    modelValue: { type: String, default: '' },
    height: { type: Number, default: 360 },
    width: { type: Number, default: 280 },
    limit: { type: Number, default: 5 },
    accept: { type: Array, default: () => ['image/jpeg', 'image/jpg', 'image/png'] }
  });

  const tip = computed(() => {
    const { height, width, accept, limit } = props
    return `尺寸为${width}*${height},大小不得超过${limit}M,仅支持${accept.map((v) => v.split('/')[1].toUpperCase()).join('/')}`
  })

  const emits = defineEmits(['update:modelValue']);

  const uploadOpen = ref(false);
  const currentImg = ref('');

  function clickOpen() {
    uploadOpen.value = true;
    currentImg.value = props.modelValue;
  }

  function clickDelete() {
    emits('update:modelValue', '');
  }

  const uploadRef = ref(null);
  function clickUpload() {
    uploadRef.value.click();
  }
  function beforeUpload(e) {
    const file = e.target.files[0];
    const { type, size } = file;
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(type) || size > 5 * 1024 * 1024) {
      message.warning('仅支持JPG、PNG、JPEG，大小不超过5M');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      currentImg.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  const cropperRef = ref(null);
  function confirmUpload() {
    cropperRef.value.getCropData((data) => {
      emits('update:modelValue', data);
      uploadOpen.value = false;
    });
  }
  const html = ref('')
  function handleRealTime(v) {
    console.log(v)
    html.value = v.html
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


.wrapper-box {
  height: 100%;
  width: 100%;
  display: flex;

  .left {
    min-width: 0;
    flex: 1;

    .tip {
      font-size: 14px;
      color: #666666;
      line-height: 20px;
      margin-top: 16px;
    }
  }

  .preview-box {
    margin-left: 32px;
    width: 280px;
    height: 360px;
    background: #F0F0F0;
    flex: none;
  }
}

.crop-box {
  height: 450px;

  :deep(.vue-cropper) {
    background-image: none;
    background: rgba(0, 0, 0, 0.4);
  }

  :deep(.cropper-view-box) {
    outline: none;
    border: 3px dashed #FFFFFF;
  }
}

.upload-box {
  background: #F3F3F3;
  border: 1px dashed #BBBBBB;
  height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

}
</style>
<style lang="less">
.avatar-upload-modal {
  .ant-modal-content {
    border-radius: 0;
    padding: 0;
  }

  .ant-modal-header {
    height: 48px;
    padding: 0 16px;
    border-bottom: 1px solid #DEDEDE;

    .ant-modal-title {
      font-family: PingFangSC, PingFang SC;
      font-weight: 500;
      font-size: 14px;
      color: #4A4A4A;
      line-height: 48px;
    }
  }

  .ant-modal-body {
    height: 534px;
    padding: 24px 32px;
    border-bottom: 1px solid #DEDEDE;
  }

  .ant-modal-footer {
    margin-top: 0;
    height: 56px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    justify-content: end;
  }
}
</style>