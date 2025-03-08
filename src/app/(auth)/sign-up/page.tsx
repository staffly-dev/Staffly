"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import logo from "/public/imgs/logo.png";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/context/authContext";

function validation(name: string, email: string, password: string) {
  if (!name || !email || !password) {
    return "Please fill all the fields";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Please enter a valid email";
  }
  if (password.length < 6) {
    return "Password must be at least 6 characters long";
  }
  return null;
}

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const { signup } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validation(formData.name, formData.email, formData.password);
    if (error) {
      toast.error(error);
      return;
    }
    if (!agree) {
      toast.error("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, formData.name);
      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex gap-3 items-center mb-8">
        <div className="relative w-10 h-10">
          <Image src={logo} alt="HRMS Logo" fill className="object-contain" />
        </div>
        <h1 className="text-2xl font-semibold">HRMS</h1>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Welcome 👋</h2>
          <p className="text-muted-foreground mt-1">
            Please create your account
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                className="h-12"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Email Address"
                className="h-12"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="h-12"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                    <line x1="2" y1="2" x2="22" y2="22"></line>
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="agree"
              id="remember"
              className="rounded cursor-pointer border-gray-300"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <label htmlFor="remember" className="text-sm text-muted-foreground">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <Button
            className="w-full h-12 text-base font-medium"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>

          <p className="text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
