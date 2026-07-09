# Builds the ServeRest frontend (ServeRest/front) pointing at the local API
# and serves the static bundle. CRA 3.4.3 requires Node 14 to install/build.
FROM node:14 AS build
WORKDIR /app
RUN git clone --depth 1 https://github.com/ServeRest/front.git . \
  && sed -i "s#https://serverest.dev#http://localhost:3000#g" src/services/utils.js \
  && npm install --no-audit --no-fund --loglevel=error \
  && CI=false npm run build

# Slim final image that just serves the static files (SPA).
FROM node:14-slim
WORKDIR /app
RUN npm install -g serve@13 --loglevel=error
COPY --from=build /app/build ./build
EXPOSE 3001
CMD ["serve", "-s", "build", "-l", "3001"]
