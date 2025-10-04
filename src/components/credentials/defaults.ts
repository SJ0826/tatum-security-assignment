import {
  AWSCredential,
  AzureCredential,
  GCPCredential,
} from '@/src/types/types';

import { CredentialsByProvider } from './types';

export const DEFAULT_CREDENTIALS: CredentialsByProvider = {
  AWS: {
    accessKeyId: '',
    secretAccessKey: '',
  } as AWSCredential,
  AZURE: {
    tenantId: '',
    subscriptionId: '',
    applicationId: '',
    secretKey: '',
  } as AzureCredential,
  GCP: {
    jsonText: '',
  } as GCPCredential,
} as const;
