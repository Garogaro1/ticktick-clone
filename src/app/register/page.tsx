'use client';

/**
 * Register Page
 *
 * User registration page with email, password, and name.
 * Creates a new account and signs in the user.
 */

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  /**
   * Validate password strength.
   */
  function validatePassword(password: string): string | undefined {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/\d/.test(password)) {
      return 'Password must contain at least one number';
    }
    return undefined;
  }

  /**
   * Handle form submission for registration.
   */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate form
    const newErrors: FormErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error || 'Registration failed' });
        setIsLoading(false);
        return;
      }

      // Sign in after successful registration
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({
          general: 'Account created but automatic sign-in failed. Please sign in manually.',
        });
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
          <h1 className="mb-2 text-3xl font-bold text-text-primary">Create Account</h1>
          <p className="text-text-secondary">Get started with TickTick Clone</p>
        </div>

        {/* Register Form Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* General Error */}
            {errors.general && (
              <div className="rounded-lg bg-error-light/20 border border-error p-4">
                <p className="text-sm font-medium text-error">{errors.general}</p>
              </div>
            )}

            {/* Name Input */}
            <Input
              label="Name"
              type="text"
              placeholder="John Doe"
              autoComplete="name"
              value={formData.name}
              error={errors.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
              required
            />

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
              autoComplete="new-password"
              value={formData.password}
              error={errors.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
              required
              helperText="Must be 8+ characters with uppercase, lowercase, and number"
            />

            {/* Confirm Password Input */}
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={formData.confirmPassword}
              error={errors.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              disabled={isLoading}
              required
            />

            {/* Submit Button */}
            <Button type="submit" variant="primary" size="md" fullWidth disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            {/* Login Link */}
            <p className="text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary-dark">
                Sign in
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
