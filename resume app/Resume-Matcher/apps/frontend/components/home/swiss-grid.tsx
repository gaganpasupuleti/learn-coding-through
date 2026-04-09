'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from '@/lib/i18n';

export const SwissGrid = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslations();

  return (
    // 1. Outer Wrapper: viewport-aware spacing with grid background
    <div
      className="min-h-[100dvh] w-full flex justify-center items-start p-2 sm:p-4 md:p-6 bg-[#F0F0E8]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(29, 78, 216, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(29, 78, 216, 0.1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    >
      {/* 2. The Main Container: Sharp black borders, creating the "Canvas" */}
      <div className="w-[min(98vw,120rem)] border border-black bg-[#F0F0E8] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden">
        {/* Header Section - stays above hovered cards */}
        <div className="border-b border-black p-4 md:p-7 shrink-0 bg-[#F0F0E8] relative z-30">
          <h1 className="font-serif text-4xl md:text-6xl text-black tracking-tight leading-[0.95] uppercase">
            {t('nav.dashboard')}
          </h1>
          <p className="mt-3 text-[11px] md:text-sm font-mono text-blue-700 uppercase tracking-wide max-w-md font-bold">
            {'// '}
            {t('dashboard.selectModule')}
          </p>
        </div>

        {/* Content Grid - Scrollable area with NO padding */}
        <div className="overflow-y-auto overflow-x-hidden relative z-10 max-h-[66dvh]">
          <div className="p-[1.5px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 bg-black gap-[1px] border-b border-black">
              {children}
            </div>
          </div>
        </div>

        {/* Footer - stays above hovered cards */}
        <div className="p-3 md:p-4 bg-[#F0F0E8] flex justify-between items-center font-mono text-[11px] md:text-xs text-blue-700 border-t border-black shrink-0 relative z-30">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Resume Matcher"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <span className="uppercase font-bold">Resume Matcher</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="bg-[#F97316] text-black border border-black px-5 py-2 uppercase font-bold tracking-wide shadow-[2px_2px_0px_0px_#000000] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all min-w-[132px] text-center"
            >
              {t('nav.settings')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
