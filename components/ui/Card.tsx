/* ============================================================
   Card — Brand-compliant container component
   bg-[#1A1A1A], border-white/10, rounded-lg, blue hover glow
   ============================================================ */

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Set to true to disable hover effects (for static cards) */
  noHover?: boolean;
}

export default function Card({
  children,
  className = "",
  noHover = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-[#1A1A1A] border border-white/10 rounded-lg
        shadow-[0_1px_3px_rgba(0,0,0,0.4)]
        ${noHover ? "" : "hover:border-[#00B7FF]/40 hover:shadow-[0_0_20px_rgba(0,183,255,0.15)]"}
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </div>
  );
}
