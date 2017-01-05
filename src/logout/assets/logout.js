function logout() {
  Cookies.expire('bearer');
  Cookies.expire('refresh');
  Cookies.expire('userid');
  window.location.replace('/');
}
