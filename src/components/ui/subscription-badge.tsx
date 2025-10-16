import React from 'react';
import { Crown, Briefcase, DollarSign, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  tier: string | null;
  className?: string;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ 
  tier, 
  className 
}) => {
  const getBadgeConfig = (tier: string | null) => {
    switch (tier) {
      case 'firstclass':
        return {
          icon: Crown,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'First Class'
        };
      case 'premium':
      case 'business':
        return {
          icon: Briefcase,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          label: 'Business Class'
        };
      case 'basic':
      case 'economy':
        return {
          icon: DollarSign,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          label: 'Economy Class'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Trial'
        };
    }
  };

  const config = getBadgeConfig(tier);
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium border",
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
      style={{ borderRadius: '0' }}
      title={config.label}
    >
      <Icon size={12} />
      <span className="hidden sm:inline">{config.label}</span>
    </div>
  );
};