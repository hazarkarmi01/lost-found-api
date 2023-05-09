FROM justadudewhohacks/opencv-nodejs
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
RUN npm install opencv4nodejs
# If you are building your code for production
# RUN npm ci --omit=dev
ENV MONGO_URI=mongodb://hazar:01161590@13.82.2.24:27017/lostandfound?authSource=admin
# Bundle app source
COPY . .

EXPOSE 3500
CMD [ "node", "server.js" ]