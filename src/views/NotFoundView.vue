<script setup>
import { useRouter } from 'vue-router'

// 없는 주소로 온 사람은 메인으로 돌려보내는 것밖에 할 게 없음
const router = useRouter()
</script>

<template>
  <div class="container">
    <!-- el-result: 404처럼 "결과 안내"만 하는 화면 전용 컴포넌트 -->
    <el-card>
      <el-result icon="warning" title="페이지를 찾을 수 없습니다." sub-title="요청하신 주소가 존재하지 않거나, 아직 개발되지 않았습니다.">
        <template #extra>
          <el-button type="primary" @click="router.push('/')">날씨 메인으로 이동</el-button>
        </template>
      </el-result>
    </el-card>
  </div>
</template>

<style scoped>
.container {
  max-width: 560px;
  margin: 0 auto;
}
</style>
