class ImportJobHandler extends CreateJobHandler {
    constructor(templateID, layoutMethodID) {
        super(templateID, layoutMethodID);
    }

    get canRecollect() {
        false;
    }

    begin() {
        const cadGroup = templateshop_controller.get_group_by_id(28);
        const cadTemplates = cadGroup ? cadGroup.templates : [];
        const svgGroup = templateshop_controller.get_group_by_id(29);
        const svgTemplates = svgGroup ? svgGroup.templates : [];
        const toggleTheseOn = cadTemplates.concat(svgTemplates);
    
        toggleTheseOn.forEach((templateID)=>{
          if (!createJobMenuController.templateVisible(templateID)) {
            templateshop_controller.toggle_template(templateID);
          }
        });
        file_loader_screen.importHelper();
    }
}