import { cn } from "../utils";

export const Separator = ({
  text,
  className,
}: {
  text?: string;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "w-full h-px bg-gray-200 flex items-center justify-center my-4",
        className
      )}
    >
      {text && (
        <p className="bg-background text-sm text-gray-500 px-2">{text}</p>
      )}
    </div>
  );
};
