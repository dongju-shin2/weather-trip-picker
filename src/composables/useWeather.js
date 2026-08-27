import { ref } from 'vue'
import { CITIES } from '@/constants/cities'
import { fetchCurrentWeather, toStatus, toKoDescription } from '@/api/weatherApi'

// useFavorites랑 같은 패턴 — 모듈 스코프 ref라 홈/즐겨찾기 어느 뷰에서 쓰든 같은 목록 하나를 바라봄
// 덕분에 페이지를 왔다 갔다 해도 다시 안 불러오고, mock이 두 파일에 중복돼 있던 문제도 해결
const weatherList = ref([])
const isLoading = ref(false)
const loadError = ref('')
let loaded = false // 이미 성공적으로 받아왔으면 재호출 안 함 (API 무료 호출량 아끼기)

export function useWeather() {
  const loadWeather = async (force = false) => {
    if (loaded && !force) return // 즐겨찾기 갔다 와도 여기서 바로 리턴
    isLoading.value = true
    loadError.value = ''
    try {
      // 5개 도시를 순서대로 기다리면 5배로 느려지니까 Promise.all로 병렬 호출
      weatherList.value = await Promise.all(
        CITIES.map(async (c) => {
          const data = await fetchCurrentWeather(c.lat, c.lon)
          // 고정 정보(이름/명소)는 상수에서, 변하는 정보(기온/상태)는 API에서 합침
          return {
            id: c.id,
            name: c.name,
            spots: c.spots,
            temp: Math.round(data.main.temp), // 섭씨 원본 (화씨 표시는 configStore가 담당)
            status: toStatus(data.weather[0]),
            description: toKoDescription(data.weather[0]), // API 번역("온흐림") 대신 id 기준 자체 매핑
          }
        })
      )
      loaded = true
    } catch {
      // 키가 아직 활성화 전이거나 네트워크가 끊겼을 때 — 화면에서 다시 시도 버튼으로 재호출
      loadError.value = '날씨 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'
    } finally {
      isLoading.value = false
    }
  }

  return { weatherList, isLoading, loadError, loadWeather }
}
