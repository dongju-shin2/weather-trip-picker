// 5개 도시의 고정 정보(이름/좌표/명소) 한 곳에 모음
// 전엔 홈/즐겨찾기/상세가 각자 mock을 들고 있었는데, 실제 API로 바꾸면서 "안 변하는 정보"만 여기로 분리
// 기온/날씨상태 같은 "변하는 정보"는 이제 API 응답에서 옴
export const CITIES = [
  {
    id: 'city_01',
    name: '서울',
    fullName: '대한민국 서울특별시',
    lat: 37.5665,
    lon: 126.978,
    wikiTitle: '서울특별시', // 위키백과 문서 제목 (도시 이름과 다를 수 있어서 따로 둠)
    spots: ['경복궁', 'N서울타워'],
  },
  {
    id: 'city_02',
    name: '수원',
    fullName: '대한민국 경기도 수원시',
    lat: 37.2636,
    lon: 127.0286,
    wikiTitle: '수원시',
    spots: ['수원화성', '광교호수공원'],
  },
  {
    id: 'city_03',
    name: '부산',
    fullName: '대한민국 부산광역시',
    lat: 35.1796,
    lon: 129.0756,
    wikiTitle: '부산광역시',
    spots: ['해운대', '감천문화마을'],
  },
  {
    id: 'city_04',
    name: '인천',
    fullName: '대한민국 인천광역시',
    lat: 37.4563,
    lon: 126.7052,
    wikiTitle: '인천광역시',
    spots: ['월미도', '차이나타운'],
  },
  {
    id: 'city_05',
    name: '제주',
    fullName: '대한민국 제주특별자치도',
    lat: 33.4996,
    lon: 126.5312,
    wikiTitle: '제주특별자치도',
    spots: ['성산일출봉', '협재해수욕장'],
  },
]
