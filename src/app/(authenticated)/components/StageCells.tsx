'use client';

import React from 'react';
import { Code, Tag, TagLabel, Text, useColorModeValue } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { observer } from 'mobx-react-lite';
import { stagesStore } from '@/store/StagesStore';

/**
 * Renders the resource's `logical_name` cell on a list page. Displays a small
 * monospace badge when present; otherwise an em-dash. Used for AjDK-managed
 * resources (those owned by a stage). Only rendered when the org has at least
 * one stage — see {@link stagesStore.hasAnyStage}.
 */
export const LogicalNameCell = ({ logicalName }: { logicalName?: string | null }) => {
    const subtextColor = useColorModeValue('gray.500', 'gray.400');
    if (!logicalName) {
        return <Text fontSize="xs" color={subtextColor}>—</Text>;
    }
    return (
        <Code fontSize="xs" px={2} py={0.5} borderRadius="md">
            {logicalName}
        </Code>
    );
};

/**
 * Resolves a `stage_id` to the stage's `name` from {@link stagesStore} and
 * renders a Tag that links to `/stages/{stage_id}`. Falls back to a truncated
 * UUID if the stage isn't in the cache (shouldn't happen if the parent page
 * loads stages on mount, but it's defensive).
 */
export const StageCell = observer(({ stageId }: { stageId?: string | null }) => {
    const router = useRouter();
    const subtextColor = useColorModeValue('gray.500', 'gray.400');

    if (!stageId) {
        return <Text fontSize="xs" color={subtextColor}>—</Text>;
    }

    const stage = stagesStore.stages?.find((s) => s.stage_id === stageId);
    const label = stage?.name ?? `${stageId.slice(0, 8)}…`;

    return (
        <Tag
            size="sm"
            variant="subtle"
            colorScheme="purple"
            cursor="pointer"
            onClick={(e) => {
                e.stopPropagation();
                router.push(`/stages/${stageId}`);
            }}
        >
            <TagLabel>{label}</TagLabel>
        </Tag>
    );
});
