export const config = {
  DEV: process.env.NODE_ENV !== "production",
  PORT: Number(process.env.PORT || 8020),
  DOCKER_ENV: process.env.DOCKER_ENV,
};
