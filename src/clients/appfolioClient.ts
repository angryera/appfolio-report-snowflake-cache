import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.APPFOLIO_CLIENT_ID!;
const CLIENT_SECRET = process.env.APPFOLIO_CLIENT_SECRET!;
const DATABASE_ID = process.env.APPFOLIO_DATABASE_ID!;

/**
 * Fetches data from AppFolio API.
 * @param endpoint The data endpoint (e.g., "general_ledger").
 * @param params Query parameters for filtering data.
 */
export async function fetchAppFolioData(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  paginated: boolean = false
): Promise<any> {
  try {
    const url = paginated
      ? `https://${CLIENT_ID}:${CLIENT_SECRET}@${DATABASE_ID}.appfolio.com${endpoint}`
      : `https://${CLIENT_ID}:${CLIENT_SECRET}@${DATABASE_ID}.appfolio.com/api/v2/reports/${endpoint}.json`;

    const response = await axios.post(url, {
      params,
    });

    if (response.data.results) {
      return {
        results: response.data.results,
        next_page_url: response.data.next_page_url,
      };
    } else {
      return { results: response.data, next_page_url: null };
    }
  } catch (error: any) {
    console.error("Error fetching data from AppFolio:", error.message);
    throw error;
  }
}
