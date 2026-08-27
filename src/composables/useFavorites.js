import { ref } from 'vue'

// 즐겨찾기를 홈 뷰 안에 두면 /favorites 갔다 오는 순간 컴포넌트가 다시 만들어지면서 리셋됨
// → 모듈 스코프 ref로 빼서 어떤 뷰에서 쓰든 같은 배열 하나를 바라보게 함 (미니 전역 상태)
const favorites = ref([])

export function useFavorites() {
  // 별 누르면 id를 넣었다 뺐다 — 홈이랑 즐겨찾기 페이지 양쪽에서 같은 로직 쓰니까 여기로 모음
  const toggleFav = (id) => {
    favorites.value = favorites.value.includes(id)
      ? favorites.value.filter((f) => f !== id)
      : [...favorites.value, id]
  }

  return { favorites, toggleFav }
}
