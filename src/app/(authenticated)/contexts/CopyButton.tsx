'use client';

import React from 'react';
import { IconButton, IconButtonProps, useClipboard } from '@chakra-ui/react';
import { CheckIcon, CopyIcon } from '@chakra-ui/icons';

type CopyButtonProps = {
    value: string;
    ariaLabel: string;
    size?: IconButtonProps['size'];
};

/**
 * Small icon button that copies a string to the clipboard and shows a green
 * check for ~1.5s instead of opening a modal. Stops click propagation so it
 * is safe to use inside clickable table rows.
 */
export const CopyButton = ({ value, ariaLabel, size = 'xs' }: CopyButtonProps) => {
    const { hasCopied, onCopy } = useClipboard(value);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        onCopy();
    };

    return (
        <IconButton
            aria-label={ariaLabel}
            icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
            size={size}
            variant="ghost"
            color={hasCopied ? 'green.500' : undefined}
            onClick={handleClick}
        />
    );
};
