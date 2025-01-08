import { makeAutoObservable } from 'mobx';
import { getChatPages } from '@/api/chatpage/getChatPages';
import { ChatPageData } from '@/types/chatpagedata';
import { ShowAlertParams } from '@/app/components/AlertProvider';

class ChatPagesStore {
    chatPages: ChatPageData[] | undefined = undefined;
    chatPagesLoading = true;

    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;

    constructor() {
        makeAutoObservable(this);
    }

    reset = () => {
        this.chatPages = undefined;
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    async loadChatPages(force: boolean = false) {
        if (!force && this.chatPages) {
            return;
        }

        try {
            this.chatPagesLoading = true;
            this.chatPages = await getChatPages();
        } catch (error) {
            console.error('Failed to load chat pages', error);
            this.showAlert({
                title: 'Failed to Load Chat Pages',
                message: (error as Error).message || 'An unknown error occurred loading chat pages',
            });
        } finally {
            this.chatPagesLoading = false;
        }
    }
}

export const chatPagesStore = new ChatPagesStore();