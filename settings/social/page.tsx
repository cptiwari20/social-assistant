import SocialAccountsList from '@/app/components/social/SocialAccountsList';
import ConnectSocialAccount from '@/app/components/social/ConnectSocialAccount';

export default function SocialMediaSettings() {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">Social Media Accounts</h1>
      <SocialAccountsList />
      <div className="border-t pt-8">
        <ConnectSocialAccount />
      </div>
    </div>
  );
} 