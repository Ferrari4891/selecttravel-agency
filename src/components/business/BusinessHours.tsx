import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Control } from 'react-hook-form';

interface BusinessHoursProps {
  control: Control<any>;
  businessHours: Record<string, any>;
  onBusinessHoursChange: (hours: Record<string, any>) => void;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

const TIME_OPTIONS = [
  '00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30',
  '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'
];

export const BusinessHours: React.FC<BusinessHoursProps> = ({
  control,
  businessHours,
  onBusinessHoursChange
}) => {
  const updateDayHours = (day: string, field: string, value: any) => {
    const updatedHours = {
      ...businessHours,
      [day]: {
        ...businessHours[day],
        [field]: value
      }
    };
    onBusinessHoursChange(updatedHours);
  };

  const getDayHours = (day: string) => {
    return businessHours[day] || { open: '09:00', close: '17:00', closed: false };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Business Hours</h3>
      <div className="space-y-4">
        {DAYS.map(({ key, label }) => {
          const dayHours = getDayHours(key);
          return (
            <div key={key} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="w-24 text-sm font-medium">
                {label}
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={dayHours.closed}
                  onCheckedChange={(checked) => updateDayHours(key, 'closed', checked)}
                />
                <span className="text-sm">Closed</span>
              </div>

              {!dayHours.closed && (
                <>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={dayHours.open}
                      onValueChange={(value) => updateDayHours(key, 'open', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm">to</span>
                    <Select
                      value={dayHours.close}
                      onValueChange={(value) => updateDayHours(key, 'close', value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_OPTIONS.map(time => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};