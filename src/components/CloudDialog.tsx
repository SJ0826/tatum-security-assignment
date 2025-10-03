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
import { Cloud, Provider, AWSCredential } from '@/src/types/types';
import cloudData from '@/src/data/cloude-data.json';
import ScanScheduleSection from '@/src/components/ScanScheduleSection';

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
    credentials: {
      accessKeyId: '',
      secretAccessKey: '',
    },
  });

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
    if (cloudId) {
      const cloud = cloudData.find(c => c.id === cloudId);

      if (cloud) setFormData(cloud as Cloud);
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
        credentials: {
          accessKeyId: '',
          secretAccessKey: '',
        },
      });
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
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="transition-all focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 📝 Provider */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Provider</Label>
            <Select
              value={formData.provider ?? ''}
              onValueChange={value =>
                setFormData({ ...formData, provider: value as Provider })
              }
            >
              <SelectTrigger className="transition-all hover:border-gray-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AWS">AWS</SelectItem>
                <SelectItem value="Azure" disabled>
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

          {/* 📝 Credentials */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">Credentials</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessKeyId" className="text-sm">
                Access Key ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="accessKeyId"
                placeholder="AKIA..."
                value={
                  (formData.credentials as AWSCredential)?.accessKeyId || ''
                }
                onChange={e =>
                  setFormData({
                    ...formData,
                    credentials: {
                      ...(formData.credentials as AWSCredential),
                      accessKeyId: e.target.value,
                    },
                  })
                }
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
                value={
                  (formData.credentials as AWSCredential)?.secretAccessKey || ''
                }
                onChange={e =>
                  setFormData({
                    ...formData,
                    credentials: {
                      ...(formData.credentials as AWSCredential),
                      secretAccessKey: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

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
          <ScanScheduleSection formData={formData} setFormData={setFormData} />

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
          >
            {isEditMode ? '수정하기' : '생성하기'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CloudDialog;
