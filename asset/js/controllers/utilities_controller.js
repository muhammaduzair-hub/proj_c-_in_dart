

const utilitiesScreenController = {

  choose_utility_overlay: {
    //True === on/ False === off
    status: false,
    off() {
      if(!$("#choose_utility_method_overlay").hasClass("gone") || utilitiesScreenController.choose_utility_overlay.status)
      {
        $("body").removeClass('fixed');
        $("#choose_utility_method_overlay").addClass("animated");
        $("#choose_utility_method_overlay").removeClass("fadeInUp");
        $("#choose_utility_method_overlay").addClass("fadeOutDown");
        
      }
      setTimeout( function()
      {
        $("#choose_utility_method_overlay").addClass("gone");
        joystickScreenController.unhide("utilitiesController");
      }, 250);
      utilitiesScreenController.choose_utility_overlay.status = false;
    },

    on(button) {
      if(robot_controller.is_robot_version_more_or_equal([ 5, 5, 0 ])) {
        utilitiesScreenController.choose_utility_overlay.status = true;         
        map_controller.background.remove_overlays( $( "#choose_utility_method_overlay" ) );

          $( "body" ).addClass( 'fixed' );
          $( "#choose_utility_method_overlay" ).removeClass( "gone" );
          joystickScreenController.hide("utilitiesController")

          if (button) {
            var r = button.getBoundingClientRect();
            $( "#choose_utility_method_overlay" ).css( "left", r.left + (r.width / 2) - ($( "#choose_utility_method_overlay" ).outerWidth() / 2) );
          }

          $( "#choose_utility_method_overlay" ).addClass( "animated" );
          $( "#choose_utility_method_overlay" ).removeClass( "fadeOutDown" );
          $( "#choose_utility_method_overlay" ).addClass( "fadeInUp" );
        }
        else return;
  

    },

    toggle(button) {
      if( !$( "#choose_utility_method_overlay" ).hasClass( "gone" ) ){
        utilitiesScreenController.choose_utility_overlay.off();
      }
      else{
        utilitiesScreenController.choose_utility_overlay.on(button);
      }
    },
  },
  handleToolsButton() {
    let tools = $("#choose_utility_method_overlay").children();
    let tmp = [];
    let tools_length = tools.length;
    for(let i = 0; i < tools_length; i++){
      if(!tools[i].classList.contains("gone")){
        tmp.push(tools[i]);
      }
    }
    const offline = $("#robot-offline").find("#tools_button");
    const selected = $("#robot-selected").find("#tools_button");
    if(tmp.length === 1){
      offline.off();
      selected.off();

      offline.on("click",tmp[0]["attributes"]["onclick"]["nodeValue"]);
      selected.on("click",tmp[0]["attributes"]["onclick"]["nodeValue"]);

      offline.text(()=>translate[tmp[0].innerHTML]);
      selected.text(()=>translate[tmp[0].innerHTML]);

    }
    else if(tmp.length > 1) {
      offline.off();
      selected.off();

      offline.on("click", ()=>utilitiesScreenController.choose_utility_overlay.toggle(offline.get(0)));
      selected.on("click", ()=>utilitiesScreenController.choose_utility_overlay.toggle(selected.get(0)));

      offline.text(translate["Tools"]);
      selected.text(translate["Tools"]);
    }
  },
};

$(()=>{
  event_controller.add_callback("robot_capabilities_updated", utilitiesScreenController.handleToolsButton);
} );