import { useParams } from "next/navigation";
import { useAppRouter } from "./useAppRouter";

export const useStoreNavigation = () => {
  const router = useAppRouter();
  const params = useParams();
  const storeId = params?.store_id as string;

  const basePath = `/stores/${storeId}`;

  const navigate = (path: string) => {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return router.push(`${basePath}${cleanPath}`);
  };

  return { storeId, basePath, navigate, router };
};
