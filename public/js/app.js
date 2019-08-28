'use strict';

console.log("it's working");

$('.hide-me').hide();

$('.select-button').click(
  $('.hide-me').show()
);