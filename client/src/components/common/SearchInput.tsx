import { Icon } from "./Icon";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export const SearchInput = ({ value, onChange, placeholder, id, className }: SearchInputProps) => {
  return (
    <div className={`relative flex-1 ${className || ""}`}>
      <Icon name="search" className="absolute left-3 top-2.5 text-slate-400 text-lg" />
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 transition"
      />
    </div>
  );
};
