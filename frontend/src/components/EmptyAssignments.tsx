"use client";

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

const LoopSquiggle: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "82px",
        height: "73.67px",
        left: "calc(50% - 82px/2 - 102px)",
        top: "calc(50% - 73.67px/2 - 52.59px)",
        zIndex: 6,
      }}
    >
      <svg width="82" height="74" viewBox="0 0 82 74" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M75 5C65 15 50 25 35 32C25 36 16 36 15 30C13 22 25 18 30 26C35 35 25 45 5 52"
          stroke="#011625"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
};

const BackgroundCircle: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "240px",
        height: "240px",
        left: "calc(50% - 240px/2)",
        top: "calc(50% - 240px/2 - 1px)",
        background: "linear-gradient(179.67deg, #F2F2F2 -15.9%, #EFEFEF 158.68%)",
        borderRadius: "50%",
        zIndex: 1,
      }}
    />
  );
};

const CloudBadge: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "70.22px",
        height: "40.39px",
        left: "calc(50% - 70.22px/2 + 108.11px)",
        top: "calc(50% - 40.39px/2 - 83.38px)",
        background: "#FFFFFF",
        boxShadow: "6px 4px 13px rgba(27, 119, 139, 0.09)",
        borderRadius: "10px",
        zIndex: 4,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: "52px",
          height: "12px",
          left: "9px",
          top: "14.58px",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "12px",
            height: "12px",
            left: "0px",
            top: "0px",
            background: "#CCC6D9",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "32px",
            height: "12px",
            left: "20px",
            top: "0px",
            background: "#D5D5D5",
            borderRadius: "100px",
          }}
        />
      </div>
    </div>
  );
};

const PageCard: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "124.54px",
        height: "155.03px",
        left: "calc(50% - 124.54px/2 + 1.27px)",
        top: "calc(50% - 155.03px/2 - 8.93px)",
        background: "#FFFFFF",
        boxShadow: "0px 20px 30px rgba(146, 146, 146, 0.19)",
        borderRadius: "16px",
        zIndex: 2,
      }}
    />
  );
};

const InfoOverlay: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "0px",
        gap: "18px",
        position: "absolute",
        width: "100px",
        height: "121px",
        left: "calc(50% - 100px/2 + 0px)",
        top: "calc(50% - 121px/2 - 5.94px)",
        borderRadius: "16px",
        zIndex: 3,
      }}
    >
      <div
        style={{
          width: "50px",
          height: "9.8px",
          background: "#011625",
          borderRadius: "100px",
          flex: "none",
          order: 0,
          flexGrow: 1,
        }}
      />
      <div
        style={{
          width: "100px",
          height: "9.8px",
          background: "#D5D5D5",
          borderRadius: "100px",
          flex: "none",
          order: 1,
          alignSelf: "stretch",
          flexGrow: 1,
        }}
      />
      <div
        style={{
          width: "100px",
          height: "9.8px",
          background: "#D5D5D5",
          borderRadius: "100px",
          flex: "none",
          order: 2,
          alignSelf: "stretch",
          flexGrow: 1,
        }}
      />
      <div
        style={{
          width: "100px",
          height: "9.8px",
          background: "#D5D5D5",
          borderRadius: "100px",
          flex: "none",
          order: 3,
          alignSelf: "stretch",
          flexGrow: 1,
        }}
      />
      <div
        style={{
          width: "100px",
          height: "9.8px",
          background: "#D5D5D5",
          borderRadius: "100px",
          flex: "none",
          order: 4,
          alignSelf: "stretch",
          flexGrow: 1,
        }}
      />
    </div>
  );
};

const SparkleStar: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "22.89px",
        height: "25px",
        left: "calc(50% - 22.89px/2 - 82.95px)",
        top: "calc(50% - 25px/2 + 76.72px)",
        zIndex: 6,
      }}
    >
      <svg width="23" height="25" viewBox="0 0 23 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M11.5 1.5C12.5 8.5 16 11 21.5 12.5C16 14 12.5 16.5 11.5 23.5C10.5 16.5 7 14 1.5 12.5C7 11 10.5 8.5 11.5 1.5Z"
          fill="#417BA4"
        />
      </svg>
    </div>
  );
};

const CircleDot: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        width: "12px",
        height: "12px",
        left: "calc(50% - 12px/2 + 135px)",
        top: "calc(50% - 12px/2 + 34px)",
        backgroundColor: "#417BA4",
        borderRadius: "50%",
        zIndex: 6,
      }}
    />
  );
};

interface MagnifyingGlassProps {
  isHovered: boolean;
}

