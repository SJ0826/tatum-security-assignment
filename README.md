# Tatum Security Assignment

## ◾️ 개요

클라우드 보안 스캔 관리 시스템입니다. AWS, GCP, Azure 등 멀티 클라우드 환경에 대한 보안 스캔 스케줄을 설정하고 관리할 수 있습니다.

<br />

## ◾️ 프로젝트 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

개발 서버 실행 후 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

<br />

## ◾️ 기술 문서

### 다량의 API 관리 방법

React Query를 활용한 API 관리 전략:

#### 1. API 문서 확인 및 타입 정의

```typescript
// src/types/api.ts
// OpenAPI Spec이나 Swagger 문서를 기반으로 타입 정의
export interface CloudScanRequest {
  provider: 'AWS' | 'GCP' | 'Azure';
  credentials: Record<string, string>;
  schedule: {
    type: 'once' | 'daily' | 'weekly';
    time?: string;
  };
}

export interface CloudScanResponse {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  result?: ScanResult;
}

// 응답 래퍼 타입
export interface APIResponse<T> {
  data: T;
  message?: string;
  error?: string;
}
```

#### 2. API 클라이언트 레이어 구성

```typescript
// src/api/client.ts
// axios 인스턴스 설정
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터로 공통 로직 처리
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // 에러 핸들링 로직
    if (error.response?.status === 401) {
      // 인증 실패 처리
    }
    return Promise.reject(error);
  }
);
```

#### 3. API 함수 정의 (도메인별 분리)

```typescript
// src/api/scan.ts
export const scanAPI = {
  createScan: (data: CloudScanRequest) =>
    apiClient.post<APIResponse<CloudScanResponse>>('/scans', data),

  getScans: (params?: { provider?: string; status?: string }) =>
    apiClient.get<APIResponse<CloudScanResponse[]>>('/scans', { params }),

  getScanById: (id: string) =>
    apiClient.get<APIResponse<CloudScanResponse>>(`/scans/${id}`),

  deleteScan: (id: string) =>
    apiClient.delete<APIResponse<void>>(`/scans/${id}`),
};
```

#### 4. React Query Hook 구성

```typescript
// src/hooks/useScanQuery.ts
export const useScanQuery = (id: string) => {
  return useQuery({
    queryKey: ['scan', id],
    queryFn: () => scanAPI.getScanById(id),
    staleTime: 30000, // 30초
    enabled: !!id,
  });
};

export const useScansQuery = (filters?: ScanFilters) => {
  return useQuery({
    queryKey: ['scans', filters],
    queryFn: () => scanAPI.getScans(filters),
    staleTime: 10000,
  });
};

export const useCreateScanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scanAPI.createScan,
    onSuccess: () => {
      // 캐시 무효화로 목록 자동 갱신
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });
};

export const useDeleteScanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scanAPI.deleteScan,
    onMutate: async (scanId) => {
      // Optimistic Update
      await queryClient.cancelQueries({ queryKey: ['scans'] });
      const previous = queryClient.getQueryData(['scans']);

      queryClient.setQueryData(['scans'], (old: any) => {
        return old?.filter((scan: any) => scan.id !== scanId);
      });

      return { previous };
    },
    onError: (err, variables, context) => {
      // 롤백
      queryClient.setQueryData(['scans'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['scans'] });
    },
  });
};
```

#### 5. 컴포넌트에서 사용

```typescript
// src/components/ScanList.tsx
export function ScanList() {
  const { data, isLoading, error } = useScansQuery();
  const deleteMutation = useDeleteScanMutation();

  if (isLoading) return <Spinner / >;
  if (error) return <ErrorMessage error = { error }
  />;

  return (
    <div>
      { data?.data.map(scan => (
        <ScanItem
          key = { scan.id }
  scan = { scan }
  onDelete = {()
=>
  deleteMutation.mutate(scan.id)
}
  />
))
}
  </div>
)
  ;
}
```

#### 6. 효율적인 관리 전략

- **queryKey 네이밍 컨벤션**: `['도메인', '상세정보', '필터']` 형식으로 통일
- **폴더 구조**:
  ```
  src/
  ├── api/
  │   ├── client.ts       # axios 인스턴스
  │   ├── scan.ts         # scan 도메인 API
  │   ├── credential.ts   # credential 도메인 API
  │   └── types.ts        # 공통 API 타입
  ├── hooks/
  │   ├── useScanQuery.ts
  │   └── useCredentialQuery.ts
  └── types/
      └── api.ts          # API 응답 타입
  ```

- **에러 핸들링**: React Query의 `onError`, `useQueryErrorResetBoundary`와 Error Boundary 조합
- **캐싱 전략**: staleTime과 cacheTime을 데이터 특성에 맞게 설정

<br />

### i18n 적용 방안

#### Google Spreadsheet 기반 번역 관리 시스템

