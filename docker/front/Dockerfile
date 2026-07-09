# Builda o frontend do ServeRest (ServeRest/front) apontando para a API local
# e serve o bundle estático. O CRA 3.4.3 exige Node 14 para instalar/buildar.
FROM node:14 AS build
WORKDIR /app
RUN git clone --depth 1 https://github.com/ServeRest/front.git . \
  && sed -i "s#https://serverest.dev#http://localhost:3000#g" src/services/utils.js \
  && npm install --no-audit --no-fund --loglevel=error \
  && CI=false npm run build

# Imagem final enxuta que apenas serve os arquivos estáticos (SPA).
FROM node:14-slim
WORKDIR /app
RUN npm install -g serve@13 --loglevel=error
COPY --from=build /app/build ./build
EXPOSE 3001
CMD ["serve", "-s", "build", "-l", "3001"]
