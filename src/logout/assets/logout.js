function logout() {
  Cookies.expire('bearer');
  Cookies.expire('refresh');
  window.location.replace('/');
}
