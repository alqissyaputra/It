interface SchoolLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function SchoolLogo({ className = '', size = 'md' }: SchoolLogoProps) {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 shadow-md shadow-emerald-900/20 text-white font-bold p-1.5 ${sizeMap[size]} ${className}`}>
      {/* Decorative Gold Border */}
      <div className="absolute inset-0 rounded-xl border border-amber-400/40 pointer-events-none"></div>
      
      {/* Emblem SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full fill-current text-amber-300 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Eight-Point Islamic Star (Rub el Hizb) */}
        <path
          d="M50 5 L62 20 L80 15 L82 35 L98 45 L89 60 L98 75 L82 85 L80 105 L62 100 L50 115 L38 100 L20 105 L18 85 L2 75 L11 60 L2 45 L18 35 L20 15 L38 20 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          transform="scale(0.8) translate(12, 5)"
        />
        {/* Open Book (Qur'an / Science) */}
        <path
          d="M28 65 C38 60 48 62 50 72 C52 62 62 60 72 65 L72 40 C62 35 52 38 50 48 C48 38 38 35 28 40 Z"
          fill="#ffffff"
          stroke="#047857"
          strokeWidth="2"
        />
        {/* Pen / Torch of Knowledge */}
        <path
          d="M48 24 L52 24 L53 38 L47 38 Z"
          fill="#f59e0b"
        />
        <path
          d="M50 16 L53 22 L47 22 Z"
          fill="#ef4444"
        />
      </svg>
    </div>
  );
}
