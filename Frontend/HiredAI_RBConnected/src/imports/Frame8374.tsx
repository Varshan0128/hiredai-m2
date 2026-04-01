export default function Frame() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-white h-[325px] left-0 rounded-[20px] top-0 w-[508px]" />
      <p className="absolute font-['Poppins:Medium',sans-serif] h-[47px] leading-[normal] left-[55px] not-italic text-[36px] text-black top-[37px] w-[307px] whitespace-pre-wrap">Edit profile</p>
      <p className="absolute font-['Poppins:Medium',sans-serif] h-[47px] leading-[normal] left-[55px] not-italic text-[36px] text-black top-[125px] w-[340px] whitespace-pre-wrap">Change password</p>
      <p className="absolute font-['Poppins:Medium',sans-serif] h-[47px] leading-[normal] left-[55px] not-italic text-[36px] text-black top-[226px] w-[340px] whitespace-pre-wrap">Linked devices</p>
    </div>
  );
}