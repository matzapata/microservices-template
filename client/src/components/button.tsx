import classNames from "classnames";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "small" | "medium" | "large";
  isLoading?: boolean;
  isDisabled?: boolean;
}

export function PrimaryButton(props: ButtonProps) {
  const { children, isDisabled, isLoading, className, ...rest } = props;

  // Define the base classes that apply to all buttons
  const baseClasses =
    "inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none  dark:focus:outline-none dark:focus:ring-1 dark:focus:ring-gray-600";

  // Define classes based on the specified size
  const sizeClasses: string = {
    small: "py-2 px-3",
    medium: "py-3 px-4",
    large: "p-4 sm:p-5",
  }[props.size || "medium"];

  return (
    <button
      disabled={isDisabled || isLoading}
      className={classNames(className, baseClasses, sizeClasses)}
      {...rest}
    >
      {isLoading && (
        <span
          className="animate-spin inline-block w-4 h-4 border-[3px] border-current border-t-transparent text-white rounded-full"
          role="status"
          aria-label="loading"
        ></span>
      )}
      {children}
    </button>
  );
}
