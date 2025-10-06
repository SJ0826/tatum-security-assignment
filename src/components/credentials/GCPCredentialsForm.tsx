import React from 'react';

import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { GCPCredential } from '@/src/types/types';

import { BaseCredentialsFormProps } from './types';

type GCPCredentialsFormProps = BaseCredentialsFormProps<GCPCredential>;

export const GCPCredentialsForm = ({
  credentials,
  onChange,
  disabled = false,
}: GCPCredentialsFormProps) => {
  const handleFieldChange = (field: keyof GCPCredential, value: string) => {
    onChange({
      ...credentials,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="projectId" className="text-sm">
          Project ID
        </Label>
        <Input
          id="projectId"
          placeholder="Enter project ID"
          value={credentials.projectId || ''}
          onChange={e => handleFieldChange('projectId', e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jsonText" className="text-sm">
          Service Account JSON <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="jsonText"
          className="w-full min-h-[120px] px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
          placeholder='{"type": "service_account", ...}'
          value={credentials.jsonText || ''}
          onChange={e => handleFieldChange('jsonText', e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
};
