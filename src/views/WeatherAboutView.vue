<script setup>
// 서비스 소개 — 기술 스택 나열이 아니라 "왜 만들었고 어떻게 쓰는지"를 보여주는 페이지
// 기획 의도가 앱 안에서도 읽히게, README의 스토리를 사용자용 말로 옮김
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="container">
    <el-card>
      <template #header>
        <h2 class="about-title">ℹ️ 서비스 소개</h2>
      </template>

      <h3 class="section-title">🤔 왜 만들었나요?</h3>
      <p class="about-desc">
        여행 계획은 보통 목적지부터 정하고, 날씨는 그다음에 찾아보게 됩니다. 그러다 출발 직전에 비 예보를
        발견하고 실망한 경험, 다들 있으시죠. 이 앱은 그 순서를 뒤집었습니다 —
        <strong>날짜를 먼저 고르면, 그날 날씨가 좋은 여행지를 앱이 골라줍니다.</strong>
      </p>

      <h3 class="section-title">🧭 이렇게 쓰세요</h3>
      <!-- el-steps: 사용 흐름을 단계로 보여주는 컴포넌트. active=3이라 전부 완료(체크) 표시 -->
      <el-steps direction="vertical" :active="3">
        <el-step
          title="날짜로 여행지 비교"
          description="홈의 '이 날짜엔 어디가 좋을까?'에서 날짜를 고르면, 5개 도시가 여행하기 좋은 순서로 줄을 섭니다."
        />
        <el-step
          title="상세 정보 확인"
          description="상세보기에서 5일 예보, 미세먼지 등급, 도시 소개(위키백과)까지 한 번에 확인하세요."
        />
        <el-step
          title="찜하거나 내 여행으로 등록"
          description="마음에 들면 별(☆)로 찜해두거나 '내 여행'에 기간을 등록하세요. 여행 5일 전부터 일차별 예보를 자동으로 보여드립니다."
        />
      </el-steps>

      <p class="tech-note">
        Vue 3 · Vue Router · Pinia · Axios · Element Plus 기반, OpenWeatherMap과 위키백과 API를 연동한 실습
        프로젝트입니다.
      </p>

      <div class="home-row">
        <el-button type="primary" @click="router.push('/')">여행지 고르러 가기</el-button>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.container {
  max-width: 560px;
  margin: 0 auto;
}

.about-title {
  margin: 0;
  font-size: 1.25rem;
  color: #334155;
}

.section-title {
  margin: 0 0 10px;
  font-size: 1.05rem;
  color: #334155;
}

.about-desc {
  margin: 0 0 24px;
  color: #475569;
  line-height: 1.7;
}
.about-desc strong {
  color: #4f46e5;
}

.tech-note {
  margin: 20px 0 0;
  padding-top: 14px;
  border-top: 1px solid #f1f5f9;
  color: #94a3b8;
  font-size: 0.85rem;
  line-height: 1.6;
}

.home-row {
  margin-top: 16px;
  text-align: center;
}
</style>
