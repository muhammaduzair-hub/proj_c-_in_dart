/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/* global projection_controller */

const globalProjectorFactory = new ProjectorFactory();
const Projector = function( a, b, c )
{
  if(c && c.indexOf(Infinity) >= 0)
    throw "Coordinate contains Infinity";

  const getPString = projection_controller.get_proj_string;

  if( a && b && c)
    return globalProjectorFactory.getProjector( getPString(a), getPString(b) ).forward(c);
  else if( a && b )
    return globalProjectorFactory.getProjector( getPString(a), getPString(b) );
  else if(a)
  { console.log("************************************ 4");
    return globalProjectorFactory.getProjector( getPString(a) );
    }
  else
    throw "No projection given";
};
const ProjectorForward = function( a, b )
{
  if(b && b.indexOf(Infinity) >= 0)
    throw "Coordinate contains Infinity";

  return globalProjectorFactory.getProjector(a).forward(b);
};
const ProjectorInverse = function( a, b )
{
  if(b && b.indexOf(Infinity) >= 0)
    throw "Coordinate contains Infinity";
    
  return globalProjectorFactory.getProjector(a).inverse(b);
};