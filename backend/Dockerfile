# Base Image
FROM node:20-slim As development

# Install OpenSSL (Required for Prisma)
RUN apt-get update -y && apt-get install -y openssl ca-certificates

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .


RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
