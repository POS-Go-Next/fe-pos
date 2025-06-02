// components/shared/EmployeeLoginDialog.tsx
"use client";

import { FC, useState } from "react";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/schemas";
import { z } from "zod";

interface EmployeeLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
}

const EmployeeLoginDialog: FC<EmployeeLoginDialogProps> = ({
  isOpen,
  onClose,
  onLogin,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  const { login, isLoading } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      // Validate form data with Zod
      const validatedData = loginSchema.parse({ username, password });
      
      // Call login API
      const result = await login(validatedData);
      
      if (result.success && result.data) {
        // Success - call parent callback with user data
        onLogin(result.data.user);
        onClose();
        
        // Reset form
        setUsername("");
        setPassword("");
        setShowPassword(false);
      } else {
        // Handle field-specific errors (no popup for validation errors)
        if (result.errors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(result.errors).forEach(([field, messages]) => {
            fieldErrors[field] = messages[0];
          });
          setValidationErrors(fieldErrors);
        }
      }
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        // Handle Zod validation errors (no popup, just field errors)
        const fieldErrors: Record<string, string> = {};
        err.errors.forEach((error) => {
          if (error.path.length > 0) {
            fieldErrors[error.path[0]] = error.message;
          }
        });
        setValidationErrors(fieldErrors);
      }
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setUsername("");
      setPassword("");
      setShowPassword(false);
      setValidationErrors({});
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={handleClose}></div>

      {/* Dialog */}
      <div className="bg-[#F5F5F5] rounded-lg w-full max-w-md p-6 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#202325]">
            Employee Login
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-50"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" noValidate>
          <div className="bg-white rounded-lg p-6 mb-6">
            <div className="mb-6">
              <label
                htmlFor="username"
                className="block text-gray-800 mb-2 font-medium"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className={`w-full bg-[#F5F5F5] border-none rounded-md p-4 text-gray-800 ${
                  validationErrors.username ? 'ring-2 ring-red-500' : ''
                }`}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                disabled={isLoading}
              />
              {validationErrors.username && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.username}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-gray-800 mb-2 font-medium"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Securely enter your password"
                  className={`w-full bg-[#F5F5F5] border-none rounded-md p-4 pr-12 text-gray-800 ${
                    validationErrors.password ? 'ring-2 ring-red-500' : ''
                  }`}
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-[#025CCA] text-white font-semibold py-4 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>

            <button
              type="button"
              disabled={isLoading}
              className="w-14 h-14 flex-shrink-0 bg-[#F5F5F5] rounded-md flex items-center justify-center disabled:opacity-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-[#025CCA]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLoginDialog;