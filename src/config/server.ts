import { config } from "./index";

export const logServerInit = (port: number) => {
  console.log(
    `🚀 Server ready at ${config.DEV ? "localhost" : "a11ywatch"}:${port}`
  );
};
