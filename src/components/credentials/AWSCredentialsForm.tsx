import React from 'react';

import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { AWSCredential } from '@/src/types/types';

import { BaseCredentialsFormProps } from './types';

type AWSCredentialsFormProps = BaseCredentialsFormProps<AWSCredential>;

export const AWSCredentialsForm = ({
  credentials,
  onChange,
  disabled = false,
}: AWSCredentialsFormProps) => {
  const handleFieldChange = (field: keyof AWSCredential, value: string) => {
    onChange({
      ...credentials,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="accessKeyId" className="text-sm">
          Access Key ID <span className="text-red-500">*</span>
        </Label>
        <Input
          id="accessKeyId"
          placeholder="AKIA..."
          value={credentials.accessKeyId || ''}
          onChange={e => handleFieldChange('accessKeyId', e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="secretAccessKey" className="text-sm">
          Secret Access Key <span className="text-red-500">*</span>
        </Label>
        <Input
          id="secretAccessKey"
          type="password"
          placeholder="Enter secret access key"
          value={credentials.secretAccessKey || ''}
          onChange={e => handleFieldChange('secretAccessKey', e.target.value)}
          disabled={disabled}
        />
      </div>

      {credentials.roleArn !== undefined && (
        <div className="space-y-2">
          <Label htmlFor="roleArn" className="text-sm">
            Role ARN
          </Label>
          <Input
            id="roleArn"
            placeholder="arn:aws:iam::..."
            value={credentials.roleArn || ''}
            onChange={e => handleFieldChange('roleArn', e.target.value)}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
};
