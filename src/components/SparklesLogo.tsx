import React from 'react';
import Image from 'next/image';

interface SparklesLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export default function SparklesLogo({ className = "", size = 80, showText = false }: SparklesLogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/sparklesLogo.png"
        alt="Hyperdome Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
      {showText && (
        <div className="ml-3 flex flex-col">
          <span className="text-xl font-bold text-blue-600 tracking-wider">HYPERDOME</span>
        </div>
      )}
    </div>
  );
}