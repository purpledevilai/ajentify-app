import { ChatBoxStyle } from "./chatboxstyle";

export interface ChatPageData {
    chat_page_id: string;
    org_id: string;
    agent_id: string;
    heading: string;
    description?: string;
    chatPageStyle: {
        backgroundColor: string;
        textColor: string;
        headingColor: string;
        descriptionColor: string;
        buttonBackgroundColor: string;
        buttonTextColor: string;
        buttonHoverBackgroundColor: string;
        buttonHoverTextColor: string;
    };
    chatBoxStyle: ChatBoxStyle;
    buttons?: { label: string; link: string }[];
}