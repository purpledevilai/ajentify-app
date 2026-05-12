'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAuthFlowStores } from '@/store/AuthFlowStoreContext';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { MailIcon } from 'lucide-react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

const VerificationStep = observer(() => {
    const { signUp: signUpStore } = useAuthFlowStores();

    return (
        <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10">
                <MailIcon className="size-7 text-brand-500" />
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Check your inbox
            </h1>
            <p className="mt-2 max-w-[280px] text-sm text-muted-foreground">
                We sent a 6-digit code to{' '}
                <span className="font-medium text-foreground">
                    {signUpStore.email || 'your email'}
                </span>
            </p>

            <div className="mt-6 w-full">
                <InputOTP
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS}
                    value={signUpStore.confirmCode}
                    onChange={(val) => signUpStore.setField('confirmCode', val)}
                    containerClassName="justify-center"
                    onComplete={() => signUpStore.confirmSignInCode()}
                >
                    <InputOTPGroup className="gap-2">
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                            <InputOTPSlot
                                key={i}
                                index={i}
                                className="h-12 w-11 rounded-lg border border-input text-base font-semibold first:rounded-l-lg last:rounded-r-lg"
                            />
                        ))}
                    </InputOTPGroup>
                </InputOTP>
            </div>

            {signUpStore.confirmSignUpError && (
                <div className="mt-4 w-full rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                    {signUpStore.confirmSignUpError}
                </div>
            )}

            <Button
                className="mt-6 w-full"
                disabled={
                    signUpStore.confirmSignInLoading ||
                    signUpStore.confirmCode.length < 6
                }
                onClick={() => signUpStore.confirmSignInCode()}
            >
                {signUpStore.confirmSignInLoading ? (
                    <span className="flex items-center gap-2">
                        <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Verifying…
                    </span>
                ) : (
                    'Verify email'
                )}
            </Button>

            <p className="mt-4 text-xs text-muted-foreground">
                Didn&apos;t get a code? Check your spam folder.
            </p>
        </div>
    );
});

export default VerificationStep;
