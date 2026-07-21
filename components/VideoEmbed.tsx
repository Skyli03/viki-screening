"use client";

const FADE_CSS = `
  @keyframes vidFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

interface Props { src: string; }

export default function VideoEmbed({ src }: Props) {
  return (
    <>
      <style>{FADE_CSS}</style>
      <div
        className="mx-auto mb-5"
        style={{
          maxWidth: "240px",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 8px 28px rgba(0,0,0,0.14)",
          animation: "vidFadeIn 0.7s ease forwards",
        }}
      >
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "100%", display: "block" }}
        />
      </div>
    </>
  );
}
