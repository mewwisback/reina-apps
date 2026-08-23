import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthLayout } from '../../components/auth/auth-layout';
import { SocialButtons } from '../../components/auth/social-buttons';

export const metadata: Metadata = { title: 'Create account' };

export default function SignupPage() {
  return (
    <AuthLayout
      kicker="JOIN THE ARENA"
      heading="Create your account"
      panel="card-blur"
      panelBanner="UNLOCK YOUR FIRST PACK"
      panelBannerSub="Create an account to reveal what's inside."
    >
      <SocialButtons />
      <div style={{ marginTop: 28, textAlign: 'center', fontSize: 13, color: 'rgba(237,231,220,.55)' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Log in
        </Link>
      </div>
    </AuthLayout>
  );
}