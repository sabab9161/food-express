export const passwordRules = {
  minLength: (password) => password.length >= 8,
  uppercase: (password) => /[A-Z]/.test(password),
  lowercase: (password) => /[a-z]/.test(password),
  number: (password) => /\d/.test(password),
  special: (password) => /[@$!%*?&.#_-]/.test(password)
};

export const passwordChecklist = [
  { key: "minLength", label: "8 characters" },
  { key: "uppercase", label: "Uppercase letter" },
  { key: "lowercase", label: "Lowercase letter" },
  { key: "number", label: "Number" },
  { key: "special", label: "Special character" }
];

export const passwordErrorMessage =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.";

export const getPasswordStatus = (password) => {
  const checks = Object.fromEntries(
    Object.entries(passwordRules).map(([key, validate]) => [key, validate(password)])
  );
  const passedCount = Object.values(checks).filter(Boolean).length;
  const isValid = passedCount === passwordChecklist.length;

  let strength = "Weak";
  if (isValid) {
    strength = "Strong";
  } else if (passedCount >= 3) {
    strength = "Medium";
  }

  return { checks, passedCount, isValid, strength };
};
