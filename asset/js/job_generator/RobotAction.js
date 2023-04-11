class RobotAction
{
  constructor( key, val, type )
  {
    this.key = key;
    this.value = val;
    this.type = type;
  }
  toRobotAction()
  {
    return new RobotAction(
      this.key,
      this.value,
      this.type
    );
  }
  static fromRobotAction(robotAction)
  {
    return new RobotAction(
      robotAction.key,
      robotAction.value,
      robotAction.type
    );
  }
  copy()
  {
    return new RobotAction( this.key, this.value, this.type );
  }

  static get_default_value( key )
  {
    switch( key )
    {
      case "disable_gnss":
        return false;
      case "pathshift_tool":
        return true;
      case "navigate_tool":
        return true;
      case "ramp_up_max_dist":
        return settings_screeen_controller.force_new_ramp_up_length.default;
      case "ramp_down_max_dist":
        return 1.0;
      case "drive_max_velocity":
        return robot_controller.config.velocity_spray;
      case "platform_direction":
        return 1;
      case "dashed_length":
        return robot_controller.config.spray_line_length ? robot_controller.config.spray_line_length : 0.1;
      case "dashed_space":
        return robot_controller.config.spray_space_length ? robot_controller.config.spray_space_length : 0;
      case "dashed_offset":
        return 0;
      case "lineat_begin_length":
        return 0;
      case "lineat_end_length":
        return 0;
      case "dashed_reference":
        return 0;
      case "dashed_align":
        return 0;
      case "task_merge_next":
        return robot_controller.robot_has_capability( "task_merge_option" );
      case "task_merge_force":
        return false;
    }
  }
}
class IntRobotAction extends RobotAction
{
  constructor( key, val )
  {
    super( key, val, "Int" );
  }
  copy()
  {
    return new IntRobotAction( this.key, this.value );
  }
}
class FloatRobotAction extends RobotAction
{
  constructor( key, val )
  {
    super( key, val, "Float" );
  }
  copy()
  {
    return new FloatRobotAction( this.key, this.value );
  }
}
class BoolRobotAction extends IntRobotAction
{
  constructor( key, val )
  {
    super( key, val ? 1 : 0 );
  }
}