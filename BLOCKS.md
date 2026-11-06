# 프로젝트 페이지 블록 가이드

프로젝트 상세 페이지(`/projects/*.html`)는 공용 블록을 조립해서 만듭니다.

- **공용 스타일**: `static/css/project-base.css` — 두 개 이상의 페이지(또는 템플릿)에서 쓰는 것만 둡니다.
- **페이지 전용 스타일**: 각 페이지 HTML의 `<style>` — 그 프로젝트에서만 쓰는 것(SNAKED 작전 카드, KUNST 정의 섹션 등).
- **견본 페이지**: [`/projects/blocks`](https://chid.kr/projects/blocks) — 모든 블록이 실제 모습으로 들어 있습니다(검색 제외). 빨간 라벨 아래 마크업을 복사해서 쓰면 됩니다.
- **새 프로젝트 시작**: `projects/Base_light.html`(밝은 배경) 또는 `projects/Base_dark.html`(어두운 배경)을 복사합니다.

규칙은 **기본 블록 + 옵션** 입니다. 예: `class="split"` → 옵션을 붙여 `class="split reverse"`, `class="split fixed reverse"`.

## 페이지 뼈대 (모든 페이지 공통, 순서대로)

| 블록 | 클래스 | 비고 |
|---|---|---|
| 뒤로가기 | `back-nav-container` > `a.back-btn` | 스크롤 시 숨김(JS가 `nav-up` 추가) |
| 히어로 | `hero-section` > `img.hero-image` | 배경색은 `--hero-bg` |
| 제목 줄 | `project-header` > `.project-title h1` + `.project-specs` | |
| 정보 줄 | `project-facts` > `.fact` > `.fact-label` + `.fact-value` | 데스크톱 6칸, 모바일 2칸 |
| 크레딧 | `credit-section` > `.credit-grid` > `.credit-label` + `.credit-content` | |
| 다음 프로젝트 | `next-project` (`data-href`, `style="--next-bg: url(...)"`) > `.next-label` + `.next-title` | 배경 이미지는 페이지마다 다른 값이라 인라인 유지 |

## 콘텐츠 블록

| 블록 | 구조 | 옵션 | 모바일 |
|---|---|---|---|
| `media` | `img` 또는 `video.locked-video` | `.flush` 아래 여백 없음 · 자식에 `.narrow` (최대 1000px 가운데) | 그대로 |
| `split` | `.split-media` + `.split-text` | `.reverse` 이미지를 오른쪽에 · `.fixed` 모바일에서도 좌우 유지 | 위아래로 쌓임(이미지 먼저) |
| `text-block` | `.lead` · `.body-en` · `.body-kr` | | 좌우 여백 20px |
| `text-split` | `.text-split-title` + `.text-block` | `.center` 세로 가운데 정렬 | 제목이 위로 |
| `text-narrow` | 자유 (최대 800px, 왼쪽 정렬) | | |
| `text-center` | `.heading-lg` + `.body-en` (최대 1000px, 가운데) | | |
| `title-block` | `.label` + `.quote` (`.quote-mark`) | | |
| `stack` | `.stack-head` (`img.wide-logo`) + `.stack-body` | | |

## 글자 스타일

| 클래스 | 용도 |
|---|---|
| `heading` | 블록 제목 (38px, 모바일 32px) |
| `heading-lg` | 큰 가운데 제목 |
| `sub-heading` | 제목 아래 보조 줄 |
| `lead` | 요약 한 문장 (24px 굵게) |
| `label` | 작은 대문자 라벨 |
| `quote` / `quote-mark` | 큰 인용문 / 따옴표 |
| `accent` | 포인트 색 강조 (`--point-color`) |
| `body-en` / `body-kr` | 영문 본문 / 국문 본문 |

## 테마 색

페이지 `<style>` 안의 `:root { ... }`에서 바꿉니다. 자주 쓰는 값: `--bg-color`, `--text-main`, `--text-sub`, `--point-color`, `--hero-bg`, `--border-color`. 전체 목록은 `project-base.css` 맨 위에 있습니다.

## 블록을 새로 만들 때

1. 한 프로젝트에서만 쓰면 그 페이지 `<style>`에 둡니다.
2. 두 번째 프로젝트에서도 쓰게 되면 `project-base.css`로 옮기고, `/projects/blocks`에 견본을 하나 추가하고, 이 표에 한 줄 적습니다.
3. 태그에 `style="..."`를 직접 쓰지 않습니다(예외: `--next-bg`처럼 페이지마다 다른 데이터).
