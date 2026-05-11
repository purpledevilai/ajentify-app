import { useState } from 'react';
import { JsonDocumentBuilderStore } from './JsonDocumentBuilderStore';

export function useJsonDocumentBuilder(): JsonDocumentBuilderStore {
    return useState(() => new JsonDocumentBuilderStore())[0];
}
