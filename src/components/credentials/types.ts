import {
  Provider,
  AWSCredential,
  AzureCredential,
  GCPCredential,
} from '@/src/types/types';

export interface BaseCredentialsFormProps<T> {
  credentials: T;
  onChange: (credentials: T) => void;
  disabled?: boolean;
}

export type CredentialsByProvider = {
  AWS: AWSCredential;
  AZURE: AzureCredential;
  GCP: GCPCredential;
};

export type CredentialsFormProps<P extends Provider> = {
  provider: P;
  credentials: CredentialsByProvider[P];
  onChange: (credentials: CredentialsByProvider[P]) => void;
  disabled?: boolean;
};
