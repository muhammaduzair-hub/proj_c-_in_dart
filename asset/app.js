const SETTINGS = {};

const APP_TYPE = {
  TinyLineMarker: "TinyLineMarker",
  TinySurveyor: "TinySurveyor",
  TinyRemote: "TinyRemote"
};
Object.freeze(APP_TYPE);

function app_scecific_setup()
{
  Object.keys( ORIGINAL_SETTINGS ).forEach( ( key ) => {
    SETTINGS[key] = ORIGINAL_SETTINGS[key][AppType];
  } );

  if( AppType === APP_TYPE.TinyLineMarker )
  {
    $( "body" ).addClass( "tlm" );

    $( "#app_title" ).html( "Tiny<b>Line</b>Marker" );
    $( "#app_type" ).html( "Tiny<b>Line</b>Marker" );

    $( ".tsstuff" ).css('display','none');
  }
  else if( AppType === APP_TYPE.TinySurveyor )
  {

    $( "body" ).addClass( "ts" );

    $( "#app_title" ).html( "Tiny<b>Surveyor</b>" );
    $( "#app_type" ).html( "Tiny<b>Surveyor</b>" );

    if( robot_controller.robot_has_capability( 'platform_pump' ) )
    {
      $( "#dummy_field" ).addClass( "gone" );
      $( "#pump_status" ).removeClass( "gone" );
      $( "#robot-selected #cleaning_button" ).removeClass( "gone" );
    }
    else
    {
      $( "#dummy_field" ).removeClass( "gone" );
      $( "#pump_status" ).addClass( "gone" );
      $( "#robot-selected #cleaning_button" ).addClass( "gone" );
    }

    $( ".tlmstuff" ).css('display','none');

    $( "#edit-pitch #revision_button" ).addClass( "gone" );

  }
  else
  {
    $( "#app_title" ).html( "Tiny<b>Mobile</b>Robots" );
    $( "#app_type" ).html( "Tiny<b>Mobile</b>Robots" );

    $( ".tlmstuff" ).css('display','none');
    $( ".tsstuff" ).css('display','none');
  }
}
