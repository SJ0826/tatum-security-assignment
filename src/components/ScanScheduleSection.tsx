// Scan Schedule 부분만
import { Cloud, ScheduleScanSetting } from '@/src/types/types';
import { Label } from '@/src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/src/components/ui/radio-group';

function ScanScheduleSection({
  formData,
  setFormData,
}: {
  formData: Partial<Cloud>;
  setFormData: React.Dispatch<React.SetStateAction<Partial<Cloud>>>;
}) {
  const frequency = formData.scheduleScanSetting?.frequency || 'DAY';

  const updateSchedule = (updates: Partial<ScheduleScanSetting>) => {
    setFormData(prev => ({
      ...prev,
      scheduleScanSetting: {
        frequency: 'DAY',
        hour: '12',
        minute: '0',
        ...prev.scheduleScanSetting,
        ...updates,
      },
    }));
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Scan Schedule Setting</Label>
      <div className="space-y-4 p-4 border rounded-md bg-white">
        {/* Enable/Disable */}
        <RadioGroup
          value={formData.scheduleScanEnabled ? 'enabled' : 'disabled'}
          onValueChange={value => {
            setFormData(prev => {
              const enabled = value === 'enabled';
              const update: Partial<Cloud> = {
                ...prev,
                scheduleScanEnabled: enabled,
              };
              if (enabled) {
                update.scheduleScanSetting = {
                  frequency: 'DAY',
                  hour: '12',
                  minute: '0',
                };
              } else {
                delete update.scheduleScanSetting;
              }
              return update;
            });
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="enabled" id="enabled" />
            <Label htmlFor="enabled" className="cursor-pointer">
              Enabled
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="disabled" id="disabled" />
            <Label htmlFor="disabled" className="cursor-pointer">
              Disabled
            </Label>
          </div>
        </RadioGroup>

        {formData.scheduleScanEnabled && (
          <div className="space-y-4 pt-4 border-t">
            {/* Frequency 선택 */}
            <div className="space-y-2">
              <Label className="text-sm">Set Scan Frequency</Label>
              <Select
                value={frequency}
                onValueChange={value => {
                  const update: Partial<ScheduleScanSetting> = {
                    frequency: value as ScheduleScanSetting['frequency'],
                    hour: '12',
                    minute: '0',
                  };
                  // frequency 변경 시 다른 필드 제거
                  setFormData(prev => ({
                    ...prev,
                    scheduleScanSetting: {
                      ...update,
                    } as ScheduleScanSetting,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOUR">Every Hour</SelectItem>
                  <SelectItem value="DAY">Daily</SelectItem>
                  <SelectItem value="WEEK">Weekly</SelectItem>
                  <SelectItem value="MONTH">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MONTH일 때: Date 선택 */}
            {frequency === 'MONTH' && (
              <div className="space-y-2">
                <Label className="text-sm">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.scheduleScanSetting?.date || '1'}
                  onValueChange={value => updateSchedule({ date: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {Array.from({ length: 28 }, (_, i) => i + 1).map(day => (
                      <SelectItem key={day} value={String(day)}>
                        {day}일
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* WEEK일 때: Weekday 선택 */}
            {frequency === 'WEEK' && (
              <div className="space-y-2">
                <Label className="text-sm">
                  Day of Week <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.scheduleScanSetting?.weekday || 'MON'}
                  onValueChange={value =>
                    updateSchedule({
                      weekday: value as ScheduleScanSetting['weekday'],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MON">Monday</SelectItem>
                    <SelectItem value="TUE">Tuesday</SelectItem>
                    <SelectItem value="WED">Wednesday</SelectItem>
                    <SelectItem value="THU">Thursday</SelectItem>
                    <SelectItem value="FRI">Friday</SelectItem>
                    <SelectItem value="SAT">Saturday</SelectItem>
                    <SelectItem value="SUN">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* DAY, WEEK, MONTH일 때: Hour 선택 */}
            {(frequency === 'DAY' ||
              frequency === 'WEEK' ||
              frequency === 'MONTH') && (
              <div className="space-y-2">
                <Label className="text-sm">
                  Hour <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.scheduleScanSetting?.hour || '12'}
                  onValueChange={value => updateSchedule({ hour: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {String(i).padStart(2, '0')}시
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 모든 frequency: Minute 선택 (5분 단위) */}
            <div className="space-y-2">
              <Label className="text-sm">
                Minute <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.scheduleScanSetting?.minute || '0'}
                onValueChange={value => updateSchedule({ minute: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Array.from({ length: 12 }, (_, i) => i * 5).map(min => (
                    <SelectItem key={min} value={String(min)}>
                      {String(min).padStart(2, '0')}분
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 현재 설정 미리보기 */}
            <div className="p-3 bg-blue-50 rounded-md text-sm text-blue-900">
              <strong>Scan Schedule:</strong>{' '}
              {getScheduleText(formData.scheduleScanSetting!)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 스케줄 텍스트 생성 헬퍼 함수
function getScheduleText(setting: ScheduleScanSetting): string {
  const { frequency, date, weekday, hour, minute } = setting;

  const timeStr =
    hour && minute ? `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}` : '';

  switch (frequency) {
    case 'HOUR':
      return `매시간 ${minute}분`;
    case 'DAY':
      return `매일 ${timeStr}`;
    case 'WEEK':
      const weekdayMap: Record<string, string> = {
        MON: '월요일',
        TUE: '화요일',
        WED: '수요일',
        THU: '목요일',
        FRI: '금요일',
        SAT: '토요일',
        SUN: '일요일',
      };
      return `매주 ${weekdayMap[weekday || 'MON']} ${timeStr}`;
    case 'MONTH':
      return `매월 ${date}일 ${timeStr}`;
    default:
      return '';
  }
}

export default ScanScheduleSection;
