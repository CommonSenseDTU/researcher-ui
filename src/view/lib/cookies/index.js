// @flow
'use strict';

export type CookieOptions = {
  path?: string,
  domain?: string,
  expires?: any,
  secure?: boolean,
};

declare class Cookies {
  static get(key:string): string;
  static set(key:string, value:any, options?:CookieOptions): Cookies;
  static expire(key:string, options?:CookieOptions): Cookies;
}

declare module 'cookies' {
  declare var exports: {
    CookieOptions: CookieOptions,
    Cookies: Class<Cookies>
  }
}

export { Cookies }
