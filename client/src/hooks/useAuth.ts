import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { safeStorage } from "@/lib/safe-dom";

const STORAGE_KEY = "tcr-user";

export function useAuth() {
  const {
    data,
    isLoading: queryLoading,
    error,
  } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    initialData: () => {
      const cached = safeStorage.getItem(STORAGE_KEY);
      return cached ? (JSON.parse(cached) as User) : null;
    },
    onSuccess: (u) => {
      if (u) {
        safeStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        safeStorage.removeItem(STORAGE_KEY);
      }
    },
  });

  const cached = safeStorage.getItem(STORAGE_KEY);
  const user = data ?? (cached ? (JSON.parse(cached) as User) : null);

  return {
    user,
    isLoading: queryLoading || (!!error && !!user),
    isAuthenticated: !!user,
    error,
  };
}
