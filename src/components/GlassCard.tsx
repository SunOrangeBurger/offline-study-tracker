import React, { CSSProperties } from 'react';
import { useTheme } from './ThemeProvider';

interface GlassCardProps {
  children: React.ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  onClick,
  hover = false 
}) => {
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: colors.secondary,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.border}`,
        borderRadius: '16px',
        padding: '1.5rem',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: isHovered && hover
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          : '0 1px 3px rgba(0, 0, 0, 0.05)',
        transform: isHovered && hover ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
