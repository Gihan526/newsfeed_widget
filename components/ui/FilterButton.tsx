type FilterButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

export default function FilterButton({
  label,
  active,
  onClick,
}: FilterButtonProps) {
  const base =
    "text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize";

  const state = active
    ? "bg-zinc-900 text-white"
    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200";

  return (
    <button onClick={onClick} className={`${base} ${state}`}>
      {label}
    </button>
  );
}
