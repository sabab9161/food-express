import { Check, Eye, EyeOff, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getPasswordStatus, passwordChecklist } from "../utils/passwordValidation";

const strengthStyles = {
  Weak: "bg-red-50 text-red-700",
  Medium: "bg-amber-50 text-amber-700",
  Strong: "bg-emerald-50 text-emerald-700"
};

const PasswordField = ({
  label = "Password",
  value,
  onChange,
  placeholder = "Create a strong password",
  required = true
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const status = useMemo(() => getPasswordStatus(value), [value]);

  return (
    <div className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-bold text-slate-700">{label}</span>
        <span className={`rounded-md px-2 py-1 text-xs font-black ${strengthStyles[status.strength]}`}>
          {status.strength}
        </span>
      </div>

      <div className="relative">
        <input
          className="input pr-12"
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          minLength={8}
          required={required}
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 grid -translate-y-1/2 place-items-center text-slate-500 hover:text-ink"
          onClick={() => setShowPassword((current) => !current)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="mt-3 grid gap-2 text-xs font-bold text-slate-600 sm:grid-cols-2">
        {passwordChecklist.map((item) => {
          const isMet = status.checks[item.key];
          const Icon = isMet ? Check : X;

          return (
            <div key={item.key} className={isMet ? "flex items-center gap-2 text-emerald-700" : "flex items-center gap-2 text-slate-500"}>
              <Icon size={14} />
              {item.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordField;
