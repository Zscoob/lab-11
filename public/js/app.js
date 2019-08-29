'use strict';

console.log("it's working");

$(`.hide-me`).hide();

$(`.select-button`).click(function () {
  $(`.hide-me`).show()
});