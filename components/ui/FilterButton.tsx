// A small pill-shaped button used for every filter in the toolbar.
// It only knows two things: is it the selected one, and what to do on click.

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
  // Base styles that are always applied.
  const base =
    "text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize";

  // Styles that change depending on whether this button is selected.
  const state = active
    ? "bg-zinc-900 text-white"
    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200";

  return (
    <button onClick={onClick} className={`${base} ${state}`}>
      {label}
    </button>
  );
}
