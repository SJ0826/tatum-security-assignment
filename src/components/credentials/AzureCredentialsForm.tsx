import React from 'react';

import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { AzureCredential } from '@/src/types/types';

import { BaseCredentialsFormProps } from './types';

type AzureCredentialsFormProps = BaseCredentialsFormProps<AzureCredential>;

export const AzureCredentialsForm = ({
  credentials,
  onChange,
  disabled = false,
}: AzureCredentialsFormProps) => {
  const handleFieldChange = (field: keyof AzureCredential, value: string) => {
    onChange({
      ...credentials,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tenantId" className="text-sm">
          Tenant ID <span className="text-red-500">*</span>
        </Label>
        <Input
          id="tenantId"
          placeholder="Enter tenant ID"
          value={credentials.tenantId || ''}
          onChange={e => handleFieldChange('tenantId', e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subscriptionId" className="text-sm">
          Subscription ID <span className="text-red-500">*</span>
        </Label>
        <Input
          id="subscriptionId"
          placeholder="Enter subscription ID"
          value={credentials.subscriptionId || ''}
          onChange={e => handleFieldChange('subscriptionId', e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="applicationId" className="text-sm">
          Application ID <span className="text-red-500">*</span>
        </Label>
        <Input
          id="applicationId"
          placeholder="Enter application ID"
          value={credentials.applicationId || ''}
          onChange={e => handleFieldChange('applicationId', e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secretKey" className="text-sm">
          Secret Key <span className="text-red-500">*</span>
        </Label>
        <Input
          id="secretKey"
          type="password"
          placeholder="Enter secret key"
          value={credentials.secretKey || ''}
          onChange={e => handleFieldChange('secretKey', e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