개발자의 개입을 최소화하고 기획자가 직접 번역을 관리할 수 있는 구조:

#### 1. Google Spreadsheet 구조

| key           | ko    | en          | ja     |
|---------------|-------|-------------|--------|
| common.save   | 저장    | Save        | 保存     |
| common.cancel | 취소    | Cancel      | キャンセル  |
| cloud.aws     | AWS   | AWS         | AWS    |
| scan.create   | 스캔 생성 | Create Scan | スキャン作成 |

#### 2. 번역 파일 자동 생성 스크립트

```javascript
// scripts/sync-translations.js
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
const path = require('path');

async function syncTranslations() {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  const translations = { ko: {}, en: {}, ja: {} };

  rows.forEach(row => {
    const key = row.key;
    translations.ko[key] = row.ko;
    translations.en[key] = row.en;
    translations.ja[key] = row.ja;
  });

  // JSON 파일 생성
  Object.entries(translations).forEach(([lang, data]) => {
    const filePath = path.join(__dirname, `../public/locales/${lang}/common.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  });

  console.log('✅ Translation files synced successfully');
}

syncTranslations();
```

#### 3. CI/CD 파이프라인 통합

```yaml
# .github/workflows/sync-translations.yml
name: Sync Translations
on:
  schedule:
    - cron: '0 0 * * *'  # 매일 자정 실행
  workflow_dispatch:      # 수동 실행 가능

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run sync:translations
        env:
          GOOGLE_SHEET_ID: ${{ secrets.GOOGLE_SHEET_ID }}
          GOOGLE_SERVICE_ACCOUNT_EMAIL: ${{ secrets.GOOGLE_SERVICE_ACCOUNT_EMAIL }}
          GOOGLE_PRIVATE_KEY: ${{ secrets.GOOGLE_PRIVATE_KEY }}
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: sync translations from Google Spreadsheet'
          commit-message: 'chore: update translations'
```

#### 4. 워크플로우

1. **기획자**: Google Spreadsheet에서 번역 추가/수정
2. **자동화**: 매일 자정 또는 배포 전 스크립트 실행으로 JSON 파일 생성
3. **개발자**: PR 확인 후 머지 및 배포

#### 5. 장점

- 기획자가 코드 수정 없이 번역 관리 가능
- Git 히스토리로 번역 변경 이력 추적
- 동기화 타이밍을 개발팀에서 제어 가능
- Spreadsheet의 필터/정렬 기능으로 번역 누락 확인 용이

<br />

## ◾️ 설계 및 구현

### 컴포넌트 확장성

#### 1. Provider별 Credentials 폼 분리 구조

```typescript
// src/components/credentials/CredentialsForm.tsx
{
  provider === 'AWS' && (
    <AWSCredentialsForm
      credentials = { credentials as AWSCredential }
  onChange = { onChange as(cred
:
  AWSCredential
) =>
  void
}
  disabled = { disabled }
  />
)
}
{
  provider === 'AZURE' && (
    <AzureCredentialsForm
      credentials = { credentials as AzureCredential }
  onChange = { onChange as(cred
:
  AzureCredential
) =>
  void
}
  disabled = { disabled }
  />
)
}
{
  provider === 'GCP' && (
    <GCPCredentialsForm
      credentials = { credentials as GCPCredential }
  onChange = { onChange as(cred
:
  GCPCredential
) =>
  void
}
  disabled = { disabled }
  />
)
}
```

**확장 포인트**:

- 새 프로바이더(예: Oracle Cloud) 추가 시 `OracleCredentialsForm.tsx` 생성 후 조건문만 추가
- 각 프로바이더별 폼이 완전히 독립된 파일로 분리되어 있어 기존 코드 수정 최소화
- 파일 구조: `src/components/credentials/{Provider}CredentialsForm.tsx`

#### 2. Frequency별 동적 폼 필드 생성

```typescript
// src/components/ScanScheduleSection.tsx
{
  frequency === 'MONTH' && (
    <DateSelector / >  // 월별 스케줄: 날짜 선택
  )
}
{
  frequency === 'WEEK' && (
    <WeekdaySelector / >  // 주별 스케줄: 요일 선택
  )
}
{
  (frequency === 'DAY' || frequency === 'WEEK' || frequency === 'MONTH') && (
    <HourSelector / >  // 시간 선택
  )
}
```

**확장 포인트**:

- frequency 타입 추가 시 해당 조건문과 UI만 추가하면 됨
- 각 빈도별 필요한 필드가 조건부로 렌더링되어 불필요한 입력 최소화

#### 3. 타입 기반 확장 설계

```typescript
// src/types/types.ts - Union Type 활용
export type Provider = 'AWS' | 'AZURE' | 'GCP';
export type AWSCredentialType = 'ACCESS_KEY' | 'ASSUME_ROLE' | 'ROLES_ANYWHERE';
export type ScheduleFrequency = 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';

