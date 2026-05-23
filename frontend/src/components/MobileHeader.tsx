'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export const VedaLogoMobile: React.FC = () => {
  return (
    <div
      style={{
        position: 'relative',
        width: '28px',
        height: '28px',
        borderRadius: '8.4px',
        flex: 'none',
        order: 0,
        flexGrow: 0,
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '0%',
          right: '0%',
          top: '0%',
          bottom: '0%',
          background: '#303030',
          borderRadius: '7px',
        }}
      />

      <svg
        style={{
          position: 'absolute',
          left: '15%',
          right: '39.7%',
          top: '27.5%',
          bottom: '23.95%',
          width: '45.3%',
          height: '48.55%',
        }}
        viewBox="0 0 18.12 19.42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0H9.5L18.12 19.42H8.62L0 0Z"
          fill="#FFFFFF"
        />
      </svg>

      <svg
        style={{
          position: 'absolute',
          left: '15%',
          right: '39.7%',
          top: '27.5%',
          bottom: '23.95%',
          width: '45.3%',
          height: '48.55%',
          opacity: 0.2,
        }}
        viewBox="0 0 18.12 19.42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 0H9.5L18.12 19.42H8.62L0 0Z"
          fill="url(#mobile-left-stroke-shadow)"
        />
        <defs>
          <linearGradient
            id="mobile-left-stroke-shadow"
            x1="9.06"
            y1="-1.65"
            x2="9.06"
            y2="21.11"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.3021" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.8066" stopColor="#0E1513" />
            <stop offset="1" stopColor="#0E1513" />
          </linearGradient>
        </defs>
      </svg>

      <svg
        style={{
          position: 'absolute',
          left: '39.85%',
          right: '15%',
          top: '27.5%',
          bottom: '23.95%',
          width: '45.15%',
          height: '48.55%',
        }}
        viewBox="0 0 18.5 19.42"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8.56 0H18.06L9.06 19.42H0.56L8.56 0Z"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
};

export default function MobileHeader() {
  return (
    <div className="w-full px-4 pt-4 pb-2 z-30 sticky top-0 no-print flex justify-center">
      <div 
        className="flex flex-row justify-between items-center bg-white shadow-[0px_8px_32px_rgba(0,0,0,0.06)]"
        style={{
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0px 16px 0px 12px',
          width: '373px',
          maxWidth: 'calc(100vw - 32px)',
          height: '56px',
          background: '#FFFFFF',
          borderRadius: '16px',
        }}
      >
        <Link 
          href="/assignments" 
          className="flex flex-row items-center cursor-pointer select-none"
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '0px',
            gap: '8px',
            width: '99px',
            height: '28px',
          }}
        >
          <VedaLogoMobile />

          <span
            style={{
              width: '63px',
              height: '28px',
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              fontStyle: 'normal',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: '140%',
              display: 'flex',
              alignItems: 'center',
              letterSpacing: '-0.06em',
              color: '#303030',
            }}
          >
            VedaAI
          </span>
        </Link>

        <div 
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '0px',
            gap: '12px',
            width: '116px',
            height: '36px',
          }}
        >
          <div 
            className="relative flex flex-row justify-center items-center cursor-pointer hover:bg-[#EAEAEA] transition-colors"
            style={{
              width: '36px',
              height: '36px',
              background: '#F6F6F6',
              borderRadius: '100px',
            }}
          >
            <Bell size={18} className="text-[#303030] stroke-[2.2]" />
            <span 
              className="absolute"
              style={{
                width: '8px',
                height: '8px',
                left: '27px',
                top: '1px',
                background: '#FF5623',
                borderRadius: '50%',
              }}
            />
          </div>

          <div 
            className="flex flex-row justify-center items-center overflow-hidden border border-[#EAEAEA]"
            style={{
              width: '32px',
              height: '32px',
              background: '#F6F6F6',
              borderRadius: '100px',
            }}
          >
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256&h=256" 
              alt="Avatar Profile" 
              className="w-full h-full object-cover"
            />
          </div>

          <div 
            className="flex flex-col items-center justify-center gap-1 cursor-pointer select-none"
            style={{
              width: '24px',
              height: '24px',
            }}
          >
            <span className="block w-[18px] h-[2px] bg-[#1D1B20] rounded-full" />
            <span className="block w-[18px] h-[2px] bg-[#1D1B20] rounded-full" />
            <span className="block w-[18px] h-[2px] bg-[#1D1B20] rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
