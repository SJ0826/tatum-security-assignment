// ==========================📌 제공받은 타입===========================

type Provider = 'AWS' | 'AZURE' | 'GCP'; // 프로바이더 예시, AWS만 활성화

export const AWSRegionList = [
  'global',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ca-central-1',
  'eu-central-1',
  'eu-north-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
] as const;

type AWSCredentialType = 'ACCESS_KEY' | 'ASSUME_ROLE' | 'ROLES_ANYWHERE'; // AWS 크리덴셜 타입 예시, ACCESS_KEY만 활성화

interface AWSCredential {
  accessKeyId: string;
  secretAccessKey: string;
  roleArn?: string;
}

interface AWSEventSource {
  cloudTrailName?: string;
}

// 타 프로바이더 예시, 미사용
type AzureCredentialType = 'APPLICATION';

interface AzureCredential {
  tenantId: string;
  subscriptionId: string;
  applicationId: string;
  secretKey: string;
}

interface AzureEventSource {
  storageAccountName?: string;
}

type GCPCredentialType = 'JSON_TEXT';

interface GCPCredential {
  projectId?: string;
  jsonText: string;
}

interface GCPEventSource {
  storageAccountName?: string;
}

interface ScheduleScanSetting {
  /**
   * frequency에 따라 각 필드의 필수 여부가 변경됨. 어떤 필드가 필수로 올지는 자유롭게 선택
   * HOUR  : 매시간을 의미
   * DAY   : 매일을 의미
   * WEEK  : 매주을 의미
   * MONTH : 매월을 의미
   */
  frequency: 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
  date?: string; // '1' ~ '28'
  weekday?: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  hour?: string; // '0' ~ '23'
  minute?: string; // '0' ~ '60', '5' 단위로 증가
}

// 상세 정보 불러오는 API를 GET, 저장하는 API를 PUT으로 가정
export interface Cloud {
  id: string; // GET 요청 시 획득
  provider: Provider;
  name: string;
  cloudGroupName?: string[]; // 선택 가능한 cloudGroupName 목록을 서버에서 받아야하지만, 편의상 상수로 선언하여 사용
  eventProcessEnabled: boolean;
  userActivityEnabled: boolean;
  scheduleScanEnabled: boolean;
  scheduleScanSetting?: ScheduleScanSetting; // scheduleScanEnabled = true 인 경우만 존재
  regionList: string[];
  proxyUrl?: string;
  /**
   * 비밀 값이라 GET 요쳥 시 마스킹 상태로 데이터 전송됨. 마스킹된 값을 UI에서 어떻게 활용할지는 자유
   * 예 : { accessKeyId: "AKIA********18", secretAccessKey: "jZd1********0n" }
   */
  credentials: AWSCredential | AzureCredential | GCPCredential;
  credentialType: AWSCredentialType | AzureCredentialType | GCPCredentialType;
  /**
   * 비밀 값이 아니라 마스킹되지 않음
   */
  eventSource?: AWSEventSource | AzureEventSource | GCPEventSource;
}
