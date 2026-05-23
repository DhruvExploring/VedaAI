"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  BookOpen,
  PieChart,
  Settings,
  Sparkles,
} from "lucide-react";
import { getAssignments } from "@/lib/api";

const VedaLogo: React.FC<{ isOutputPage?: boolean }> = ({ isOutputPage }) => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flex: "none",
        order: 0,
        flexGrow: 0,
      }}
    >
      <rect width="40" height="40" rx="10" fill={isOutputPage ? "#303030" : "url(#logo-gradient)"} />
      
      <g filter="url(#group-drop-shadow)">
        <path
          d="M6 11H15.5L24.12 30.42H14.62L6 11Z"
          fill="#FFFFFF"
        />
        <path
          d="M6 11H15.5L24.12 30.42H14.62L6 11Z"
          fill="url(#left-stroke-shadow)"
        />
        <path
          d="M24.5 11H34L25 30.42H15.5L24.5 11Z"
          fill="#FFFFFF"
        />
      </g>

      <defs>
        <linearGradient
          id="logo-gradient"
          x1="20"
          y1="0"
          x2="20"
          y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#E56820" />
          <stop offset="1" stopColor="#D45E3E" />
        </linearGradient>

        <linearGradient
          id="left-stroke-shadow"
          x1="15.06"
          y1="9.35"
          x2="15.06"
          y2="32.11"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.3021" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="0.8066" stopColor="#0E1513" stopOpacity="0.2" />
          <stop offset="1" stopColor="#0E1513" stopOpacity="0.2" />
        </linearGradient>

        <filter
          id="group-drop-shadow"
          x="-10"
          y="-10"
          width="60"
          height="60"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="4.28571" stdDeviation="4.28571" floodColor="#000000" floodOpacity="0.2" />
          <feDropShadow dx="0" dy="8.57143" stdDeviation="8.57143" floodColor="#000000" floodOpacity="0.15" />
          <feDropShadow dx="0" dy="12.8571" stdDeviation="12.8571" floodColor="#000000" floodOpacity="0.1" />
        </filter>
      </defs>
    </svg>
  );
};

const SchoolAvatar: React.FC = () => {
  return (
    <svg
      width="59"
      height="56"
      viewBox="0 0 59 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        flex: "none",
        order: 0,
        flexGrow: 0,
        borderRadius: "12px",
      }}
    >
      <rect width="59" height="56" rx="16" fill="#FCE7F3" />
      
      <path
        d="M29.5 43C37.5 43 44 36.5 44 28.5C44 20.5 37.5 14 29.5 14C21.5 14 15 20.5 15 28.5C15 36.5 21.5 43 29.5 43Z"
        fill="#A78BFA"
      />
      <circle cx="14" cy="28.5" r="5.5" fill="#A78BFA" />
      <circle cx="14" cy="28.5" r="3" fill="#F87171" />
      <circle cx="45" cy="28.5" r="5.5" fill="#A78BFA" />
      <circle cx="45" cy="28.5" r="3" fill="#F87171" />
      
      <path
        d="M29.5 39.5C34.5 39.5 37 35.5 37 32C37 28.5 34.5 28 29.5 28C24.5 28 22 28.5 22 32C22 35.5 24.5 39.5 29.5 39.5Z"
        fill="#FBCFE8"
      />
      <circle cx="27" cy="31.5" r="1.2" fill="#A78BFA" />
      <circle cx="32" cy="31.5" r="1.2" fill="#A78BFA" />
      <path
        d="M26.5 35C28 36.5 31 36.5 32.5 35"
        stroke="#F472B6"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      
      <rect x="19" y="21.5" width="9.5" height="7" rx="2.2" fill="#1F2937" />
      <rect x="30.5" y="21.5" width="9.5" height="7" rx="2.2" fill="#1F2937" />
      <path d="M28.5 25H30.5" stroke="#1F2937" strokeWidth="1.8" />
      
      <path d="M19 18.5C21 14 38 14 40 18.5H19Z" fill="#FBBF24" />
      <path
        d="M37 17L44 18.5"
        stroke="#FBBF24"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      
      <path
        d="M24.5 42C26.5 45.5 32.5 45.5 34.5 42"
        stroke="#FBBF24"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <rect x="28.5" y="44" width="2" height="3" fill="#FBBF24" />
    </svg>
  );
};

