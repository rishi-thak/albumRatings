import { useQuery } from "@tanstack/react-query";
import { getAlbums, Album } from "../services/api";

export function useAlbums() {
  return useQuery<Album[]>({
    queryKey: ["albums"],
    queryFn: getAlbums,
  });
}
