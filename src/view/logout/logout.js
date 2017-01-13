// @flow
'use strict';

import { Cookies } from '../lib/cookies';

function logout() {
  Cookies.expire('bearer');
  Cookies.expire('refresh');
  Cookies.expire('userid');
  window.location.replace('/');
}

window.logout = logout;
