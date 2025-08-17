import { Box } from '@radix-ui/themes';

export function LoadingSpinner({ size = 32 }: { size?: number }) {
  return (
    <Box
      asChild
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `${size / 8}px solid #e0e0e0`,
        borderTop: `${size / 8}px solid #6366f1`,
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    >
      <span aria-label="Loading" />
    </Box>
  );
}

// Add global keyframes for spin animation if not already present
if (typeof document !== 'undefined' && !document.getElementById('global-spin-keyframes')) {
  const style = document.createElement('style');
  style.id = 'global-spin-keyframes';
  style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

export default LoadingSpinner;