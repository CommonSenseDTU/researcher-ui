FROM node:6.9.5
MAINTAINER Anders Borch <anders@cyborch.com>

ENV SERVER_PREFIX /opt/researcher-ui
 
RUN mkdir -p $SERVER_PREFIX
ADD ./ $SERVER_PREFIX/
EXPOSE 3000

CMD cd $SERVER_PREFIX && npm run start
