export function BrandText({ className = "" }: { className?: string }) {
  return (
    <span className={className}>
      Runner{" "}
      <span className="bg-gradient-to-r from-[#e64833] to-[#874f41] bg-clip-text font-extrabold text-transparent">
        Up
      </span>
    </span>
  );
}
