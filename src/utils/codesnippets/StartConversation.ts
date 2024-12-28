export const generateStartConversationSnippet = (agent_id: string, language: string) => {
    if (language === 'javascript') {
        return `// Create a new context
const contextResponse = await fetch('https://api.ajentify.com/context', {
    method: 'POST',
    body: JSON.stringify({
        agent_id: "${agent_id}"
    }),
});
const context = await contextResponse.json()

// Send a message
const messageResponse = await fetch('https://api.ajentify.com/chat', {
    method: 'POST',
    body: JSON.stringify({
        context_id: context.id,
        message: "Hello, World!"
    }),
});`;
    }

    if (language === 'python') {
        return `import requests
import json

# Create a new context
context_response = requests.post(
    'https://api.ajentify.com/context',
    data=json.dumps({
        'agent_id': '6539e2ad-5b2c-4b92-bb66-cd5cbd69c5b8'
    })
)
context = context_response.json()

# Send a message
message_response = requests.post(
    'https://api.ajentify.com/chat',
    data=json.dumps({
        'context_id': context['id'],
        'message': 'Hello, World!'
    })
)`;
    }

    return 'Language not supported';

}