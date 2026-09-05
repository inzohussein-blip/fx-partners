/** Shared auth input field with label and brand focus ring. */
export function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  dir,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        dir={dir}
        className="w-full rounded-xl border border-white/10 bg-ink-900/60 px-4 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </label>
  );
}
