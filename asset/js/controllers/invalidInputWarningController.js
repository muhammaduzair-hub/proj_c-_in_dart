/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global parseFloat, math */

const invalidInputWarningController = {
  /**
   * 
   * @param {HTMLElement} parent Element to which the warning bubble is attached.
   */
  createWarning(parent){
    //prev() represents div enveloping the warning bubble components
      if(!$(parent).prev().hasClass("invalid_value_div")){
        $( parent ).before(function() {
          let outerDiv = `<div class="invalid_value_div gone">`;
          let button = `<div class='invalid_value_button' onclick="invalidInputWarningController.toggleWarning(this)">`;
          let image = '<img class="invalid_value_button_img" src="img/icons/Cross_1@2x.png" alt/>';
          let background = "</div><div class='invalid_value_addition'></div>";
          let text = "<div class='invalid_value_bubble'></div></div>";
        return outerDiv + button + image + background + text;
      });
    }
  },
  /**
   * 
   * @param {HTMLElement} parent Element to which the warning bubble is attached.
   * Positioning of the inner components of the warning bubble.
   */
  positionWarning(parent){
    //Enveloping div
      $( parent ).prev().css({top: 6, left: - 104});
      //Text component div positioning
      $( parent ).prev().find(".invalid_value_bubble").css({top: 0, left: $( parent ).position().left - 784});
      //Closed bubble background component div positioning
      $( parent ).prev().find(".invalid_value_bubble").prev().css({top: 0, left:$( parent ).position().left - 535});
      //Button component div positioning
      $( parent ).prev().find(".invalid_value_bubble").prev().prev().css({top: 4, left:$( parent ).position().left - 530});
  },
  /**
   * 
   * @param {HTML} parent Element to which the warning bubble is attached.
   * @param {Number} value Lower limit of the attached input. 
   * @param {Number} max Upper limit of the attached input.
   */
  warningText(parent, text, value = null){
        $(parent).prev().find(".invalid_value_bubble").text(text + " " + value);
  },
  /**
   * 
   * @param {HTML} parent Element to which the warning bubble is attached.
   * @param {Boolean} enable 
   * Handling of enabling and disabling of the +-sign icon if it's located in front of the attached input.
   */
  handleSignButton(parent, enable = true){
    //Checking if the there is a sign button in front of the attached input
    if($( parent ).prev().prev().hasClass("sign_button")){
      if(enable){
        $( parent ).prev().prev().removeClass('gone');
      }
      else{
        $( parent ).prev().prev().addClass('gone');
      }
    }
  },
  /**
   * 
   * @param {HTML} button 
   */
  toggleWarning(button){
    if($(button).next().next().hasClass('gone')){
      //OFF
      //Handling of the icon of the button
      $(button).find(".invalid_value_button_img").attr("src", "img/icons/Cross_1@2x.png");
      $(button).find(".invalid_value_button_img").css("width", "50%");
      $(button).find(".invalid_value_button_img").css("height", "50%");
      //Enabling of the text component of the warning bubble
      $(button).next().next().removeClass('gone');
    }
    else{
      //ON
      //Handling of the icon of the button
      $(button).find(".invalid_value_button_img").attr("src", "img/icons/Warning@2x.png");
      $(button).find(".invalid_value_button_img").css("width", "100%");
      $(button).find(".invalid_value_button_img").css("height", "100%");
      //Disabling of the text component of the warning bubble
      $(button).next().next().addClass('gone');
    }
  }
};