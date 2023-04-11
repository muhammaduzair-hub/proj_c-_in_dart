/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global parseFloat, math */

const keyboard_controller = {
  init: function()
  {
    $( "input[type=number]" ).before( function()
    {
      var min = $( this ).prop( "min" );
      var max = $( this ).prop( "max" );
      var result = false;
      if( !min && !max )
        result = true;
      if( min && !max && parseFloat( min ) < 0 )
        result = true;
      if( !min && max && parseFloat( max ) > 0 )
        result = true;
      if( (min && parseFloat( min ) < 0) && (max && parseFloat( max ) > 0) )
        result = true;
      if( result )
        return "<button class='dark sign_button'>&plusmn;</button>";
    } );
    $( ".sign_button" ).on( "click", function()
    {
      const next = $( this ).siblings("input[type=number]").first();
      const v = next.val();
      if( isNaN( parseFloat( v ) ) ) {
        throw new Error( "Invalid value in input field" );
      }
      let vp = parseFloat( v ) * -1;

      if( vp === 0 && v[0] !== "-" )
        vp = "-" + vp;

      next.val( vp ).change().focus();
    } );
  },
  add_minus: function()
  {
    var o = $( this ).val();
    var orig = o + "";
    var min = parseFloat( $( this ).prop( "min" ) ).meter2unit();
    var max = parseFloat( $( this ).prop( "max" ) ).meter2unit();

    if( o === "" )
      return;

    if( !isNaN( max ) && max <= 0 && o[0] !== "-" )
      o = "-" + o;
    else if( !isNaN( min ) && min >= 0 && o[0] === "-" )
      o = "" + o.slice( 1 );

    $( this ).val( o );

  },
  check_for_nan: function()
  {
    var v = $( this ).val();
    if( v !== "" && isNaN( parseFloat( v ) ) )
    {
      $( this ).addClass( "flashRed" );
      setTimeout( () =>
      {
        $( this ).removeClass( 'warning_outline' );
      }, 250 );
    }
  },
  validate: function()
  {
    var o, p, min, max, step;
    o = $( this ).val();
    min = parseFloat( $( this ).prop( "min" ) ).meter2unit();
    max = parseFloat( $( this ).prop( "max" ) ).meter2unit();
    step = parseFloat( $( this ).prop( "step" ) ).meter2unit();
    
    p = keyboard_controller.do_validation( o, min, max, step );

    p = "" + p;
    invalidInputWarningController.createWarning($(this))
    invalidInputWarningController.positionWarning($(this));
    if( parseFloat( p ) !== parseFloat( o ))
    {
      $( this ).addClass( 'warning_outline' );
      invalidInputWarningController.handleSignButton($(this), false);
      $( this ).prev().removeClass( "gone" );
      if(parseFloat(o) > max){
        invalidInputWarningController.warningText($(this), translate["The maximum allowed value is"], max);
      }
      else{
        invalidInputWarningController.warningText($(this), translate["The minimum allowed value is"], min);
      }
    }
    else
    {
      $( this ).removeClass( 'warning_outline' );
      invalidInputWarningController.handleSignButton($(this));
      $( this ).prev().addClass( "gone" );
    }
  },
  do_validation: function( val, min, max, step )
  {
    var validation = function( o )
    {

      var p = parseFloat( o );
      p = isNaN( p ) ? "0" : "" + p;

      if( !isNaN( max ) && max <= 0 && p[0] !== "-" )
        p = "-" + p;
      else if( !isNaN( min ) && min >= 0 && p[0] === "-" )
        p = "" + p.slice( 1 );

        if( !isNaN( min ) && parseFloat( p ) < min )
          p = min;
        if( !isNaN( max ) && parseFloat( p ) > max )
          p = max;

      p = "" + p;

      if( parseFloat( p ) === 0 && o[0] === "-" && p[0] !== "-" )
        p = "-" + p;

      return p;
    };

    return validation( validation( val ) );
  },
  test_validate: function()
  {
    var vals = [ "-1234454.3435",
      "-98.99",
      "-12.9",
      "-12.34",
      "-10.001",
      "-3",
      "-0.001",
      "-000",
      "-0.00",
      "0",
      "0.00",
      "00000001.1",
      "0.01",
      "1201.0000001",
      "1234454.3435",
      "7638.98701",
      "010",
      "-010",
      "--10",
      "-+10",
      "---10",
      "-+-10" ];

    console.warn( "------------------------- undefined, undefined" );
    vals.forEach( ( v ) => {
      console.log( v, " | ", keyboard_controller.do_validation( v, undefined, undefined, undefined ) );
    } );


    console.warn( "------------------------- -10, undefined" );
    vals.forEach( ( v ) => {
      console.log( v, " | ", keyboard_controller.do_validation( v, -10, undefined, undefined ) );
    } );


    console.warn( "------------------------- undefined, 10" );
    vals.forEach( ( v ) => {
      console.log( v, " | ", keyboard_controller.do_validation( v, undefined, 10, undefined ) );
    } );


    console.warn( "------------------------- -10, 10" );
    vals.forEach( ( v ) => {
      console.log( v, " | ", keyboard_controller.do_validation( v, -10, 10, undefined ) );
    } );


    console.warn( "------------------------- -10, 0" );
    vals.forEach( ( v ) => {
      console.log( v, " | ", keyboard_controller.do_validation( v, -10, 0, undefined ) );
    } );


    console.warn( "------------------------- 0, 10" );
    vals.forEach( ( v ) => {
      console.log( v, " | ", keyboard_controller.do_validation( v, 0, 10, undefined ) );
    } );

    console.warn( "-------------------------" );
  }
};