import { checkResponseAndGetJson } from "@/utils/api/checkResponseAndParseJson";
import { authStore } from "@/store/AuthStore";


export async function scrapePage(link: string): Promise<string> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/scrape-page/${link}`, {
        method: 'GET',
        headers: {
            'Authorization': await authStore.getAccessToken() || '',
            'Content-Type': 'application/json'
        },
    });
    const resJson = await checkResponseAndGetJson(response) as { page_content: string };
    return resJson.page_content;
  } catch (error) {
    const errorMessage = (error as Error).message || 'An unknown error occurred scraping the page';
    throw Error(errorMessage);
  }
}