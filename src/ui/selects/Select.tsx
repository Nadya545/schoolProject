import React from "react";
import "./selects.scss";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  selectSize?: "small" | "normal" | "big";
  error?: boolean;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  selectSize = "normal",
  error = false,
  className = "",
  children,
  ...props
}) => {
  const selectClasses = [
    "select",
    `select--${selectSize}`,
    error ? "select--error" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <select {...props} className={selectClasses}>
      {children}
    </select>
  );
};

export default Select;
