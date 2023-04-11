class Handle
{
  constructor( position, angle, name, icon, chosen_icon, on_drag, on_new_val, units, zindex )
  {
    this.position = position;
    this.angle = angle;
    this.name = name;
    this.icon = icon;
    this.chosen_icon = chosen_icon;
    this.on_drag = on_drag;
    this.on_new_val = on_new_val;
    this.units = units || units === "" ? units : "m";

    if( !zindex )
      this.zindex = icon === "move_handle" ? 100 : 0;
    else
      this.zindex = zindex;
  }
}