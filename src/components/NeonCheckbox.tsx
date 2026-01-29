import React from 'react';
import { useTheme } from './ThemeProvider';

interface NeonCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const NeonCheckbox: React.FC<NeonCheckboxProps> = ({ checked, onChange, label }) => {
  const { colors } = useTheme();

  return (
    <label
      style={{
        position: 'relative',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      
      <div style={{ position: 'relative', width: '30px', height: '30px' }}>
        {/* Main Box */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '4px',
            border: `2px solid ${checked ? colors.accent : colors.border}`,
            transition: 'all 0.4s ease',
            transform: checked ? 'scale(1.05)' : 'scale(1)',
          }}
        />

        {/* Glow Effect */}
        {checked && (
          <div
            style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '6px',
              background: colors.accent,
              opacity: 0.2,
              filter: 'blur(8px)',
              transform: 'scale(1.2)',
              transition: 'all 0.4s ease',
            }}
          />
        )}

        {/* Check Mark */}
        <div
          style={{
            position: 'absolute',
            inset: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="0 0 24 24"
            style={{
              width: '80%',
              height: '80%',
              fill: 'none',
              stroke: colors.accent,
              strokeWidth: 3,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeDasharray: 40,
              strokeDashoffset: checked ? 0 : 40,
              transform: checked ? 'scale(1.1)' : 'scale(1)',
              transformOrigin: 'center',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <path d="M3,12.5l7,7L21,5" />
          </svg>
        </div>

        {/* Animated Borders */}
        {checked && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  width: i % 2 === 0 ? '40px' : '1px',
                  height: i % 2 === 0 ? '1px' : '40px',
                  background: colors.accent,
                  opacity: 1,
                  ...(i === 0 && { top: 0, left: '-100%', animation: 'borderFlow1 2s linear infinite' }),
                  ...(i === 1 && { top: '-100%', right: 0, animation: 'borderFlow2 2s linear infinite' }),
                  ...(i === 2 && { bottom: 0, right: '-100%', animation: 'borderFlow3 2s linear infinite' }),
                  ...(i === 3 && { bottom: '-100%', left: 0, animation: 'borderFlow4 2s linear infinite' }),
                }}
              />
            ))}
          </div>
        )}

        {/* Particles */}
        {checked && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[
              { x: 25, y: -25 },
              { x: -25, y: -25 },
              { x: 25, y: 25 },
              { x: -25, y: 25 },
              { x: 35, y: 0 },
              { x: -35, y: 0 },
              { x: 0, y: 35 },
              { x: 0, y: -35 },
            ].map((pos, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  background: colors.accent,
                  borderRadius: '50%',
                  top: '50%',
                  left: '50%',
                  boxShadow: `0 0 6px ${colors.accent}`,
                  animation: `particleExplosion-${pos.x}-${pos.y} 0.6s ease-out forwards`,
                }}
              />
            ))}
          </div>
        )}

        {/* Rings */}
        {checked && (
          <div style={{ position: 'absolute', inset: '-20px', pointerEvents: 'none' }}>
            {[0, 0.1, 0.2].map((delay, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  border: `1px solid ${colors.accent}`,
                  animation: `ringPulse 0.6s ease-out ${delay}s forwards`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {label && (
        <span style={{ 
          color: checked ? colors.fg + "99" : colors.fg,
          fontSize: '0.875rem', 
          userSelect: 'none',
          flex: 1,
          lineHeight: '1.5',
          paddingTop: '0px',
          wordBreak: 'break-word',
          minHeight: '30px',
          display: 'flex',
          alignItems: 'center',
          textDecoration: checked ? "line-through" : "none",
          transition: "all 0.3s ease",
        }}>
          {label}
        </span>
      )}

      <style>{`
        @keyframes borderFlow1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(200%); }
        }
        @keyframes borderFlow2 {
          0% { transform: translateY(0); }
          100% { transform: translateY(200%); }
        }
        @keyframes borderFlow3 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-200%); }
        }
        @keyframes borderFlow4 {
          0% { transform: translateY(0); }
          100% { transform: translateY(-200%); }
        }
        @keyframes ringPulse {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        ${[
          { x: 25, y: -25 },
          { x: -25, y: -25 },
          { x: 25, y: 25 },
          { x: -25, y: 25 },
          { x: 35, y: 0 },
          { x: -35, y: 0 },
          { x: 0, y: 35 },
          { x: 0, y: -35 },
        ].map(
          (pos) => `
          @keyframes particleExplosion-${pos.x}-${pos.y} {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            20% { opacity: 1; }
            100% { 
              transform: translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(0); 
              opacity: 0; 
            }
          }
        `
        ).join('\n')}
      `}</style>
    </label>
  );
};
