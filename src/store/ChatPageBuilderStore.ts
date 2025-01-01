import { makeAutoObservable } from 'mobx';
import { ChatPageData } from '@/types/chatpagedata';
import { ShowAlertParams } from '@/app/components/AlertProvider';
import { authStore } from './AuthStore';


interface ChatPageStringValues {
    heading: string;
    description: string;
}

class ChatPageBuilderStore {
    chatPage: ChatPageData | undefined = undefined;

    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;

    constructor() {
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }


    initiateNew = () => {
        this.chatPage = {
            chat_page_id: '',
            org_id: authStore.user?.organizations[0].id || '',
            agent_id: '',
            heading: '',
            description: '',
            chat_page_style: {
                background_color: '#ffffff',
                heading_color: '#000000',
                description_color: '#000000',
                button_background_color: '#ffffff',
                button_text_color: '#000000',
                button_hover_background_color: '#000000',
                button_hover_text_color: '#ffffff',
            },
            chat_box_style: {
                background_color: '#ffffff',
                border_color: '#000000',
                ai_message_background_color: '#000000',
                ai_message_text_color: '#ffffff',
                user_message_background_color: '#000000',
                user_message_text_color: '#ffffff',
                user_input_background_color: '#ffffff',
                user_input_textarea_background_color: '#ffffff',
                user_input_textarea_text_color: '#000000',
                user_input_textarea_focus_color: '#000000',
                user_input_textarea_placeholder_text: 'Type a message...',
                user_input_textarea_placeholder_color: '#000000',
                user_input_send_button_color: '#000000',
                user_input_send_button_hover_color: '#ffffff',
                user_input_send_button_text_color: '#ffffff',
                typing_indicator_background_color: '#000000',
                typing_indicator_dot_color: '#ffffff',
            },
            buttons: [],
        }
    }

    setStringValue = (field: keyof ChatPageStringValues, value: string) => {
        if (!this.chatPage) return;
        this.chatPage[field] = value;
    }
    
}

export const chatPageBuilderStore = new ChatPageBuilderStore();