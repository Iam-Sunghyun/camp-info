// ejs 구문이 있는 자바스크립트를 모듈로 분리하고 <script src="">로 불러오면 읽어 들이지 못한다.
// 그 이유는 요청이 왔을 때 서버 측 ejs 템플릿 엔진이 템플릿의 ejs 코드를 읽어 들이면서 표준 HTML로 변환하고 클라이언트에 전송하는데(텍스트로)
// <script src="/js/validateForm.js"></script>와 같이 스크립트 태그로 자바스크립트를 불러오는 부분은
// 클라이언트 브라우저에 전송되고 나서 서버로 요청하고 응답받아 실행 되는데 클라이언트 측에선 ejs 구문을 해석하지 못하기 때문에 값이 제대로 할당되지 않는다.
// 따라서 ejs로 토큰을 참조하는 부분('<%= process.env.MAPBOX_TOKEN %>')을 템플릿에 넣고 변수에 할당하여(데이터를 서버에서 할당해 클라이언트로 넘기는 것)
// 아래의 자바스크립트가 클라이언트 브라우저로 로드되어 토큰을 참조할 수 있게 한다.
mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: JSON.parse(campground).geometry.coordinates, // 중앙 위치 설정 [lng, lat]
  zoom: 9, // 줌 설정
});

// 기본 마커를 생성하고 map에 추가한다.
new mapboxgl.Marker()
.setLngLat(JSON.parse(campground).geometry.coordinates)
.addTo(map);
