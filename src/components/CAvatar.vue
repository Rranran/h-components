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
      <input ref="uploadRef" type="file" style="display: none;" @change="beforeUpload"></input>
      <div class="left">
        <div class="crop-box" v-if="currentImg">
          <div class="btns">
            <a-button type="primary" @click="clickUpload">重新上传</a-button>
            <a-button danger style="margin-left: 8px;" @click="clickDeleteCurrent">删除</a-button>
          </div>
          <vueCropper ref="cropperRef" :auto-crop-width="`${width}px`" :auto-crop-height="`${height}px`" :fixed="false"
            :img="currentImg" :fixed-box="true" :auto-crop="true" :center-box="false" output-type="png" :info="false"
            :can-move-box="false" @realTime="handleRealTime" />
        </div>
        <div v-else class="upload-box">
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
        <div :style="`height: ${height}px;width:${width}px;background: #F0F0F0;overflow: hidden;`">
          <img v-if="!!previewObj" :src="previewObj.url" :style="previewObj.img" class="preview-img">
        </div>
        <div class="tip">{{ width }}*{{ height }}</div>
        <a-button type="primary" ghost style="margin-top:20px" :disabled="!currentImg"
          @click="downloadPng">下载图片</a-button>
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

  const validTip = computed(() => {
    const { accept, limit } = props
    return `大小不得超过${limit}M,仅支持${accept.map((v) => v.split('/')[1].toUpperCase()).join('/')}`
  })

  const tip = computed(() => {
    const { height, width } = props
    return `尺寸为${width}*${height},${validTip.value}}`
  })

  const emits = defineEmits(['update:modelValue']);

  const uploadOpen = ref(false);
  const currentImg = ref('');

  function clickOpen() {
    uploadOpen.value = true;
    currentImg.value = props.modelValue;
    previewObj.value = {
      url: props.modelValue,
      img: ''
    }
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
      message.warning(validTip.value);
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      currentImg.value = e.target.result;
      uploadRef.value.value = ''
    };
    reader.onerror = function (e) {
      message.error('文件读取失败，请检查是否被占用');
      uploadRef.value.value = ''
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
  const previewObj = ref('')
  function handleRealTime(v) {
    previewObj.value = v
  }
  function clickDeleteCurrent() {
    currentImg.value = ''
    previewObj.value = ''
  }
  function downloadPng() {
    cropperRef.value.getCropBlob((data) => {
      const href = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.download = '头像.png'
      link.href = href;
      link.click()
      document.removeChild(link)
      URL.revokeObjectURL(href)
    });
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
}




.wrapper-box {
  height: 100%;
  width: 100%;
  display: flex;

  .left {
    min-width: 0;
    flex: 1;

  }

  .preview-box {
    margin-left: 32px;
    flex: none;
    text-align: center;

    .preview-img {
      display: block;
    }
  }
}

.tip {
  font-size: 14px;
  color: #666666;
  line-height: 20px;
  margin-top: 16px;
}

.crop-box {
  height: 450px;
  position: relative;

  .btns {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 20;
    display: flex;
  }

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