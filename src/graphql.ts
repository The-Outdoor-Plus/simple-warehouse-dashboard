import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client/core";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

const defaultHttpLink = createHttpLink({
  uri: import.meta.env.VITE_MONDAY_API_URL || 'https://api.monday.com/v2',
  fetch: (uri: RequestInfo, options: RequestInit) => {
    options.headers = {
      'Content-Type': 'application/json',
      Authorization : import.meta.env.VITE_MONDAY_TOKEN,
      'API-Version' : '2024-07',
    };
    return fetch(uri, options);
  },
});

const defaultCache = new InMemoryCache();

export const mondayApolloClient = new ApolloClient({
  link: defaultHttpLink,
  cache: defaultCache,
  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
    }
  }
});

const fileClientHttpLink = createHttpLink({
  uri: `${import.meta.env.VITE_MONDAY_API_URL}/file` || 'https://api.monday.com/v2/file',
  fetch: (uri: RequestInfo, options: RequestInit) => {
    options.headers = {
      'Content-Type': 'multipart/form-data',
      Authorization : import.meta.env.VITE_MONDAY_TOKEN,
      'API-Version' : '2024-07'
    };
    return fetch(uri, options);
  },
});

const fileClientCache = new InMemoryCache();

export const mondayFileApolloClient = new ApolloClient({
  link: fileClientHttpLink,
  cache: fileClientCache,
});


const newFileClientHttpLink = createUploadLink({
  uri: `${import.meta.env.VITE_MONDAY_API_URL}/file` || 'https://api.monday.com/v2/file',
  headers: {
    "Apollo-Require-Preflight": "true",
    Authorization : import.meta.env.VITE_MONDAY_TOKEN,
    'API-Version' : '2024-07'
  }
});

const newFileClientCache = new InMemoryCache();

export const newMondayFileApolloClient = new ApolloClient({
  link: newFileClientHttpLink,
  cache: newFileClientCache,
});