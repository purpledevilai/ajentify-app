'use client';

import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useAuthFlowStores } from '@/store/AuthFlowStoreContext';
import UserDetailsStep from './components/UserDetailsStep';
import VerificationStep from './components/VerificationStep';
import CreateOrganizationStep from './components/CreateOrganizationStep';
import SuccessStep from './components/SuccessStep';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const STEPS = [
    { id: 'userDetails', label: 'Account' },
    { id: 'verification', label: 'Verify' },
    { id: 'createOrganization', label: 'Workspace' },
] as const;

function getStepIndex(step: string): number {
    const idx = STEPS.findIndex((s) => s.id === step);
    return idx === -1 ? STEPS.length : idx;
}

const SignUpPage = observer(() => {
    const router = useRouter();
    const { signUp: signUpStore } = useAuthFlowStores();
    const currentStepIndex = getStepIndex(signUpStore.step);
    const isSuccess = signUpStore.step === 'success';

    useEffect(() => {
        return () => {
            signUpStore.reset();
        };
    }, [signUpStore]);

    const getCurrentStepComponent = () => {
        switch (signUpStore.step) {
            case 'userDetails':
                return <UserDetailsStep />;
            case 'verification':
                return <VerificationStep />;
            case 'createOrganization':
                return <CreateOrganizationStep />;
            case 'success':
                return <SuccessStep />;
            default:
                return null;
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50/60 dark:from-gray-950 dark:via-gray-900 dark:to-purple-950/20">
            {/* Decorative background blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-48 -right-48 h-96 w-96 rounded-full bg-brand-500/8 blur-3xl dark:bg-brand-500/5" />
                <div className="absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-brand-400/8 blur-3xl dark:bg-brand-400/5" />
                <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/4 blur-3xl" />
            </div>

            {/* Back button */}
            <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 left-4 z-20 gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => router.back()}
            >
                <ArrowLeft className="size-4" />
                Back
            </Button>

            {/* Main card */}
            <div className="relative z-10 w-full max-w-md px-4 py-8">
                {/* Logo / wordmark */}
                <div className="mb-6 flex justify-center">
                    <span className="text-xl font-bold tracking-tight text-foreground">
                        Ajentify
                    </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-xl shadow-brand-500/5 backdrop-blur-sm dark:border-gray-800/80 dark:bg-gray-900/90">
                    {/* Step progress indicator */}
                    {!isSuccess && (
                        <div className="border-b border-gray-100 px-6 pt-5 pb-4 dark:border-gray-800">
                            <div className="flex items-center">
                                {STEPS.map((step, i) => {
                                    const isCompleted = i < currentStepIndex;
                                    const isActive = i === currentStepIndex;
                                    return (
                                        <React.Fragment key={step.id}>
                                            <div className="flex flex-col items-center gap-1.5">
                                                <div
                                                    className={cn(
                                                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300',
                                                        isCompleted &&
                                                            'bg-brand-500 text-white',
                                                        isActive &&
                                                            'bg-brand-500 text-white ring-4 ring-brand-500/20',
                                                        !isCompleted &&
                                                            !isActive &&
                                                            'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
                                                    )}
                                                >
                                                    {isCompleted ? (
                                                        <Check className="size-3.5" strokeWidth={2.5} />
                                                    ) : (
                                                        i + 1
                                                    )}
                                                </div>
                                                <span
                                                    className={cn(
                                                        'text-xs font-medium transition-colors',
                                                        isActive || isCompleted
                                                            ? 'text-brand-500'
                                                            : 'text-muted-foreground'
                                                    )}
                                                >
                                                    {step.label}
                                                </span>
                                            </div>
                                            {i < STEPS.length - 1 && (
                                                <div
                                                    className={cn(
                                                        'mb-5 h-px flex-1 mx-2 transition-all duration-300',
                                                        i < currentStepIndex
                                                            ? 'bg-brand-500'
                                                            : 'bg-gray-200 dark:bg-gray-700'
                                                    )}
                                                />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step content */}
                    <div className="relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={signUpStore.step}
                                initial={{ x: '60%', opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: '-60%', opacity: 0 }}
                                transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                                style={{ padding: '1.5rem' }}
                            >
                                {getCurrentStepComponent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sign in link */}
                {!isSuccess && (
                    <p className="mt-4 text-center text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            href="/signin"
                            className="font-medium text-brand-500 hover:text-brand-400 hover:underline transition-colors"
                        >
                            Sign in
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
});

export default SignUpPage;
