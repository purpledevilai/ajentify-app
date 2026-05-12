'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAuthFlowStores } from '@/store/AuthFlowStoreContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';

const UserDetailsStep = observer(() => {
    const { signUp: signUpStore } = useAuthFlowStores();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signUpStore.submitSignUp();
    };

    return (
        <div>
            <div className="mb-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
                    <UserIcon className="size-5 text-brand-500" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    Create your account
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Start your journey with Ajentify today
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <Label htmlFor="firstName">First name</Label>
                        <Input
                            id="firstName"
                            placeholder="Thomas"
                            value={signUpStore.firstName}
                            onChange={(e) => signUpStore.setField('firstName', e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="lastName">Last name</Label>
                        <Input
                            id="lastName"
                            placeholder="Anderson"
                            value={signUpStore.lastName}
                            onChange={(e) => signUpStore.setField('lastName', e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="neo@matrix.ai"
                        value={signUpStore.email}
                        onChange={(e) => signUpStore.setField('email', e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={signUpStore.password}
                        onChange={(e) => signUpStore.setField('password', e.target.value)}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={signUpStore.confirmPassword}
                        onChange={(e) =>
                            signUpStore.setField('confirmPassword', e.target.value)
                        }
                        required
                    />
                </div>

                {signUpStore.signUpError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                        {signUpStore.signUpError}
                    </div>
                )}

                <Button
                    type="submit"
                    className="mt-1 w-full"
                    disabled={signUpStore.signUpLoading}
                >
                    {signUpStore.signUpLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                            Creating account…
                        </span>
                    ) : (
                        'Continue'
                    )}
                </Button>
            </form>
        </div>
    );
});

export default UserDetailsStep;
