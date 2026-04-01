import svgPaths from "./svg-apvu4a6ob3";

function BackArrow() {
  return (
    <div className="relative size-[50px]" data-name="back-arrow">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 50 50">
        <g id="back-arrow">
          <path d={svgPaths.p3038400} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
        </g>
      </svg>
    </div>
  );
}

function Rectangle() {
  return (
    <div className="absolute h-[848px] left-[calc(12.5%+109px)] top-[134px] w-[1078px]">
      <div className="absolute bg-[#f6f6f4] inset-0 rounded-[20px]" />
    </div>
  );
}

function MaterialSymbolsSettingsOutlineRounded() {
  return (
    <div className="absolute left-[calc(12.5%+193px)] size-[57px] top-[193px]" data-name="material-symbols:settings-outline-rounded">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57 57">
        <g id="material-symbols:settings-outline-rounded">
          <path d={svgPaths.p30fe3a00} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function IcRoundHistory() {
  return (
    <div className="absolute left-[calc(12.5%+193px)] size-[57px] top-[294px]" data-name="ic:round-history">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 57 57">
        <g id="ic:round-history">
          <path d={svgPaths.p3b983200} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function MaterialSymbolsLogoutRounded() {
  return (
    <div className="absolute left-[calc(12.5%+199px)] size-[53px] top-[395px]" data-name="material-symbols:logout-rounded">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53 53">
        <g id="material-symbols:logout-rounded">
          <path d={svgPaths.p297c7080} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function MaterialSymbolsDeleteOutlineRounded() {
  return (
    <div className="absolute left-[calc(12.5%+197px)] size-[53px] top-[493px]" data-name="material-symbols:delete-outline-rounded">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 53 53">
        <g id="material-symbols:delete-outline-rounded">
          <path d={svgPaths.p20946000} fill="var(--fill-0, #CE2828)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

export default function Profile() {
  return (
    <div className="bg-white relative size-full" data-name="profile">
      <div className="absolute flex items-center justify-center left-[53px] size-[50px] top-[41px]" style={{ "--transform-inner-width": "1200", "--transform-inner-height": "154" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <BackArrow />
        </div>
      </div>
      <Rectangle />
      <p className="absolute font-['Poppins:Medium',sans-serif] h-[47px] leading-[normal] left-[calc(25%+67px)] not-italic text-[36px] text-black top-[193px] w-[307px] whitespace-pre-wrap">Account center</p>
      <p className="absolute font-['Poppins:Medium',sans-serif] h-[47px] leading-[normal] left-[calc(25%+67px)] not-italic text-[36px] text-black top-[294px] w-[307px] whitespace-pre-wrap">Resume history</p>
      <p className="absolute font-['Poppins:Medium',sans-serif] h-[47px] leading-[normal] left-[calc(25%+67px)] not-italic text-[36px] text-black top-[395px] w-[307px] whitespace-pre-wrap">Log out</p>
      <p className="absolute font-['Poppins:Medium',sans-serif] h-[47px] leading-[normal] left-[calc(25%+67px)] not-italic text-[#ce2828] text-[36px] top-[496px] w-[307px] whitespace-pre-wrap">Delete account</p>
      <MaterialSymbolsSettingsOutlineRounded />
      <IcRoundHistory />
      <MaterialSymbolsLogoutRounded />
      <MaterialSymbolsDeleteOutlineRounded />
    </div>
  );
}