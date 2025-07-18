// "use client";

// import { createContext, useContext, useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// interface User {
//   id: string;
//   email: string;
//   name: string;
//   isVerified: boolean;
// }

// interface AuthContextType {
//   user: User | null;
//   loading: boolean;
//   login: (email: string, password: string) => Promise<void>;
//   signup: (email: string, password: string, name: string) => Promise<void>;
//   logout: () => Promise<void>;
//   verifyEmail: (code: string) => Promise<void>;
//   forgetPassword: (email: string) => Promise<void>;
//   resetPassword: (token: string, password: string) => Promise<void>;
//   checkAuth: () => Promise<void>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const API_BASE_URL = process.env.API_AUTH_URL;

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchAuth = async () => {
//       await checkAuth();
//       console.log(user);
//     };

//     fetchAuth();
//   }, []);

//   const checkAuth = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/check-auth`, {
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//       });

//       if (response.ok) {
//         const userData = await response.json();
//         setUser(userData.user);
//         console.log(userData?.user);
//       } else {
//         const err = await response.json();
//         setUser(null);
//         throw new Error("" + err.message);
//       }
//     } catch (error) {
//       toast.error("" + error);
//       setUser(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/login`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ email, password }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message);
//       }

//       const userData = await response.json();
//       console.log("data from login: ", userData);
//       router.push("/dashboard");
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(error.message);
//       }
//       throw new Error("An unexpected error occurred");
//     } finally {
//       await checkAuth();
//       setLoading(false);
//     }
//   };

//   const signup = async (email: string, password: string, name: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/signup`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({
//           email,
//           password,
//           name,
//           role: "user",
//           Branch: "alx",
//           photo: "none",
//           isVerified: false,
//         }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Signup failed");
//       }

//       const userData = await response.json();
//       console.log(userData);
//       await checkAuth();
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(error.message);
//       }
//       throw new Error("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/logout`, {
//         method: "POST",
//         credentials: "include",
//       });

//       if (!response.ok) {
//         throw new Error("Logout failed");
//       }

//       await checkAuth();
//       router.push("/login");
//     } catch (error) {
//       console.error("Logout failed:", error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyEmail = async (code: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/verify-email`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ code }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         console.log("Email verification failed:", error);
//         throw new Error(error.message || "Email verification failed");
//       }

//       const result = await response.json();
//       console.log("Verification result:", result);

//       await checkAuth();
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(error.message);
//       }
//       throw new Error("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const forgetPassword = async (email: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/forget-password`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ email }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         console.log("Password reset request failed:", error);
//         throw new Error(error.message || "Password reset request failed");
//       }

//       const res = await response.json();
//       console.log(res);
//       console.log("Password reset request sent");
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(error.message);
//       }
//       throw new Error("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetPassword = async (token: string, password: string) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/reset/${token}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         credentials: "include",
//         body: JSON.stringify({ password }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.message || "Password reset failed");
//       }

//       const res = await response.json();
//       console.log("response:" + res);
//     } catch (error) {
//       if (error instanceof Error) {
//         throw new Error(error.message);
//       }
//       throw new Error("An unexpected error occurred");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         signup,
//         logout,
//         verifyEmail,
//         forgetPassword,
//         resetPassword,
//         checkAuth,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }
