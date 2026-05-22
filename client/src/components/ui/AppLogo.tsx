import Image from "next/image";

interface AppLogoProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

export const AppLogo = ({ size = 30, className, priority }: AppLogoProps) => {
  return (
    <Image
      src={"/easeinv-logo.png"}
      alt="ease-inv"
      width={size}
      height={Math.round(size * (414 / 471))}
      style={{ height: "auto" }}
      className={className}
      priority={priority}
    />
  );
};

export const AppLogoFull = ({
  size = 30,
  className,
  priority,
}: AppLogoProps) => {
  return (
    <Image
      src={"/easeinv-logo-full.png"}
      alt="ease-inv"
      width={size}
      height={Math.round(size * (414 / 1464))}
      style={{ height: "auto" }}
      className={className}
      priority={priority}
    />
  );
};
