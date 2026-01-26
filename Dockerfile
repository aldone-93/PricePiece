# Usa una immagine Node ufficiale
FROM node:20

# Imposta la directory di lavoro
WORKDIR /app

# Copia i file package.json e package-lock.json
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del progetto
COPY . .

# Espone la porta 4200 (default Angular)
EXPOSE 4200

RUN npm run build

RUN npm run start


# Avvia l'app
