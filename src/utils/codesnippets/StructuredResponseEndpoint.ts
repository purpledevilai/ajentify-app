export const generateSRESnippet = (sre_id: string, language: string) => {
    if (language === 'javascript') {
        return `const response = await fetch('https://api.ajentify.com/run-sre/${sre_id}', {
    method: 'POST',
    body: JSON.stringify({
        prompt: "ENTER YOUR PROMPT HERE"
    }),
});
const data = await response.json();
`;
    }

    if (language === 'python') {
        return `import requests
import json

response = requests.post(
    'https://api.ajentify.com/run-sre/${sre_id}',
    data=json.dumps({
        'prompt': 'ENTER YOUR PROMPT HERE'
    })
)
data = response.json()`;
    }

    return 'Language not supported';

}