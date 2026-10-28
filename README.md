# ONCARE · 일산차병원 IT 지원센터

장비 장애 자가 조치·접수·처리, 토너 신청·재고, 통계 및 취합보고를 제공하는 시연 웹앱입니다.
HTML/CSS/JavaScript로 구현했으며 외부 npm 패키지는 사용하지 않습니다.

## 실행

Node.js 18 이상을 설치한 후 프로젝트 폴더에서 실행합니다.

```powershell
npm start
```

브라우저에서 http://127.0.0.1:4173 에 접속합니다. 종료는 Ctrl+C입니다.

## 작업 및 빌드

- 소스: `work/sites-oncare/`
- 빌드: `npm run build`
- 빌드 결과: `work/sites-oncare/dist/index.html`, `outputs/온케어_화면시연.html`
- 기존 데이터 생성 검증: `npm test`
- 자세한 기능 설명: `work/sites-oncare/README.md`

빌드 결과와 기존 백업 문서, 호스팅 메타데이터는 Git에서 제외합니다.
현재 소스에는 v23 및 상단 병원 CI·문구 스타일 수정이 포함되어 있습니다.

## 다른 컴퓨터에서 이어서 작업

```powershell
git clone https://github.com/a89880275-bit/batman_work.git
cd batman_work
npm start
```

이후 작업 전 `git pull`, 작업 후 변경사항을 커밋하고 `git push`합니다.

## 데이터 저장

시연 로그인과 브라우저 localStorage를 사용합니다. 공용 DB와 실제 계정 인증은 연결되지 않았습니다.
접수·사진·재고 등 브라우저 저장 데이터는 Git에 포함되지 않으며 다른 컴퓨터와 자동으로 공유되지 않습니다.
