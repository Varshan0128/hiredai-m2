import svgPaths from "./svg-s6vekn30pj";
import imgImage28 from "figma:asset/9ff90c61ae7a94643b9d9884bb987c217b57b71d.png";
import imgImage29 from "figma:asset/ed3a390e622d86ef712709ecc96909a91e5a9560.png";

function TablerArrowLeft() {
  return (
    <div className="relative shrink-0 size-[22px]" data-name="tabler:arrow-left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
        <g id="tabler:arrow-left">
          <path d={svgPaths.p155100} id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex gap-[13px] inset-[24%_18%] items-end">
      <TablerArrowLeft />
      <p className="font-['Poppins:Medium',sans-serif] h-[26px] leading-[normal] not-italic relative shrink-0 text-[20px] text-black w-[53px]">Back</p>
    </div>
  );
}

function Component() {
  return (
    <div className="absolute h-[50px] left-[40px] top-[996px] w-[159px]" data-name="Component 36">
      <div className="absolute inset-0 rounded-[8px]">
        <div aria-hidden="true" className="absolute border border-black border-solid inset-[-0.5px] pointer-events-none rounded-[8.5px]" />
      </div>
      <Frame4 />
    </div>
  );
}

function Frame5() {
  return (
    <div className="h-[11px] mr-[-12.833px] relative shrink-0 w-[12.833px]">
      <div className="absolute inset-[-9.09%_-7.79%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8333 13">
          <g id="Frame 8255">
            <path d={svgPaths.p13c60ae0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function ArrowLeft() {
  return (
    <div className="h-[22px] relative w-[15px]" data-name="Arrow Left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 22">
        <g id="Arrow Left" />
      </svg>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12.833px] py-0 relative shrink-0 w-[141px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] mr-[-12.833px] not-italic relative shrink-0 text-[20px] text-white w-[120px]">Continue</p>
      <Frame5 />
      <div className="flex items-center justify-center mr-[-12.833px] relative shrink-0">
        <div className="flex-none rotate-[180deg]">
          <ArrowLeft />
        </div>
      </div>
    </div>
  );
}

function Frame2() {
  return (
    <div className="bg-black content-stretch flex flex-col items-center justify-center px-0 py-[10px] relative rounded-[8px] shrink-0 w-full">
      <Frame />
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[1509px] p-[10px] top-[986px] w-[179px]">
      <Frame2 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="h-[11px] mr-[-12.833px] relative shrink-0 w-[12.833px]">
      <div className="absolute inset-[-9.09%_-7.79%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.8333 13">
          <g id="Frame 8255">
            <path d={svgPaths.p13c60ae0} id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function ArrowLeft1() {
  return (
    <div className="h-[22px] relative w-[15px]" data-name="Arrow Left">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 22">
        <g id="Arrow Left" />
      </svg>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-center pl-0 pr-[12.833px] py-0 relative shrink-0 w-[141px]">
      <p className="font-['Poppins:Medium',sans-serif] leading-[normal] mr-[-12.833px] not-italic relative shrink-0 text-[20px] text-white w-[120px]">Continue</p>
      <Frame8 />
      <div className="flex items-center justify-center mr-[-12.833px] relative shrink-0">
        <div className="flex-none rotate-[180deg]">
          <ArrowLeft1 />
        </div>
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="bg-black content-stretch flex flex-col items-center justify-center px-0 py-[10px] relative rounded-[8px] shrink-0 w-full">
      <Frame1 />
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute content-stretch flex flex-col items-center justify-center left-[1509px] p-[10px] top-[986px] w-[179px]">
      <Frame3 />
    </div>
  );
}

export default function ResumeBuider() {
  return (
    <div className="bg-white relative size-full" data-name="resume buider - 2">
      <div className="absolute h-[911px] left-[40px] top-[49px] w-[926px]" data-name="image 28">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage28} />
      </div>
      <div className="absolute h-[911px] left-[1037px] top-[49px] w-[641px]" data-name="image 29">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage29} />
      </div>
      <Component />
      <Frame6 />
      <Frame7 />
    </div>
  );
}