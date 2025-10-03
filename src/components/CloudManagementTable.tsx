'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PlusIcon } from 'lucide-react';

import logo from '@/public/logo.png';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table';
import cloudData from '@/src/data/cloude-data.json';
import { Button } from '@/src/components/ui/button';
import CloudDialog from '@/src/components/CloudDialog';

const CloudManagementTable = () => {
  const [isOpenCloudDialog, setIsOpenCloudDialog] = useState(false);
  const [selectedCloudId, setSelectedCloudId] = useState<string | undefined>();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Image src={logo} alt={'Logo'} width={170} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Cloude Management
          </h2>
          <Button
            size={'lg'}
            onClick={() => {
              setSelectedCloudId(undefined);
              setIsOpenCloudDialog(true);
            }}
            className={'bg-blue-500 hover:bg-blue-600 text-lg'}
          >
            <PlusIcon /> 생성하기
          </Button>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-sm shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Cloud Group</TableHead>
                <TableHead>Regions</TableHead>
                <TableHead>Event Process</TableHead>
                <TableHead>User Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cloudData.map(cloud => (
                <TableRow key={cloud.id}>
                  <TableCell className="font-medium">
                    {cloud.provider}
                  </TableCell>
                  <TableCell>{cloud.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {cloud.cloudGroupName?.map(group => (
                        <span
                          key={group}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
                          {group}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {cloud.regionList.join(', ')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        cloud.eventProcessEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cloud.eventProcessEnabled ? 'Valid' : 'InValid'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded ${
                        cloud.userActivityEnabled
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {cloud.userActivityEnabled ? 'ON' : 'OFF'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => {
                        setSelectedCloudId(cloud.id);
                        setIsOpenCloudDialog(true);
                      }}
                      variant={'outline'}
                      size={'sm'}
                    >
                      수정
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      <CloudDialog
        open={isOpenCloudDialog}
        onOpenChange={setIsOpenCloudDialog}
        cloudId={selectedCloudId}
      />
    </div>
  );
};

export default CloudManagementTable;
