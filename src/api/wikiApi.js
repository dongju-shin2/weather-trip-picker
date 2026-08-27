import axios from 'axios'

// 요약 첫머리의 괄호 병기(한자·방언·영어 표기)를 걷어내는 함수
// 제주 문서의 제주어 표기에 옛한글 아래아(ᆞ)가 들어 있어서 일반 폰트에선 깨져 보이는 데다,
// 여행 소개 카드에 사전식 병기는 군더더기라 문서 제목 바로 뒤 괄호 한 덩어리만 제거함
const stripLeadingParen = (text) => {
  const start = text.indexOf('(')
  // 괄호가 제목 바로 뒤에 붙어 있을 때만 — 첫 공백보다 뒤에 나오는(문장 중간) 괄호는 안 건드림
  if (start === -1 || text.slice(0, start).includes(' ')) return text
  // 병기 안에 또 괄호가 있을 수 있어서, 단순 정규식 대신 여닫이 개수를 세며 짝 맞는 지점을 찾음
  let depth = 0
  for (let i = start; i < text.length; i++) {
    if (text[i] === '(') depth++
    else if (text[i] === ')') {
      depth--
      if (depth === 0) return text.slice(0, start) + text.slice(i + 1)
    }
  }
  return text // 짝이 안 맞으면 괜히 자르지 말고 원문 그대로
}

// 위키백과 요약 API (요구사항 3 - 기타 외부 API)
// 가입/키 발급이 아예 없고 CORS도 열려 있어서 브라우저에서 바로 호출 가능
// 문서 제목만 넣으면 요약 문단 + 대표 사진을 JSON으로 돌려줌
export const fetchCitySummary = async (title) => {
  const { data } = await axios.get(
    // 한글 제목은 URL에 못 들어가니 encodeURIComponent로 인코딩 필수
    `https://ko.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
  )
  // 필요한 것만 추려서 반환 — 컴포넌트가 응답 구조를 몰라도 되게
  return {
    extract: stripLeadingParen(data.extract),  // 요약 문단 (첫머리 괄호 병기 제거)
    thumbnail: data.thumbnail?.source ?? null, // 대표 사진 (없는 문서도 있어서 옵셔널)
    pageUrl: data.content_urls?.desktop?.page ?? null, // 원문 링크
  }
}
