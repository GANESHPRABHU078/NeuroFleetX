import { cn } from "../../utils/cn";

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
}) => {
  return (
    <div className={cn("relative p-[4px] group", containerClassName)}>
      <div
        className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-75 blur-sm group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-gradient"
        style={{ backgroundSize: "200% 200%" }}
      />
      <div className={cn("relative bg-slate-900 rounded-3xl", className)}>
        {children}
      </div>
    </div>
  );
};
