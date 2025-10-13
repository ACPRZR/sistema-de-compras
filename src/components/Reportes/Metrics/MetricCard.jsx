import React from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon: Icon = ChartBarIcon,
  format = 'number',
  subtitle,
  loading = false
}) => {
  const formatValue = (val) => {
    if (loading) return '---';
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-ES', {
          style: 'currency',
          currency: 'PEN'
        }).format(val || 0);
      case 'percentage':
        return `${(val || 0).toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('es-ES').format(val || 0);
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') {
      return <ArrowUpIcon className="w-4 h-4" />;
    } else if (changeType === 'negative') {
      return <ArrowDownIcon className="w-4 h-4" />;
    }
    return <MinusIcon className="w-4 h-4" />;
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = () => {
    if (changeType === 'positive') {
      return <ArrowTrendingUpIcon className="w-5 h-5 text-green-500" />;
    } else if (changeType === 'negative') {
      return <ArrowTrendingDownIcon className="w-5 h-5 text-red-500" />;
    }
    return <ChartBarIcon className="w-5 h-5 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatValue(value)}
            </p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {change !== undefined && change !== null && (
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1">
                {Math.abs(change)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
