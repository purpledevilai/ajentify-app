import { request } from "@/api/client";


export async function scrapePage(link: string): Promise<string> {
  const { page_content } = await request<{ page_content: string }>({
    method: 'GET',
    path: `/scrape-page/${link}`,
  });
  return page_content;
}
