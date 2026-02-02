'use client';

/**
 * Login Page
 *
 * User authentication page with email and password.
 * Redirects to home page on successful login.
 */

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  /**
   * Handle form submission for login.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate form
    const newErrors: FormErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Invalid email or password' });
      } else if (result?.ok) {
        router.push('/');
        router.refresh();
      }
    } catch {
      setErrors({ general: 'An error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-text-secondary">Sign in to access your tasks</p>
        </div>

        {/* Login Form Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* General Error */}
            {errors.general && (
              <div className="rounded-lg bg-error-light/20 border border-error p-4">
                <p className="text-sm font-medium text-error">{errors.general}</p>
              </div>
            )}

            {/* Email Input */}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={formData.email}
              error={errors.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              required
            />

            {/* Password Input */}
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={formData.password}
              error={errors.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
              required
            />

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary-dark"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="md" fullWidth disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Register Link */}
            <p className="text-center text-sm text-text-secondary">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
                Sign up
              </Link>
            </p>
          </form>
        </Card>

        {/* Demo Notice */}
        <div className="mt-6 rounded-lg bg-background-secondary p-4 text-center">
          <p className="text-sm text-text-secondary">
            Demo: Create an account on the{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary-dark">
              Sign up
            </Link>{' '}
            page
          </p>
        </div>
      </div>
    </div>
  );
}
