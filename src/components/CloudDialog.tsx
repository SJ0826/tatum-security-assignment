import React, { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import {
  AWSCredentialType,
  AWSEventSource,
  AzureCredentialType,
  AzureEventSource,
  Cloud,
  GCPCredentialType,
  GCPEventSource,
  Provider,
} from '@/src/types/types';
import cloudData from '@/src/data/cloude-data.json';
import ScanScheduleSection from '@/src/components/ScanScheduleSection';
import { CredentialsForm } from '@/src/components/credentials/CredentialsForm';
import { DEFAULT_CREDENTIALS } from '@/src/components/credentials/defaults';

// Constants
const CLOUD_GROUPS = [
  'AWS-Group',
  'DEV-Group',
  'PROD-Group',
  'AZURE-Group',
  'GCP-Group',
];

const AWS_REGIONS = [
  'global',
  'us-east-1',
  'us-west-2',
  'ap-northeast-2',
  'ap-northeast-1',
  'eu-west-1',
];

const REQUIRED_REGIONS = ['global'];

interface CloudDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cloudId?: string | undefined; // 전달되는 Id가 존재하면 수정모드
}

// API 호출을 시뮬레이션하는 비동기 함수 (0~500ms 딜레이)
const fetchCloudData = async (id: string): Promise<Cloud | undefined> => {
  const delay = Math.random() * 500; // 0~500ms 랜덤 딜레이
  await new Promise(resolve => setTimeout(resolve, delay));
  return cloudData.find(c => c.id === id) as Cloud | undefined;
};

