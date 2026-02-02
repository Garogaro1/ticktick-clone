/**
 * User Profile Page
 *
 * Displays and manages user profile information.
 * Shows user details and account statistics.
 */

import { getServerSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { db } from '@/lib/db';

/**
 * Server component for user profile page.
 * Fetches user data and statistics on the server.
 */
export default async function ProfilePage() {
  const session = await getServerSession();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Fetch user statistics
  const [taskCount, listCount, tagCount] = await Promise.all([
    db.task.count({ where: { userId: session.user.id } }),
    db.list.count({ where: { userId: session.user.id } }),
    db.tag.count({ where: { userId: session.user.id } }),
  ]);

  // Format date
  const joinDate = new Date(session.user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary">Profile</h1>
        <p className="text-text-secondary">Manage your account and preferences</p>
      </div>

      {/* Profile Information Card */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Account Information</h2>

          {/* Avatar and Basic Info */}
          <div className="mb-6 flex items-center gap-6">
            {/* Avatar Placeholder */}
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-bold text-white">
              {session.user.name?.charAt(0).toUpperCase() ||
                session.user.email?.charAt(0).toUpperCase() ||
                'U'}
            </div>

            {/* Name and Email */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-text-primary">
                {session.user.name || 'User'}
              </h3>
              <p className="text-text-secondary">{session.user.email}</p>
            </div>
          </div>

          {/* Account Details */}
          <dl className="space-y-4 border-t border-border pt-4">
            <div className="grid grid-cols-[1fr_2fr] gap-4">
              <dt className="text-text-secondary">User ID</dt>
              <dd className="font-mono text-sm text-text-primary">{session.user.id}</dd>
            </div>

            <div className="grid grid-cols-[1fr_2fr] gap-4">
              <dt className="text-text-secondary">Email</dt>
              <dd className="text-text-primary">
                {session.user.email}
                {session.user.emailVerified && (
                  <span className="ml-2 text-sm text-success">✓ Verified</span>
                )}
              </dd>
            </div>

            <div className="grid grid-cols-[1fr_2fr] gap-4">
              <dt className="text-text-secondary">Member Since</dt>
              <dd className="text-text-primary">{joinDate}</dd>
            </div>
          </dl>
        </div>
      </Card>

      {/* Statistics Card */}
      <Card className="mb-6">
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Your Statistics</h2>

          <div className="grid grid-cols-3 gap-6">
            {/* Tasks Count */}
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold text-primary">{taskCount}</div>
              <div className="text-sm text-text-secondary">Tasks</div>
            </div>

            {/* Lists Count */}
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold text-primary">{listCount}</div>
              <div className="text-sm text-text-secondary">Lists</div>
            </div>

            {/* Tags Count */}
            <div className="text-center">
              <div className="mb-1 text-3xl font-bold text-primary">{tagCount}</div>
              <div className="text-sm text-text-secondary">Tags</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions Card */}
      <Card>
        <div className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-text-primary">Account Actions</h2>

          <div className="space-y-4">
            {/* Sign Out Button */}
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="outline" size="md" fullWidth>
                Sign Out
              </Button>
            </form>

            {/* TODO: Add more actions in future phases */}
            {/* Delete Account, Change Password, etc. */}
          </div>
        </div>
      </Card>
    </div>
  );
}
