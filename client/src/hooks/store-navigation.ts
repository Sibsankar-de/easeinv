import { useParams, useRouter } from "next/navigation";

export const useStoreNavigation = () => {
  const router = useRouter();
  const params = useParams();
  const storeId = params?.store_id;

  const basePath = `/stores/${storeId}`;

  const navigate = (path: string) => router.push(`${basePath}/${path}`);

  return { storeId, basePath, navigate };
};
