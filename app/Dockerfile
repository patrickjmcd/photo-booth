# pull official base image
FROM node:26
EXPOSE 3000

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json yarn.lock ./
RUN yarn --frozen-lockfile

# add app
COPY . ./

# start app
CMD ["npm", "start"]