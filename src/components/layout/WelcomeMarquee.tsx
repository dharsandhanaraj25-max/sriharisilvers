export function WelcomeMarquee() {
  const message = "வாழ்க வளமுடன் — ஸ்ரீஹரி சில்வர்ஸ் தங்களை அன்புடன் வரவேற்கிறது";

  return (
    <div className="print:hidden bg-burgundy-500 text-white overflow-hidden whitespace-nowrap py-1.5">
      <div className="flex w-max animate-marquee">
        <span className="px-6 text-sm font-medium tracking-wide">{message}</span>
        <span className="px-6 text-sm font-medium tracking-wide">{message}</span>
      </div>
    </div>
  );
}
