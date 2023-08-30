import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client/core";

const defaultHttpLink = createHttpLink({
  uri: import.meta.env.VITE_MONDAY_API_URL || 'https://api.monday.com/v2',
  fetch: (uri: RequestInfo, options: RequestInit) => {
    options.headers = {
      'Content-Type': 'application/json',
      Authorization : import.meta.env.VITE_MONDAY_TOKEN,
      'API-Version' : '2023-04',
    };
    return fetch(uri, options);
  },
});

const defaultCache = new InMemoryCache();

export const mondayApolloClient = new ApolloClient({
  link: defaultHttpLink,
  cache: defaultCache,
});

const fileClientHttpLink = createHttpLink({
  uri: `${import.meta.env.VITE_MONDAY_API_URL}/file` || 'https://api.monday.com/v2/file',
  fetch: (uri: RequestInfo, options: RequestInit) => {
    options.headers = {
      'Content-Type': 'multipart/form-data',
      Authorization : import.meta.env.VITE_MONDAY_TOKEN,
      'API-Version' : '2023-04'
    };
    return fetch(uri, options);
  },
});

const fileClientCache = new InMemoryCache();

export const mondayFileApolloClient = new ApolloClient({
  link: fileClientHttpLink,
  cache: fileClientCache,
});