const CloudDialog = ({ open, onOpenChange, cloudId }: CloudDialogProps) => {
  const isEditMode = !!cloudId;
  const [formData, setFormData] = useState<Partial<Cloud>>({
    provider: 'AWS',
    name: '',
    cloudGroupName: [],
    eventProcessEnabled: true,
    userActivityEnabled: false,
    scheduleScanEnabled: false,
    regionList: [],
    credentials: DEFAULT_CREDENTIALS.AWS,
    credentialType: 'ACCESS_KEY',
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleGroup = (group: string) => {
    setFormData(prev => ({
      ...prev,
      cloudGroupName: prev.cloudGroupName?.includes(group)
        ? prev.cloudGroupName.filter(g => g !== group)
        : [...(prev.cloudGroupName || []), group],
    }));
  };

  const toggleRegion = (region: string) => {
    // 필수 리전은 토글 불가
    if (REQUIRED_REGIONS.includes(region)) return;

    setFormData(prev => ({
      ...prev,
      regionList: prev.regionList?.includes(region)
        ? prev.regionList.filter(r => r !== region)
        : [...(prev.regionList || []), region],
    }));
  };

  const handleSubmit = async () => {
    // await mockApiCall(payload);
    onOpenChange(false);
  };

  useEffect(() => {
    const loadCloudData = async () => {
      if (cloudId) {
        setIsLoading(true);
        try {
          const cloud = await fetchCloudData(cloudId);
          if (cloud) setFormData(cloud);
        } catch (error) {
          console.error('Failed to load cloud data:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // 생성 모드일 때 초기화 - 필수 리전 자동 포함
        setFormData({
          provider: 'AWS',
          name: '',
          cloudGroupName: [],
          eventProcessEnabled: true,
          userActivityEnabled: false,
          scheduleScanEnabled: false,
          regionList: REQUIRED_REGIONS,
          credentials: DEFAULT_CREDENTIALS.AWS,
          credentialType: 'ACCESS_KEY',
        });
      }
    };

    if (open) {
      loadCloudData();
    }
  }, [cloudId, open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={'max-h-[500px] overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-blue-600">☁️</span>
            {isEditMode ? 'Edit Cloud' : 'Create Cloud'}
          </DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* 📝 Cloud Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Cloud Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Please enter the cloud name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="transition-all focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 📝 Provider */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Select Provider</Label>
              <Select
                value={formData.provider ?? ''}
                onValueChange={value => {
                  const newProvider = value as Provider;
                  const credentialTypeMap = {
                    AWS: 'ACCESS_KEY' as AWSCredentialType,
                    AZURE: 'APPLICATION' as AzureCredentialType,
                    GCP: 'JSON_TEXT' as GCPCredentialType,
                  };
                  console.log(newProvider);
                  setFormData({
                    ...formData,
                    provider: newProvider,
                    credentials: DEFAULT_CREDENTIALS[newProvider],
                    credentialType: credentialTypeMap[newProvider],
                  });
                }}
              >
                <SelectTrigger className="transition-all hover:border-gray-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AWS">AWS</SelectItem>
                  <SelectItem value="AZURE" disabled>
                    Azure (Coming Soon)
                  </SelectItem>
                  <SelectItem value="GCP" disabled>
                    GCP (Coming Soon)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 📝 Cloud Groups - Multi Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cloud Groups</Label>
              <div className="border rounded-md p-3 space-y-2 bg-gray-50">
                {CLOUD_GROUPS.map(group => (
                  <div key={group} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={group}
                      checked={formData.cloudGroupName?.includes(group)}
                      onChange={() => toggleGroup(group)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label
                      htmlFor={group}
                      className="text-sm cursor-pointer hover:text-blue-600"
                    >
                      {group}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* 📝 Credential Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Credential Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.credentialType ?? ''}
                onValueChange={value =>
                  setFormData({
                    ...formData,
                    credentialType: value as
                      | AWSCredentialType
                      | AzureCredentialType
                      | GCPCredentialType,
                  })
                }
              >
                <SelectTrigger className="transition-all hover:border-gray-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formData.provider === 'AWS' && (
                    <>
                      <SelectItem value="ACCESS_KEY">Access Key</SelectItem>
                      <SelectItem value="'ASSUME_ROLE'">Assume Role</SelectItem>
                      <SelectItem value="ROLES_ANYWHERE">
                        Roles Anywhere
                      </SelectItem>
                    </>
                  )}
                  {formData.provider === 'AZURE' && (
                    <SelectItem value="APPLICATION">Application</SelectItem>
                  )}
                  {formData.provider === 'GCP' && (
                    <SelectItem value="JSON_TEXT">JSON Text</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 📝 Credentials */}
            <CredentialsForm
              provider={formData.provider || 'AWS'}
              credentials={formData.credentials!}
              onChange={newCredentials =>
                setFormData({ ...formData, credentials: newCredentials })
              }
            />

            {/* 📝 Regions - Multi Select */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Region <span className="text-gray-400">(global 포함 필수)</span>
              </Label>
              <div className="border rounded-md p-3 space-y-2 bg-gray-50 max-h-48 overflow-y-auto">
                {AWS_REGIONS.map(region => {
                  const isRequired = REQUIRED_REGIONS.includes(region);
                  return (
                    <div key={region} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={region}
                        checked={formData.regionList?.includes(region)}
                        onChange={() => toggleRegion(region)}
                        disabled={isRequired}
                        className={`w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                          isRequired
                            ? 'cursor-not-allowed opacity-60'
                            : 'cursor-pointer'
                        }`}
                      />
                      <label
                        htmlFor={region}
                        className={`text-sm ${
                          isRequired
                            ? 'cursor-not-allowed text-gray-600'
                            : 'cursor-pointer hover:text-blue-600'
                        }`}
                      >
                        {region}
                        {isRequired && (
                          <span className="ml-2 text-xs text-red-500">
                            (필수)
                          </span>
                        )}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 📝 Scan Schedule */}
            <ScanScheduleSection
              formData={formData}
              setFormData={setFormData}
            />

            {/* 📝 Event Source */}
            {formData.provider === 'AWS' && (
              <div className="space-y-2">
                <Label htmlFor="cloudTrailName" className="text-sm font-medium">
                  CloudTrail Name
                </Label>
                <Input
                  id="cloudTrailName"
                  placeholder="Please enter the CloudTrail name"
                  value={
                    (formData.eventSource as AWSEventSource)?.cloudTrailName ||
                    ''
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      eventSource: {
                        cloudTrailName: e.target.value,
                      } as AWSEventSource,
                    })
                  }
                />
              </div>
            )}

            {(formData.provider === 'AZURE' || formData.provider === 'GCP') && (
              <div className="space-y-2">
                <Label
                  htmlFor="storageAccountName"
                  className="text-sm font-medium"
                >
                  Storage Account Name
                </Label>
                <Input
                  id="storageAccountName"
                  placeholder="Please enter the storage account name"
                  value={
                    (formData.eventSource as AzureEventSource | GCPEventSource)
                      ?.storageAccountName || ''
                  }
                  onChange={e =>
                    setFormData({
                      ...formData,
                      eventSource: {
                        storageAccountName: e.target.value,
                      } as AzureEventSource | GCPEventSource,
                    })
                  }
                />
              </div>
            )}

            {/* 📝 Proxy URL */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="proxy" className="text-sm font-medium">
                  Proxy URL
                </Label>
              </div>
              <Input
                id="proxy"
                placeholder="Please enter the proxy URL"
                value={formData.proxyUrl || ''}
                onChange={e =>
                  setFormData({ ...formData, proxyUrl: e.target.value })
                }
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hover:bg-gray-100"
          >
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isEditMode ? '수정하기' : '생성하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloudDialog;
