import { useConfigStore } from '@/stores/configStore'

// 과제 5 슬라이드의 "(참고) 메인/상세에 단위 적용하면 유사한 코드가 중복됨 → Composable로 해결 가능"을 구현한 것
// displayTemp computed + 단위 기호 병기가 카드/상세/예보마다 반복되던 걸 여기 한 곳으로 모음
export function useDisplayTemp() {
  const configStore = useConfigStore()

  // 섭씨 원본 숫자 → 현재 단위의 완성 문자열 ("28℃" / "82℉")
  // computed가 아니라 함수인 이유: 예보 테이블처럼 행마다 다른 값을 넘겨야 하는 자리에서도 써야 해서
  // (렌더링 중에 스토어 unit을 읽으니까 단위가 바뀌면 화면도 알아서 다시 그려짐)
  const formatTemp = (celsius) => `${configStore.convert(celsius)}${configStore.unitSymbol}`

  return { formatTemp }
}
