// @flow
'use strict';

class Header {
  back() {
    if (document.referrer.indexOf('/join')) {
      window.location.assign('/');
    } else {
      window.location.assign(document.referrer);
    }
  }
}

window.header = new Header();
