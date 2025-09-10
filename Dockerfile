FROM node:20-alpine

# Pacchetti di sistema minimi
RUN apk add --no-cache \
    git \
    bash \
    curl \
    nano \
    ca-certificates \
    && update-ca-certificates

WORKDIR /app

# Copia solo package.json e package-lock.json
# E installa le dipendenze (per cui servono i package)
COPY package*.json ./
RUN npm install

# Pacchetti globali npm
RUN npm install -g \
    @angular/cli@19.2.5 \
    @ionic/cli@7.2.1 \
    cordova-res@0.15.4 \
    corepack@0.31.0 \
    native-run@2.0.1

COPY . .

EXPOSE 8100
EXPOSE 3000
EXPOSE 4200
#EXPOSE 35729

# Crea script per alias <ion>
RUN echo '#!/bin/sh' > /usr/local/bin/ion && \
    echo 'ionic serve --host 0.0.0.0 --port 8100 --no-open' >> /usr/local/bin/ion && \
    chmod +x /usr/local/bin/ion

# Avvio shell
CMD ["sh", "-c", "ion"]


# Quelli sotto sono della modalità vecchia
# vedi comandi in docker-compose

# docker build -t ionic_dock .

# docker run -it --name ionic -v "${PWD}:/app" -p 8100:8100 -p 3000:3000 -p 4200:4200 ionic_dock:latest
# tolto -p 35729:35729

# docker start ionic
# ion (per startare il progetto, se CMD è sh)
# altrimenti: docker logs -f ionic
# se non dovesse aggiornarsi: echo "npm install && CHOKIDAR_USEPOLLING=true ionic serve --host 0.0.0.0 --port 8100 --no-open -- --poll 3000" > /usr/local/bin/ion
