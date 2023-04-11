

class CreateJobOnMapHandler extends CreateJobHandler{
  constructor(templateID, layoutMethod) {
    super(templateID, layoutMethod);
  }

  begin() {
    const projectionInfo = this.getProjectionStringAndAlias();
    const lngLatMapCenter = map_controller.background.get_map_center_lnglat();
    const newCenter = ProjectorForward(projectionInfo.string, lngLatMapCenter);
    const newActive = new pt[this.templateID]( -1, this.getJobName(), "free_hand" ).create();

    newActive.projection = projectionInfo.string;
    newActive.proj_alias = projectionInfo.alias;
    newActive.points = [newCenter.toVector()];
    
    this.setActive(newActive);

    edit_pitch_screen_controller.open(false, true);
  }
}