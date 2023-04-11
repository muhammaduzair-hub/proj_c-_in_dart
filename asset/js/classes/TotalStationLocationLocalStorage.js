/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class TotalStationLocationLocalStorage
{
  constructor( name, description = "", options = {})
  {
    this.name = name;
    this.description = description;
    this.uuid = options.uuid ? options.uuid : guid();

    this._fixpoints = options._fixpoints ? options._fixpoints.map( f => new Vector3( f.x, f.y, f.z ) ) : [ ];
    this.fixpoint_labels = options.fixpoint_labels ? options.fixpoint_labels : [];
    this.fixplate = !!options.fixplate;

    this.is_positioned = options.is_positioned ? options.is_positioned : false;
    this._projection = options._projection ? options._projection : "NONE";

    this.translation = options.translation ? new Vector(options.translation.x, options.translation.y) : new Vector(0,0);
    this.angle = options.angle ? options.angle : 0;
    this.layout = undefined;
  }
};