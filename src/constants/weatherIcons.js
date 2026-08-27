// status(대분류 한글 상태) → 날씨 이모지
// 도시 카드(WeatherCard)와 상세 페이지가 같은 맵을 공유해서 이모지가 항상 일관되게 나옴
export const WEATHER_ICONS = { 맑음: '☀️', 비: '🌧️', 구름: '☁️', 흐림: '🌫️', 눈: '❄️' }

// 정의 안 된 상태는 무지개로 폴백
export const iconFor = (status) => WEATHER_ICONS[status] ?? '🌈'
