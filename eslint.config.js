import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'

// ESLint 설정 (flat config 방식)
// js.configs.recommended: 자바스크립트 기본 오류 규칙 (미사용 변수, 미정의 변수 등)
// pluginVue 'flat/essential': Vue 3 필수 규칙 (v-for key 누락, 잘못된 디렉티브 같은 실제 버그성 오류)
export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    languageOptions: {
      // localStorage, console 같은 브라우저 전역 객체를 "미정의 변수"로 오해하지 않게 등록
      globals: globals.browser,
    },
  },
  {
    // 빌드 결과물은 검사 대상 아님
    ignores: ['dist/**', 'node_modules/**'],
  },
]
