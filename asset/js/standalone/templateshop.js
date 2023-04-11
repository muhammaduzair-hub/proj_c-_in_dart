/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global Stripe, templateshop_controller */

const queryString = window.location.search;
const urlParams = new URLSearchParams( queryString );
const sessionId = urlParams.get( 'sessionId' );

if( sessionId )
{
  // Create a Stripe client.
  const stripe = templateshop_config.stripe();
  stripe.redirectToCheckout( {
    sessionId: sessionId
  } ).then( function( result )
  {
    console.log( "stripe result", result );
    if( result.error )
    {
      console.error( result.error.message );
      window.location.href = templateshop_config.checkoutSession.URL.error;

    }
    else
    {
      console.log( "stripe SUCCESS" );
      window.location.href = templateshop_config.checkoutSession.URL.success;
    }
  } );
}