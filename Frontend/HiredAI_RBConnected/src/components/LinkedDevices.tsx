import React from "react";
import svgPaths from "../imports/svg-gaxl2ue4x7";

function BackArrow() {
  return (
    <div className="relative size-[38px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g>
          <path d={svgPaths.p3038400} stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
}

function MobileIcon() {
  return (
    <div className="size-[36px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 51 51">
        <g>
          <path d={svgPaths.p15a77e00} fill="black" />
        </g>
      </svg>
    </div>
  );
}

function WindowsIcon() {
  return (
    <div className="size-[34px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36 43.4952">
        <g>
          <g />
          <path clipRule="evenodd" d={svgPaths.pdfd44d0} fill="black" fillRule="evenodd" />
        </g>
      </svg>
    </div>
  );
}

interface DeviceItemProps {
  icon: "mobile" | "windows";
  name: string;
  lastActive: string;
  onLogout: () => void;
}

function DeviceItem({ icon, name, lastActive, onLogout }: DeviceItemProps) {
  return (
    <button
      onClick={onLogout}
      className="flex items-center gap-3 md:gap-4 w-full hover:opacity-70 transition-opacity"
    >
      <div className="flex-shrink-0">
        {icon === "mobile" ? <MobileIcon /> : <WindowsIcon />}
      </div>
      <div className="flex flex-col items-start">
        <p className="font-['Poppins',sans-serif] font-bold text-[16px] text-black">
          {name}
        </p>
        <p className="font-['Poppins',sans-serif] font-medium text-[14px] text-[#464646]">
          {lastActive}
        </p>
      </div>
    </button>
  );
}

interface LinkedDevicesProps {
  onBackClick: () => void;
}

export default function LinkedDevices({ onBackClick }: LinkedDevicesProps) {
  const devices = [
    { icon: "mobile" as const, name: "POCO M6", lastActive: "Last active yesterday 10:16 pm" },
    { icon: "windows" as const, name: "Windows", lastActive: "Last active 5 February 9:15 pm" },
    { icon: "windows" as const, name: "Windows", lastActive: "Last active 4 February 12:05 am" },
  ];

  const handleLogout = (deviceName: string) => {
    console.log("Logging out from:", deviceName);
  };

  return (
    <div className="min-h-screen w-full bg-white px-4 py-6 md:px-6 md:py-8">
      {/* Back Arrow */}
      <button
        onClick={onBackClick}
        className="flex items-center justify-center size-[38px] -rotate-90 hover:opacity-70 transition-opacity"
      >
        <BackArrow />
      </button>

      {/* Main Container */}
      <div className="max-w-[760px] mx-auto mt-4 md:mt-6">
        {/* Title */}
        <h1 className="font-['Poppins',sans-serif] font-semibold text-[24px] md:text-[28px] text-[#262626] text-center mb-6 md:mb-8">
          Linked devices
        </h1>

        {/* Devices Card */}
        <div className="bg-[#f6f6f4] rounded-[16px] px-5 py-8 md:px-8 md:py-10">
          {/* Instruction */}
          <p className="font-['Poppins',sans-serif] font-medium text-[14px] md:text-[16px] text-[#464646] text-center mb-6 md:mb-8">
            Tap a device to log out
          </p>

          {/* Device List */}
          <div className="space-y-5 md:space-y-6 max-w-[600px] mx-auto">
            {devices.map((device, index) => (
              <DeviceItem
                key={index}
                icon={device.icon}
                name={device.name}
                lastActive={device.lastActive}
                onLogout={() => handleLogout(device.name)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
