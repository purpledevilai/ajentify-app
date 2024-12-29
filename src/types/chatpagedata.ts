import { Context } from "./context";
import { ChatBoxStyle } from "./chatboxstyle";

export interface ChatPageData {
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
    context: Context;
}