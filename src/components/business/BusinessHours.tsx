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
  '12:00 AM', '12:30 AM', '1:00 AM', '1:30 AM', '2:00 AM', '2:30 AM', '3:00 AM', '3:30 AM',
  '4:00 AM', '4:30 AM', '5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM',
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM'
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
    return businessHours[day] || { open: '9:00 AM', close: '5:00 PM', closed: false };
  };

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">Business Hours</h3>
      <div className="bg-card border rounded-lg overflow-hidden">
        {DAYS.map(({ key, label }, index) => {
          const dayHours = getDayHours(key);
          return (
            <div 
              key={key} 
              className={`flex flex-row items-center gap-1 p-2 ${
                index !== DAYS.length - 1 ? 'border-b' : ''
              }`}
            >
              <div className="flex items-center gap-1 flex-shrink-0">
                <div className="w-12 text-xs font-medium">
                  {label.slice(0, 3)}
                </div>
                <Checkbox
                  checked={dayHours.closed}
                  onCheckedChange={(checked) => updateDayHours(key, 'closed', checked)}
                  className="h-1 w-1 scale-75"
                />
              </div>

              {!dayHours.closed ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Select
                    value={dayHours.open}
                    onValueChange={(value) => updateDayHours(key, 'open', value)}
                  >
                    <SelectTrigger className="w-16 h-5 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="w-20 max-h-48 overflow-y-auto z-50 bg-popover border shadow-md">
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time} className="text-xs py-1.5 cursor-pointer hover:bg-accent">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-xs">-</span>
                  <Select
                    value={dayHours.close}
                    onValueChange={(value) => updateDayHours(key, 'close', value)}
                  >
                    <SelectTrigger className="w-16 h-5 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="w-20 max-h-48 overflow-y-auto z-50 bg-popover border shadow-md">
                      {TIME_OPTIONS.map(time => (
                        <SelectItem key={time} value={time} className="text-xs py-1.5 cursor-pointer hover:bg-accent">
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">Closed</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};