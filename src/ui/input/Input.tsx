import React from "react";
import "./input.scss";
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "small" | "normal" | "big";
  error?: boolean;
}
const Input: React.FC<InputProps> = ({
  inputSize = "normal",
  error = false,
  className = "",
  ...props
}) => {
  const inputClasses = [
    "input",
    `input--${inputSize}`,
    error ? "input--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return <input {...props} className={inputClasses} />;
};

export default Input;
