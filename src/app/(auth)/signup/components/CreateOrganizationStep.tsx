'use client';

import React from 'react';
import { observer } from 'mobx-react-lite';
import { useAuthFlowStores } from '@/store/AuthFlowStoreContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2 } from 'lucide-react';

const CreateOrganizationStep = observer(() => {
    const { signUp: signUpStore } = useAuthFlowStores();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signUpStore.createOrganization();
    };

    return (
        <div>
            <div className="mb-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
                    <Building2 className="size-5 text-brand-500" />
                </div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    Set up your workspace
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Give your organization a name. You can always change this later.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <Label htmlFor="orgName">Organization name</Label>
                    <Input
                        id="orgName"
                        placeholder="Acme Corp"
                        value={signUpStore.organizationName}
                        onChange={(e) =>
                            signUpStore.setField('organizationName', e.target.value)
                        }
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        This is the name of your team or company.
                    </p>
                </div>

                {signUpStore.createOrgError && (
                    <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                        {signUpStore.createOrgError}
                    </div>
                )}

                <Button
                    type="submit"
                    className="mt-1 w-full"
                    disabled={signUpStore.createOrgLoading}
                >
                    {signUpStore.createOrgLoading ? (
                        <span className="flex items-center gap-2">
                            <span className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                            Creating workspace…
                        </span>
                    ) : (
                        'Create workspace'
                    )}
                </Button>
            </form>
        </div>
    );
});

export default CreateOrganizationStep;
