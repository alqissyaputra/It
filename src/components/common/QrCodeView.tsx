import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QrCodeViewProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export function QrCodeView({
  value,
  size = 180,
  className = '',
  darkColor = '#064e3b',
  lightColor = '#ffffff',
}: QrCodeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      QRCode.toCanvas(
        canvasRef.current,
        value,
        {
          width: size,
          margin: 1.5,
          color: {
            dark: darkColor,
            light: lightColor,
          },
          errorCorrectionLevel: 'H',
        },
        (error) => {
          if (error) console.error('Error generating QR:', error);
        }
      );
    }
  }, [value, size, darkColor, lightColor]);

  return (
    <div className={`inline-flex items-center justify-center p-2 rounded-xl bg-white shadow-sm border border-emerald-100 ${className}`}>
      <canvas ref={canvasRef} className="rounded-lg" />
    </div>
  );
}
