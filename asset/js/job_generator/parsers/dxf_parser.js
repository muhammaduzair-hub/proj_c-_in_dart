/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global this, Infinity, dxf */

class dxf_parser extends generic_parser
{
  static template_id = "dxf_parser";
  static template_title = "DXF";
  static template_image = "img/file_icons/dxf.png";
  constructor( id, name = "DXF File", dxf_string, tasks)
  {
    super( id, name, dxf_string );

    if( this.data )
    {
      this.loaded_tasks = dxf.load( this.data );
    }
    if( tasks )
    {
      this.loaded_tasks = tasks;
  }
  }

  get template_type()
  {
    return this._template_type;
  }
  set template_type( val )
  {
    this._template_type = val;
  }

  job_name( translate_dict )
  {
    //var pitch_titlte = translate_dict[this.template_title] ? translate_dict[this.template_title] : this.template_title;
    //var pitch_type = translate_dict[this.template_type] ? translate_dict[this.template_type] : this.template_type;

    var pitch_titlte = "";
    var pitch_type = this.name;

    var pitch_type_name = pitch_titlte + " " + pitch_type;
    return pitch_type_name;
  }
}


