import { MailCheck, RefreshCw } from "lucide-react";

const OtpVerification = ({
  email,
  otp,
  setOtp,
  onVerify,
  onResend,
  onBack,
  loading,
  sendingOtp = loading,
  verifyingOtp = loading,
  title = "Verify email OTP",
  description = "Enter the 6 digit code sent to your email."
}) => {
  const handleChange = (value) => {
    setOtp(value.replace(/\D/g, "").slice(0, 6));
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
      <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-100 text-brand-700">
        <MailCheck />
      </div>
      <h2 className="mt-4 text-3xl font-black text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description} The code expires in 5 minutes.
      </p>
      <p className="mt-3 rounded-lg bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">{email}</p>

      <form onSubmit={onVerify} className="mt-6">
        <input
          className="input text-center text-3xl font-black tracking-[0.5em]"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={otp}
          onChange={(event) => handleChange(event.target.value)}
          required
        />
        <button type="submit" className="btn-primary mt-5 w-full" disabled={verifyingOtp || otp.length !== 6}>
          {verifyingOtp ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button type="button" className="font-bold text-slate-600 hover:text-ink" onClick={onBack}>
          Change details
        </button>
        <button type="button" className="inline-flex items-center gap-2 font-bold text-brand-600" onClick={onResend} disabled={sendingOtp}>
          <RefreshCw size={16} /> {sendingOtp ? "Resending..." : "Resend OTP"}
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
