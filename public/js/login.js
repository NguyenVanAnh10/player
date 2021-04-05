import { loginModal } from "./fontend.js";

function onSignIn(googleUser) {}
let auth2 = null;
const startApp = function () {
  gapi.load("auth2", function () {
    // Retrieve the singleton for the GoogleAuth library and set up the client.
    auth2 = gapi.auth2.init({
      client_id:
        "538597435502-6mbjq6pphb457uii5asb2drfqn27optr.apps.googleusercontent.com",
      cookiepolicy: "single_host_origin",
      // Request scopes in addition to 'profile' and 'email'
      //scope: 'additional_scope'
    });
    attachSignin(document.getElementById("customBtn"));
  });
};

function attachSignin(element) {
  auth2.attachClickHandler(
    element,
    {},
    function (googleUser) {
      loginModal.hide();
      const profile = googleUser.getBasicProfile();
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: profile.getId(),
          name: profile.getName(),
          imgURL: profile.getImageUrl(),
          email: profile.getEmail(),
        })
      );
      profile.getImageUrl() &&
        avatar.setAttribute("src", profile.getImageUrl());
    },
    function (error) {
      console.log(JSON.stringify(error, undefined, 2));
    }
  );
}

startApp();