export default function Sidebar() {
  const pathname = usePathname();
  const isOutputPage = pathname.startsWith("/output");
  const [assignmentsCount, setAssignmentsCount] = useState<number>(32);

  useEffect(() => {
    getAssignments()
      .then((res) => {
        if (res.success && res.assignments) {
          setAssignmentsCount(res.assignments.length);
        }
      })
      .catch(() => {});
  }, []);

  const menuItems = [
    {
      label: "Home",
      icon: LayoutDashboard,
      href: "/assignments",
      active: pathname === "/",
    },
    {
      label: "My Groups",
      icon: Users,
      href: "#",
      active: false,
    },
    {
      label: "Assignments",
      icon: FileText,
      href: "/assignments",
      active: pathname.startsWith("/assignments") || pathname.startsWith("/output"),
    },
    {
      label: "AI Teacher’s Toolkit",
      icon: BookOpen,
      href: "#",
      active: false,
    },
    {
      label: "My Library",
      icon: PieChart,
      href: "#",
      active: false,
    },
  ];

  return (
    <aside
      className="flex flex-col justify-between items-center bg-white"
      style={{
        boxSizing: "border-box",
        padding: "24px",
        gap: "32px",
        width: "304px",
        height: "100%",
        boxShadow: "0px 16px 48px rgba(0, 0, 0, 0.12), 0px 32px 48px rgba(0, 0, 0, 0.2)",
        borderRadius: "16px",
      }}
    >
      <div
        className="flex flex-col items-start"
        style={{
          width: "256px",
          gap: "32px",
          flex: "none",
          order: 0,
          alignSelf: "stretch",
          flexGrow: 0,
        }}
      >
        <div
          className="flex flex-row items-center"
          style={{
            padding: "0px",
            gap: "8px",
            width: "251px",
            height: "40px",
            flex: "none",
            order: 0,
            alignSelf: "stretch",
            flexGrow: 0,
          }}
        >
          <div
            className="flex flex-row items-center"
            style={{
              padding: "0px",
              gap: "8px",
              width: "136px",
              height: "40px",
              flex: "none",
              order: 0,
              flexGrow: 0,
            }}
          >
            <VedaLogo isOutputPage={isOutputPage} />

            <span
              style={{
                width: "88px",
                height: "20px",
                fontFamily: "Bricolage Grotesque",
                fontStyle: "normal",
                fontWeight: 700,
                fontSize: "28px",
                lineHeight: "20px",
                display: "flex",
                alignItems: "center",
                letterSpacing: "-0.06em",
                color: "#303030",
                flex: "none",
                order: 1,
                flexGrow: 0,
              }}
            >
              VedaAI
            </span>
          </div>
        </div>

        <div
          className="flex flex-row items-center"
          style={{
            padding: "0px",
            gap: "10px",
            width: "251px",
            height: "42px",
            flex: "none",
            order: 1,
            alignSelf: "stretch",
            flexGrow: 0,
          }}
        >
          <Link
            href={isOutputPage ? "#" : "/assignments/create"}
            passHref
            style={{ textDecoration: "none", width: "100%" }}
            onClick={(e) => {
              if (isOutputPage) {
                e.preventDefault();
                import("react-hot-toast").then(({ toast }) => {
                  toast("AI Teacher's Toolkit is coming soon!", {
                    style: {
                      background: "#1a1713",
                      color: "#faf8f4",
                      border: "1px solid #e8e4dc",
                      fontSize: "13px",
                    },
                  });
                });
              }
            }}
          >
            <button
              className="flex flex-row justify-center items-center hover:opacity-90 active:scale-[0.98] transition-all"
              style={{
                boxSizing: "border-box",
                padding: isOutputPage ? "8px 20px" : "8px 43px",
                gap: "10px",
                margin: "0 auto",
                width: "251px",
                height: "42px",
                background: "#272727",
                border: "none",
                cursor: "pointer",
                boxShadow:
                  "0px 16px 48px rgba(255, 255, 255, 0.12), 0px 32px 48px rgba(255, 255, 255, 0.2), inset 0px -1px 3.5px rgba(177, 177, 177, 0.6), inset 0px 0px 34.5px rgba(255, 255, 255, 0.25)",
                borderRadius: "100px",
                flex: "none",
                order: 0,
                flexGrow: 1,
              }}
            >
              <div
                className="flex items-center justify-center"
                style={{
                  width: "18.32px",
                  height: "17.32px",
                  flex: "none",
                  order: 0,
                  flexGrow: 0,
                }}
              >
                <Sparkles size={16} color="#FFFFFF" />
              </div>

              <span
                style={{
                  width: isOutputPage ? "auto" : "137px",
                  height: "28px",
                  fontFamily: "Inter",
                  fontStyle: "normal",
                  fontWeight: 500,
                  fontSize: isOutputPage ? "14.5px" : "16px",
                  lineHeight: "28px",
                  display: "flex",
                  alignItems: "center",
                  letterSpacing: "-0.04em",
                  color: "#FFFFFF",
                  flex: "none",
                  order: 1,
                  flexGrow: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {isOutputPage ? "AI Teacher’s Toolkit" : "Create Assignment"}
              </span>
            </button>
          </Link>
        </div>

        <div
          className="flex flex-col items-start"
          style={{
            padding: "0px",
            gap: "8px",
            width: "251px",
            height: "224px",
            flex: "none",
            order: 2,
            flexGrow: 0,
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                href={item.href}
                className="transition-all active:scale-[0.98]"
                style={{
                  textDecoration: "none",
                  display: "block",
                  width: "100%",
                }}
              >
                <div
                  className="flex flex-row items-center hover:bg-[#F5F5F5] transition-all"
                  style={{
                    boxSizing: "border-box",
                    padding: item.label === "Home" ? "9px 12px" : "8px 12px",
                    gap: "8px",
                    width: item.label === "Home" ? "254px" : "251px",
                    height: item.label === "Home" ? "40px" : "38px",
                    background: item.active ? "#F0F0F0" : "transparent",
                    borderRadius: "8px",
                    flex: "none",
                    order: 0,
                    flexGrow: 0,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flex: "none",
                      order: 0,
                      flexGrow: 0,
                    }}
                  >
                    <Icon
                      size={20}
                      color={item.active ? "#303030" : "rgba(94, 94, 94, 0.8)"}
                    />
                  </div>

                  <span
                    style={{
                      width: item.label === "Assignments" ? "157px" : (item.label === "My Groups" ? "199px" : "202px"),
                      height: "22px",
                      fontFamily: "Bricolage Grotesque",
                      fontStyle: "normal",
                      fontWeight: item.active ? 500 : 400,
                      fontSize: "16px",
                      lineHeight: "140%",
                      display: "flex",
                      alignItems: "center",
                      letterSpacing: "-0.04em",
                      color: item.active ? "#303030" : "rgba(94, 94, 94, 0.8)",
                      flex: "none",
                      order: 1,
                      flexGrow: 1,
                    }}
                  >
                    {item.label}
                  </span>

                  {item.label === "Assignments" && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                        padding: "0px 10px",
                        gap: "8px",
                        width: "auto",
                        minWidth: "37px",
                        height: "20px",
                        background: "#FF5623",
                        borderRadius: "48px",
                        flex: "none",
                        order: 2,
                        flexGrow: 0,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "Bricolage Grotesque",
                          fontStyle: "normal",
                          fontWeight: 600,
                          fontSize: "14px",
                          lineHeight: "20px",
                          letterSpacing: "-0.04em",
                          color: "#FFFFFF",
                          textAlign: "center",
                          width: "100%",
                        }}
                      >
                        {assignmentsCount}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div
        className="flex flex-col items-start"
        style={{
          padding: "0px",
          gap: "8px",
          margin: "0 auto",
          width: "256px",
          height: "126px",
          flex: "none",
          order: 1,
          alignSelf: "stretch",
          flexGrow: 0,
        }}
      >
        <button
          className="flex flex-row items-center hover:bg-[#F5F5F5] active:scale-[0.98] transition-all"
          style={{
            boxSizing: "border-box",
            padding: "8px 12px",
            gap: "8px",
            width: "256px",
            height: "38px",
            background: "transparent",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            flex: "none",
            order: 0,
            alignSelf: "stretch",
            flexGrow: 0,
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
              order: 0,
              flexGrow: 0,
            }}
          >
            <Settings size={20} color="rgba(94, 94, 94, 0.8)" />
          </div>

          <span
            style={{
              width: "204px",
              height: "22px",
              fontFamily: "Bricolage Grotesque",
              fontStyle: "normal",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "140%",
              display: "flex",
              alignItems: "center",
              letterSpacing: "-0.04em",
              color: "rgba(94, 94, 94, 0.8)",
              flex: "none",
              order: 1,
              flexGrow: 1,
            }}
          >
            Settings
          </span>
        </button>

        <div
          className="flex flex-col items-start"
          style={{
            boxSizing: "border-box",
            padding: "12px",
            gap: "16px",
            width: "256px",
            height: "80px",
            background: "#F0F0F0",
            borderRadius: "16px",
            flex: "none",
            order: 1,
            alignSelf: "stretch",
            flexGrow: 0,
          }}
        >
          <div
            className="flex flex-row items-center"
            style={{
              padding: "0px",
              gap: "8px",
              width: "232px",
              height: "56px",
              flex: "none",
              order: 0,
              alignSelf: "stretch",
              flexGrow: 0,
            }}
          >
            <SchoolAvatar />

            <div
              className="flex flex-col items-start"
              style={{
                padding: "0px",
                width: "165px",
                height: "44px",
                flex: "none",
                order: 1,
                flexGrow: 1,
              }}
            >
              <span
                style={{
                  width: "165px",
                  height: "22px",
                  fontFamily: "Bricolage Grotesque",
                  fontStyle: "normal",
                  fontWeight: 700,
                  fontSize: "16px",
                  lineHeight: "140%",
                  display: "flex",
                  alignItems: "center",
                  letterSpacing: "-0.06em",
                  color: "#303030",
                  flex: "none",
                  order: 0,
                  alignSelf: "stretch",
                  flexGrow: 0,
                }}
              >
                Delhi Public School
              </span>

              <span
                style={{
                  width: "165px",
                  height: "22px",
                  fontFamily: "Bricolage Grotesque",
                  fontStyle: "normal",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "140%",
                  display: "flex",
                  alignItems: "center",
                  letterSpacing: "-0.04em",
                  color: "#5E5E5E",
                  flex: "none",
                  order: 1,
                  alignSelf: "stretch",
                  flexGrow: 0,
                }}
              >
                Bokaro Steel City
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}