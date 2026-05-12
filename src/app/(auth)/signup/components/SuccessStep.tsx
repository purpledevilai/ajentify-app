'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthFlowStores } from '@/store/AuthFlowStoreContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const SuccessStep = () => {
    const router = useRouter();
    const { auth } = useAuthFlowStores();

    const handleGoToHome = async () => {
        await auth.checkAuth();
        router.push('/');
    };

    return (
        <div className="flex flex-col items-center py-4 text-center">
            <div className="relative mb-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10">
                    <CheckCircle2
                        className="size-9 text-brand-500"
                        strokeWidth={1.5}
                    />
                </div>
                {/* Subtle ring animation */}
                <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/10 [animation-duration:2s] [animation-iteration-count:3]" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                You&apos;re all set!
            </h1>
            <p className="mt-2 max-w-[260px] text-sm text-muted-foreground">
                Welcome to Ajentify. Your account and workspace are ready to go.
            </p>

            <div className="mt-8 flex w-full flex-col gap-2">
                <Button className="w-full gap-2" onClick={handleGoToHome}>
                    Get started
                    <ArrowRight className="size-4" />
                </Button>
            </div>
        </div>
    );
};

export default SuccessStep;
