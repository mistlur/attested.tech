import React from "react";
export default function Tooltip({
  children,
  tooltip,
  show,
}: {
  children: React.ReactNode;
  tooltip: { label: string; description: string };
  show?: boolean;
}) {
  return (
    <div className={`relative${show ? " z-20" : ""}`}>
      {children}
      <div
        className={`absolute bottom-full flex flex-col ${
          !show ? "hidden" : null
        }`}
      >
        <div className="relative sm:w-96 p-2 z-30 text-xs leading-none text-white bg-gray-600 shadow-lg rounded-md">
          <div className="text-sm">
            <strong>{tooltip.label}</strong>
          </div>
          <div className="text-xs">{tooltip.description}</div>
        </div>
        <div className="ml-[40px] mb-[2px] w-3 h-3 -mt-2 rotate-45 bg-gray-600" />
      </div>
    </div>
  );
}