const MagnifyingGlass: React.FC<MagnifyingGlassProps> = ({ isHovered }) => {
  return (
    <>
      <div
        style={{
          transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.4s ease",
          transform: isHovered ? "scale(0.96) translate(2px, 2px)" : "scale(1) translate(0, 0)",
          opacity: isHovered ? 0.75 : 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "152.75px",
            height: "153.28px",
            left: "122.61px",
            top: "100.56px",
            backgroundColor: "#17CB9E",
            borderRadius: "50%",
            opacity: 0.12,
            zIndex: 9,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "152.75px",
            height: "153.28px",
            left: "122.61px",
            top: "100.56px",
            border: "6px solid #CCC6D9",
            borderRadius: "50%",
            opacity: 0.6,
            zIndex: 10,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 11,
          transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
          transform: isHovered ? "translateY(-7px) translateX(-2px)" : "translateY(0) translateX(0)",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "22.61px",
            height: "57.52px",
            left: "calc(50% - 22.61px/2 + 80.3px)",
            top: "calc(50% - 57.52px/2 + 75.76px)",
            background: "#E1DCEB",
            borderRadius: "6px",
            transform: "matrix(0.65, -0.76, 0.72, 0.69, 0, 0)",
            zIndex: 11,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "22.61px",
            height: "14.32px",
            left: "calc(50% - 22.61px/2 + 121.91px)",
            top: "calc(50% - 14.32px/2 + 93.88px)",
            background: "#E1DCEB",
            borderRadius: "4px",
            transform: "matrix(0.65, -0.76, 0.72, 0.69, 0, 0)",
            zIndex: 12,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "125px",
            height: "125px",
            left: "calc(50% - 125px/2 + 35.11px)",
            top: "calc(50% - 125px/2 + 13.06px)",
            background: "#E1DCEB",
            borderRadius: "50%",
            zIndex: 13,
            boxShadow: isHovered
              ? "0px 20px 30px rgba(0, 0, 0, 0.12)"
              : "0px 10px 20px rgba(0, 0, 0, 0.04)",
            transition: "box-shadow 0.4s ease",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "105.83px",
            height: "105.83px",
            left: "calc(50% - 105.83px/2 + 35.51px)",
            top: "calc(50% - 105.83px/2 + 13.06px)",
            background: "linear-gradient(158.92deg, #FFFFFF 13.91%, #FFADAD 122.3%)",
            borderRadius: "50%",
            zIndex: 14,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "109px",
            height: "108px",
            left: "calc(50% - 109px/2 + 35.5px)",
            top: "calc(50% - 108px/2 + 13px)",
            background: "rgba(255, 255, 255, 0.3)",
            backdropFilter: "blur(4px)",
            borderRadius: "50%",
            zIndex: 15,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "50px",
            height: "50px",
            left: "calc(50% - 50px/2 + 35px)",
            top: "calc(50% - 50px/2 + 13px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 16,
            transform: isHovered ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
          }}
        >
          <svg
            width="50"
            height="50"
            viewBox="0 0 50 50"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13 13L37 37M37 13L13 37"
              stroke="#FF4040"
              strokeWidth="7.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </>
  );
};

export default function EmptyAssignments() {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      className="w-full max-w-[343px] lg:max-w-[486px] flex flex-col justify-center items-center gap-6 lg:gap-8 mx-auto"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "0px",
      }}
    >
      <div
        className="w-full flex flex-col items-center gap-3 lg:gap-[12px]"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0px",
        }}
      >
        <div
          className="scale-[0.85] lg:scale-100 origin-center transition-transform duration-300"
          style={{
            width: "300px",
            height: "300px",
            position: "relative",
            flex: "none",
            order: 0,
            flexGrow: 0,
          }}
        >
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              position: "absolute",
              width: "300px",
              height: "300px",
              left: "0px",
              top: "0px",
              cursor: "pointer",
            }}
          >
            <BackgroundCircle />

            <PageCard />

            <InfoOverlay />

            <CloudBadge />

            <LoopSquiggle />

            <SparkleStar />

            <CircleDot />

            <MagnifyingGlass isHovered={isHovered} />
          </div>
        </div>

        <div
          className="w-full flex flex-col items-center gap-2"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <h2
            className="text-[20px] font-bold tracking-[-0.04em] text-[#303030] text-center"
            style={{
              fontFamily: "Bricolage Grotesque",
              margin: 0,
            }}
          >
            No assignments yet
          </h2>

          <p
            className="w-full max-w-[317px] lg:max-w-[486px] text-center text-[14px] lg:text-[16px] font-normal leading-[140%] tracking-[-0.04em] text-[#5E5E5E]"
            style={{
              fontFamily: "Bricolage Grotesque",
              margin: 0,
            }}
          >
            Create your first assignment to start collecting and grading student submissions.
            You can set up rubrics, define marking criteria, and let AI assist with grading.
          </p>
        </div>
      </div>

      <Link href="/assignments/create" passHref style={{ textDecoration: "none" }}>
        <button
          className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 24px",
            gap: "4px",
            width: "277px",
            height: "46px",
            background: "#181818",
            borderRadius: "48px",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div style={{ width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", order: 0, flexGrow: 0 }}>
            <Plus size={20} color="#FFFFFF" />
          </div>

          <span
            className="flex items-center justify-center tracking-[-0.04em] text-white"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              fontStyle: "normal",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "140%",
            }}
          >
            Create Your First Assignment
          </span>
        </button>
      </Link>
    </div>
  );
}