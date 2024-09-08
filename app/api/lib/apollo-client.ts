import { setContext } from "@apollo/client/link/context";
import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { nextLocalStorage } from "@/app/utils/commonFuns";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";

// const httpLink = createHttpLink({
//   uri: "https://api-mango-connect.mangoitsol.com/graphql", // Replace with your GraphQL API endpoint
// });

const uploadLink = createUploadLink({
  uri: "https://api-mango-connect.mangoitsol.com/graphql", // Replace with your GraphQL API endpoint
});
// const uploadLink = createUploadLink({
//   uri: `${process.env.NEXT_PUBLIC_SERVER_API}graphql`,
// });

const authLink = setContext((_, { headers }) => {
  const token = nextLocalStorage()?.getItem("auth_token");
  const logintoken = nextLocalStorage()?.getItem("token");
  const authHeaders: any = {};
  // Set authorization header if token is available
  if (token) {
    authHeaders["authorization"] = `Bearer ${token}`;
    authHeaders["apollo-require-preflight"] = "true";
  }
  // Set x-access-token header if logintoken is available
  if (logintoken) {
    authHeaders["x-access-token"] = logintoken;
  }
  return {
    headers: {
      ...headers,
      ...authHeaders,
    },
  };
});
const client = new ApolloClient({
  link: authLink.concat(uploadLink),
  cache: new InMemoryCache(),
});

// const client = new ApolloClient({
//   link: authLink.concat(httpLink),
//   cache: new InMemoryCache(),
// });

export default client;