// defaults.ts - Provider별 기본값 중앙 관리
export const DEFAULT_CREDENTIALS = {
  AWS: { accessKey: '', secretKey: '', ... },
  AZURE: { tenantId: '', clientId: '', ... },
  GCP: { jsonText: '' },
};
```

**확장 포인트**:

- 타입에 새 옵션 추가 시 TypeScript가 누락된 케이스를 컴파일 타임에 검출
- 기본값이 `defaults.ts`에 중앙화되어 있어 일관성 유지 용이

<br />

### UX 센스

사용자 경험을 고려한 디테일:

#### 1. 로딩 상태 관리

수정 모드에서 데이터를 불러올 때 로딩 상태를 표시합니다.

**구현 위치**: `src/components/CloudDialog.tsx:109-153`

**UX 효과**:

- 데이터 로드 중 "Loading..." 표시로 사용자에게 진행 상황 전달
- 로딩 중에는 폼 대신 로딩 메시지를 보여줌
- API 지연 시뮬레이션(0~500ms)으로 실제 환경 테스트 가능

#### 2. 필수 항목 시각적 표시

빨간 별표(*)로 필수 입력 항목을 명확히 표시합니다.

**구현 위치**: `src/components/CloudDialog.tsx:159`, `src/components/ScanScheduleSection.tsx:115, 139, 171, 194`

**UX 효과**: 사용자가 어떤 필드를 반드시 입력해야 하는지 즉시 파악 가능

#### 3. 상태별 색상 코딩

상태에 따라 일관된 색상 패턴을 적용합니다.

**구현 위치**: `src/components/CloudManagementTable.tsx:91-110`

- **초록색** (`bg-green-100 text-green-800`): 활성/정상 상태 (Valid, ON)
- **회색** (`bg-gray-100 text-gray-800`): 비활성 상태 (InValid, OFF)

**UX 효과**: 텍스트를 읽지 않아도 색상만으로 상태 파악 가능

#### 4. 필수 리전 잠금 처리

필수 리전(global)은 체크박스를 비활성화하여 실수로 해제되지 않도록 방지합니다.

**구현 위치**: `src/components/CloudDialog.tsx:286-321`

**UX 효과**:

- `disabled={isRequired}`로 필수 리전 해제 방지
- `cursor-not-allowed opacity-60`으로 비활성 상태 시각화
- "(필수)" 텍스트로 비활성화 이유 명확히 안내

#### 5. 호버 인터랙션

클릭 가능한 요소에 마우스 오버 시 시각적 피드백을 제공합니다.

**구현 예시**:

- Select: `hover:border-gray-400`로 테두리 색상 변경
- Label: `hover:text-blue-600`로 텍스트 색상 변경
- Button: `hover:bg-gray-100`으로 배경색 변경
- 모든 호버 효과에 `transition-all` 적용

**UX 효과**: 인터랙티브 요소임을 직관적으로 전달

#### 6. 스크롤 가능한 영역 제한

긴 목록은 제한된 높이 내에서 스크롤하도록 설계합니다.

**구현 위치**:

- 다이얼로그 전체: `max-h-[500px] overflow-y-auto` (CloudDialog.tsx:143)
- 리전 목록: `max-h-48 overflow-y-auto` (CloudDialog.tsx:286)
- 시간/분 선택: `max-h-[200px]` (ScanScheduleSection.tsx:124, 180, 203)

**UX 효과**:

- 다이얼로그가 화면 밖으로 나가지 않음
- 중요한 필드(버튼 등)는 항상 보이고, 긴 목록만 스크롤

#### 7. 컨텍스트별 동적 버튼 텍스트

생성/수정 모드에 따라 버튼 텍스트를 동적으로 변경합니다.

**구현 위치**: `src/components/CloudDialog.tsx:414`

```
{isEditMode ? '수정하기' : '생성하기'}
```

**UX 효과**:

- 현재 수행할 작업이 무엇인지 명확히 전달
- 로딩 중에는 `disabled={isLoading}`으로 중복 제출 방지

#### 8. 스케줄 미리보기

설정한 스케줄을 한국어로 변환하여 미리 보여줍니다.

**구현 위치**: `src/components/ScanScheduleSection.tsx:214-217, 225-252`

**예시 출력**:

- `매시간 30분`
- `매일 14:30`
- `매주 월요일 09:00`
- `매월 15일 18:00`

**UX 효과**: 설정값을 사람이 읽기 쉬운 형태로 확인하여 입력 오류 방지

#### 9. 태그 형태의 다중 선택 시각화

선택된 클라우드 그룹을 파란색 배지로 표시합니다.

**구현 위치**: `src/components/CloudManagementTable.tsx:73-83`

**UX 효과**:

- 여러 항목을 콤팩트하게 표시
- `flex-wrap`으로 공간에 맞게 자동 줄바꿈
- 일관된 색상(blue-100/blue-800)으로 시각적 통일성 유지
