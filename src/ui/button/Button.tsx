import React from "react";
import "./button.scss";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: "close" | "normal" | "addAndOut";
  active?: boolean;
  onClick?: () => void;
}

/*const sizeClassMap = {
  small: classes.small,
  normal: classes.normal,
  big: classes.big,
};*/
const Button: React.FC<ButtonProps> = ({
  children,
  size = "normal",
  active = false,
  className = "",
  ...props
}) => {
  const buttonClasses = [
    "button",
    `button--${size}`,
    active ? "button--active" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button {...props} className={buttonClasses}>
      {children}
    </button>
  );
};

export default Button;
