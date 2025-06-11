'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { sendJiraAuthCode } from '@/api/integration/sendJiraAuthCode';
import { integrationsStore } from '@/store/IntegrationsStore';
import { useAlert } from '@/app/components/AlertProvider';

export default function OAuthGrantResponsePage() {
  const params = useSearchParams();
  const router = useRouter();
  const { showAlert } = useAlert();

  useEffect(() => {
    const code = params.get('code');
    if (!code) return;
    const run = async () => {
      try {
        await sendJiraAuthCode(code);
        await integrationsStore.loadIntegrations(true);
      } catch (error) {
        showAlert({ title: 'Whoops', message: (error as Error).message });
      } finally {
        router.push('/integrations');
      }
    };
    run();
  }, [params]);

  return null;
}
