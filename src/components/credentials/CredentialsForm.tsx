import React from 'react';

import { Label } from '@/src/components/ui/label';
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
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Credentials</Label>
      </div>
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
    </div>
  );
};
