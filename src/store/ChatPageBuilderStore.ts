import { makeAutoObservable } from 'mobx';
import { ChatPageData } from '@/types/chatpagedata';
import { ShowAlertParams } from '@/app/components/AlertProvider';
import { authStore } from './AuthStore';
import { agentsStore } from './AgentsStore';
import {defaultChatBoxStyle, defaultDarkChatBoxStyle} from '@/app/components/chatbox/ChatBox'
import { Context } from '@/types/context';

const defaultChatPage = {
    chat_page_id: '',
    org_id: '',
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
    chat_box_style: defaultChatBoxStyle,
    buttons: [],
}

class ChatPageBuilderStore {

    chatPage: ChatPageData;
    chatBoxMode: 'light' | 'dark' = 'light';
    showAlert: (params: ShowAlertParams) => void | undefined = () => undefined;
    dummyContext: Context = {
        context_id: '',
        agent_id: '',
        messages: [
            { sender: 'ai', message: 'Hello! How can I help you today?' },
            { sender: 'human', message: 'I need help with my order.' },
        ],
    }

    constructor() {
        this.chatPage = defaultChatPage;
        makeAutoObservable(this);
    }

    setShowAlert = (showAlert: (params: ShowAlertParams) => void) => {
        this.showAlert = showAlert;
    }

    initiateNew = () => {
        this.chatPage = {
            ...defaultChatPage,
            org_id: authStore.user?.organizations[0].id || '',
            agent_id: agentsStore.agents ? agentsStore.agents[0].agent_id : '',
        };
    }

    setAgentId = (agentId: string) => {
        this.chatPage.agent_id = agentId;
    }

    setHeading = (heading: string) => {
        this.chatPage.heading = heading;
    }

    setDescription = (description: string) => {
        this.chatPage.description = description;
    }

    setBackgroundColor = (color: string) => {
        this.chatPage.chat_page_style.background_color = color;
    }

    setTextColor = (color: string) => {
        this.chatPage.chat_page_style.heading_color = color;
        this.chatPage.chat_page_style.description_color = color;
    }

    setChatBoxMode = (style: 'light' | 'dark') => {
        this.chatBoxMode = style;
        this.chatPage.chat_box_style = style === 'dark' ? defaultDarkChatBoxStyle : defaultChatBoxStyle;
    }


    
}

export const chatPageBuilderStore = new ChatPageBuilderStore();