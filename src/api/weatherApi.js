import axios from 'axios'

// OpenWeatherMap 전용 axios 인스턴스
// baseURL + 공통 파라미터(키/섭씨/한국어)를 여기 한 번만 장착 → 호출하는 쪽엔 URL도 키도 안 보임
// 키는 .env의 VITE_WEATHER_API_KEY에서 옴 (VITE_ 접두사가 붙어야 import.meta.env로 읽힘)
const owm = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  params: {
    appid: import.meta.env.VITE_WEATHER_API_KEY,
    units: 'metric', // 섭씨로 받음 — 화씨 표시는 기존 configStore.convert가 담당하니 원본은 항상 섭씨 유지
    lang: 'kr',      // description을 한국어로 ("튼구름" 같은 문구)
  },
})

// 현재 날씨 (요구사항 1) — https://openweathermap.org/current
export const fetchCurrentWeather = async (lat, lon) => {
  const { data } = await owm.get('/weather', { params: { lat, lon } })
  return data
}

// 5일 / 3시간 간격 예보 (요구사항 2 - OWM 추가 API) — https://openweathermap.org/forecast5
export const fetchForecast = async (lat, lon) => {
  const { data } = await owm.get('/forecast', { params: { lat, lon } })
  return data
}

// 대기오염(미세먼지) (요구사항 2 - OWM 추가 API) — https://openweathermap.org/api/air-pollution
export const fetchAirPollution = async (lat, lon) => {
  const { data } = await owm.get('/air_pollution', { params: { lat, lon } })
  return data
}

// OWM의 날씨 대분류(weather[0].main) → 이 앱의 한글 상태값 매핑
// 기존 화면(이모지/배지/검색)이 전부 한글 상태 기준으로 돌아가서, API 값을 여기서 한 번 번역해줌
const MAIN_TO_STATUS = {
  Clear: '맑음',
  Clouds: '구름',
  Rain: '비',
  Drizzle: '비',
  Thunderstorm: '비',
  Snow: '눈',
}
// Mist/Haze/Fog/Dust 같은 대기 현상 그룹은 전부 '흐림'으로 퉁침
export const toStatus = (weather) => MAIN_TO_STATUS[weather.main] ?? '흐림'

// 대기질 지수(aqi 1~5) → 한글 등급 (OWM 기준: 1이 제일 좋음)
const AQI_LABELS = { 1: '좋음', 2: '보통', 3: '나쁨', 4: '매우 나쁨', 5: '위험' }
export const toAqiLabel = (aqi) => AQI_LABELS[aqi] ?? '정보 없음'
