import { LucideProps } from "lucide-react";

export type NavMenuType =  {
    id: string;
    label: string;
    basePath: string;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;
}