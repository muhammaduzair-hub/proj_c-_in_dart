/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * Calculate the numeric integration of a function
 * @param {Function} f
 * @param {number} start
 * @param {number} end
 * @param {number} [step=0.01]
 */
const integrate = memoize( ( f, start, end, step ) =>
{
  let total = 0;
  step = step || 0.01;
  for( let x = start; x < end; x += step )
  {
    total += f( x + step / 2 ) * step;
  }
  return total;
} );

const FresnelDefs =
{
  R: memoize( ( t ) => (0.506 * t + 1.0) / (1.79 * t * t + 2.054 * t + Math.sqrt( 2.0 )) ),
  A: memoize( ( t ) => (1.0 / (0.803 * Math.pow( t, 3 ) + 1.886 * t * t + 2.52 * t + 2.0)) ),
};

const Fresnel =
{
  C: memoize( ( t ) => integrate( ( x ) => Math.cos( 0.5 * Math.PI * Math.pow( x, 2 ) ), 0, t, 0.001 ) ),
  S: memoize( ( t ) => integrate( ( x ) => Math.sin( 0.5 * Math.PI * Math.pow( x, 2 ) ), 0, t, 0.001 ) ),
  Ce: memoize( ( t ) => (t < 0 ? -1 : 1) * (0.5 - FresnelDefs.R( (t < 0 ? -t : t) ) * Math.sin( 0.5 * Math.PI * (FresnelDefs.A( (t < 0 ? -t : t) ) - Math.pow( t, 2 )) )) ),
  Se: memoize( ( t ) => (t < 0 ? -1 : 1) * (0.5 - FresnelDefs.R( (t < 0 ? -t : t) ) * Math.cos( 0.5 * Math.PI * (FresnelDefs.A( (t < 0 ? -t : t) ) - Math.pow( t, 2 )) )) ),
};