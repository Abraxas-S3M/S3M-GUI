import { Lock } from 'lucide-react';
import { useAppStore } from '../store';

interface FeatureUnavailableProps {
  name: string;
}

export function FeatureUnavailable({ name }: FeatureUnavailableProps) {
  const language = useAppStore((state) => state.language);
  const isArabic = language === 'AR';

  return (
    <div className="rounded-lg border border-s3m-border-default bg-s3m-elevated/40 p-4 text-sm text-s3m-text-secondary">
      <div className="mb-2 flex items-center gap-2">
        <Lock className="h-4 w-4 text-s3m-text-tertiary" />
        <span className="font-semibold text-s3m-text-primary">{name}</span>
      </div>
      <p dir={isArabic ? 'rtl' : 'ltr'}>
        {isArabic
          ? 'هذه الميزة غير متاحة بعد من الواجهة الخلفية.'
          : 'This feature is not yet available from the backend.'}
      </p>
    </div>
  );
}
