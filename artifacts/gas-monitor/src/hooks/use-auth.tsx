import { createContext, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useGetMe, getGetMeQueryKey, User } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  
  const { data: user, isLoading, error } = useGetMe({
    query: {
      retry: false,
      queryKey: getGetMeQueryKey(),
    }
  });

  const currentUser = user || null;

  useEffect(() => {
    if (isLoading) return;
    
    // Non-authed user trying to access protected routes
    if (!currentUser && location !== "/login" && location !== "/register") {
      setLocation("/login");
      return;
    }
    
    // Authed user
    if (currentUser) {
      if (location === "/login" || location === "/" || location === "/register") {
        if (currentUser.role === "homeowner") {
          setLocation("/dashboard");
        } else if (currentUser.role === "supplier") {
          setLocation("/supplier/dashboard");
        }
      } else {
        // Enforce role boundaries
        if (currentUser.role === "homeowner" && location.startsWith("/supplier")) {
          setLocation("/dashboard");
        } else if (currentUser.role === "supplier" && !location.startsWith("/supplier") && location !== "/setup") {
          setLocation("/supplier/dashboard");
        }
      }
    }
  }, [currentUser, isLoading, location, setLocation]);

  return (
    <AuthContext.Provider value={{ user: currentUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
