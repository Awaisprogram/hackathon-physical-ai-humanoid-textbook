import React from 'react';
import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  type?: 'text' | 'circle' | 'rectangle' | 'avatar' | 'card';
  width?: string | number;
  height?: string | number;
  count?: number;
  borderRadius?: string;
  className?: string;
  animated?: boolean;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'text',
  width = '100%',
  height,
  count = 1,
  borderRadius = '4px',
  className = '',
  animated = true,
  ...props
}) => {
  // Set default height based on type
  const getDefaultHeight = () => {
    switch (type) {
      case 'circle':
      case 'avatar':
        return '40px';
      case 'card':
        return '120px';
      case 'rectangle':
        return '60px';
      default: // text
        return '16px';
    }
  };

  const getHeight = () => height || getDefaultHeight();

  const renderSkeleton = (index: number) => {
    const style = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof getHeight() === 'number' ? `${getHeight()}px` : getHeight(),
      borderRadius: type === 'circle' || type === 'avatar' ? '50%' : borderRadius,
    };

    const classes = [
      'auth-skeleton',
      `auth-skeleton--${type}`,
      animated ? 'auth-skeleton--animated' : '',
      className
    ].filter(Boolean).join(' ');

    return (
      <span
        key={index}
        className={classes}
        style={style}
        {...props}
        aria-label="Loading content"
      />
    );
  };

  return (
    <div className="auth-skeleton-container">
      {Array.from({ length: count }, (_, index) => renderSkeleton(index))}
    </div>
  );
};

export default LoadingSkeleton;