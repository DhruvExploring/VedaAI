'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BookOpen, Sparkles, Library, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAssessmentStore } from '@/store/assessmentStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { papers } = useAssessmentStore();

  const handleComingSoon = (feature: string) => {
    toast.dismiss();
    toast(`${feature} is coming soon in the next version!`, {
      style: {
        background: '#1a1713',
        color: '#faf8f4',
        border: '1px solid #e8e4dc',
        fontSize: '13px',
      },
    });
  };

  const menuItems = [
    {
      label: 'Home',
      icon: Home,
      href: '/assignments',
      onClick: () => { },
    },
    {
      label: 'My Groups',
      icon: Users,
      href: '#',
      onClick: () => handleComingSoon('Groups'),
    },
    {
      label: 'Assignments',
      icon: BookOpen,
      href: '/assignments',
      active: pathname.startsWith('/assignments') || pathname.startsWith('/output'),
    },
    {
      label: "AI Teacher's Toolkit",
      icon: Sparkles,
      href: '#',
      onClick: () => handleComingSoon("AI Teacher's Toolkit"),
    },
    {
      label: 'My Library',
      icon: Library,
      href: '#',
      onClick: () => handleComingSoon('Library'),
    },
  ];

  return (
    <aside
      className="flex flex-col font-sans"
      style={{
        width: '304px',
        height: 'calc(100vh - 24px)',
        borderRadius: '16px',
        padding: '24px',
        background: '#FFFFFF',
        boxShadow: '0px 32px 48px 0px rgba(0,0,0,0.20)',
        justifyContent: 'space-between',
        display: 'flex',
        overflowY: 'auto',
      }}
    >
      {/* Top section */}
      <div className="flex flex-col gap-0">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 mb-6">
          {/* Brand logo container */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src="/logo.png"
              alt="VedaAI logo"
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'contain',
                transform: 'scale(1.32) translate(2.5px, 2.5px)', // scale up and nudge to center within the clipped container
                display: 'block',
              }}
            />
          </div>

          {/* Brand name typography styling */}
          <span
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: '28px',
              lineHeight: '1', // keep line-height in check so the flex row doesn't stretch
              letterSpacing: '-0.06em',
              color: '#303030',
              display: 'inline-flex',
              alignItems: 'center',
              transform: 'translateY(-2.5px)', // nudge Bricolage font up to sit level with the logo
            }}
          >
            VedaAI
          </span>
        </div>

        <div
          className="mb-6"
          style={{
            /* gradient wrapper to simulate a custom border around the button */
            background: 'linear-gradient(135deg, #FF7950 0%, #C0350A 100%)',
            borderRadius: '100px',
            padding: '4px',
          }}
        >
          <Link
            href="/assignments/create"
            className="flex items-center justify-center transition-all hover:opacity-90 active:scale-[0.98] w-full"
            style={{
              background: '#272727',
              borderRadius: '100px',
              paddingTop: '8px',
              paddingBottom: '8px',
              paddingLeft: '43px',
              paddingRight: '43px',
              gap: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Plus icon asset */}
            <svg
              width="18.32"
              height="17.32"
              viewBox="0 0 18 18"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M9 2.5V15.5M2.5 9H15.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontWeight: 500,
                fontSize: '16px',
                lineHeight: '28px',
                letterSpacing: '-0.04em',
                color: '#ffffffff',
                whiteSpace: 'nowrap',
              }}
            >
              Create Assignment
            </span>
          </Link>
        </div>

        {/* Main Navigation Menu */}
        <nav className="flex flex-col" style={{ gap: '8px', width: '100%' }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.active !== undefined ? item.active : pathname === item.href;

            return (
              <Link
                key={index}
                href={item.href}
                onClick={item.onClick}
                className={`flex items-center gap-3 transition-all group ${isActive
                  ? 'text-[#1a1713] font-semibold'
                  : 'text-[#6b6b6b] hover:text-[#1a1713]'
                  }`}
                style={{
                  padding: '9px 12px',
                  borderRadius: '10px',
                  fontSize: '13.5px',
                  background: isActive ? '#F4F4F4' : 'transparent',
                }}
              >
                <Icon
                  className="shrink-0 transition-colors"
                  style={{
                    width: '16px',
                    height: '16px',
                    color: isActive ? '#1a1713' : '#9B9B9B',
                  }}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom section */}
      <div className="flex flex-col gap-3">
        {/* Settings */}
        <Link
          href="#"
          onClick={() => handleComingSoon('Settings')}
          className="flex items-center gap-3 text-[#6b6b6b] hover:text-[#1a1713] transition-all"
          style={{
            padding: '9px 12px',
            borderRadius: '10px',
            fontSize: '13.5px',
          }}
        >
          <Settings style={{ width: '16px', height: '16px', color: '#9B9B9B' }} />
          <span>Settings</span>
        </Link>

        {/* Institution Information Panel */}
        <div
          className="flex items-center gap-3"
          style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            padding: '10px 12px',
            border: '1.5px solid #F0F0F0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {/* Avatar representation with visual gradient background */}
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: 'linear-gradient(145deg, #FDDCB5 0%, #F4A261 100%)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.9)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Illustrated avatar graphic components */}
            <svg viewBox="0 0 38 38" width="38" height="38" fill="none">
              <rect x="0" y="0" width="38" height="38" fill="#FDDCB5" />
              <path d="M7 38 Q7 26 19 26 Q31 26 31 38Z" fill="#5B8DEF" />
              <circle cx="19" cy="16" r="8" fill="#F4C899" />
              <path d="M11 14 Q11 6 19 6 Q27 6 27 14 Q27 9 19 9 Q11 9 11 14Z" fill="#4A3728" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="truncate"
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: '#1a1713',
                lineHeight: 1.3,
              }}
            >
              Delhi Public School
            </p>
            <p
              className="truncate"
              style={{
                fontSize: '11px',
                color: '#9B9B9B',
                lineHeight: 1.3,
              }}
            >
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
