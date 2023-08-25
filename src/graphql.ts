import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client/core";

function getHeaders(): { Authorization?: string; "Content-Type"?: string, "API-Version"?: string } {
  return {
    'Content-Type': 'application/json',
    Authorization : import.meta.env.VITE_MONDAY_TOKEN,
    'API-Version' : '2023-04'
   }
}

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_MONDAY_API_URL || 'https://api.monday.com/v2',
  fetch: (uri: RequestInfo, options: RequestInit) => {
    options.headers = getHeaders();
    return fetch(uri, options);
  },
});

const cache = new InMemoryCache();

export const mondayApolloClient = new ApolloClient({
  link: httpLink,
  cache,
})