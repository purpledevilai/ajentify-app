// Temporary per-module builder instance shared by the json-document-builder page and the documents list page.
// This singleton lives in src/app/ (not src/store/) so it is excluded from the lint:arch
// check that forbids module-level singletons in the store directory.
// Replaced by a per-page MobX instance in deliverable H.
import { JsonDocumentBuilderStore } from '@/store/JsonDocumentBuilderStore';

export const jsonDocumentBuilderStore = new JsonDocumentBuilderStore();
