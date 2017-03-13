// @flow
'use strict';

export type Options = {
  logLevel?: string,
  clientAuth: ?string,
  resourceServer: string,
  rabbitMQ: string,
  uploadFolder: string,
  uploadSizeLimit: string,
  bearer?: string,
  port: number
};
