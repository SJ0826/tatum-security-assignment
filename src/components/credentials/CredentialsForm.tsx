import React from 'react';

import {
  AWSCredential,
  AzureCredential,
  GCPCredential,
  Provider,
} from '@/src/types/types';

import { AWSCredentialsForm } from './AWSCredentialsForm';
import { AzureCredentialsForm } from './AzureCredentialsForm';
import { GCPCredentialsForm } from './GCPCredentialsForm';
import { CredentialsByProvider } from './types';

interface CredentialsFormProps {
  provider: Provider;
  credentials: CredentialsByProvider[Provider];
  onChange: (credentials: CredentialsByProvider[Provider]) => void;
  disabled?: boolean;
}

export const CredentialsForm = ({
  provider,
  credentials,
  onChange,
  disabled = false,
}: CredentialsFormProps) => {
  return (
    <>
      {provider === 'AWS' && (
        <AWSCredentialsForm
          credentials={credentials as AWSCredential}
          onChange={onChange as (cred: AWSCredential) => void}
          disabled={disabled}
        />
      )}
      {provider === 'AZURE' && (
        <AzureCredentialsForm
          credentials={credentials as AzureCredential}
          onChange={onChange as (cred: AzureCredential) => void}
          disabled={disabled}
        />
      )}
      {provider === 'GCP' && (
        <GCPCredentialsForm
          credentials={credentials as GCPCredential}
          onChange={onChange as (cred: GCPCredential) => void}
          disabled={disabled}
        />
      )}
    </>
  );
};
