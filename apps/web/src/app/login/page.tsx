import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthLayout } from '../../components/auth/auth-layout';
import { SocialButtons } from '../../components/auth/social-buttons';

export const metadata: Metadata = { title: 'Log in' };

export default function LoginPage() {
  return (
    <AuthLayout kicker="WELCOME BACK" heading="Log in to your account" panel="card">
      <SocialButtons />
      <div style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: 'rgba(237,231,220,.55)' }}>
        New to REINA?{' '}
        <Link href="/signup" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}