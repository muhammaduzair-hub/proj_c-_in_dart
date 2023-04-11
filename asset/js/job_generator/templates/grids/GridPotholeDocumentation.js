class GridPotholeDocumentation extends GridPointsOnACircle {
    static template_title = "Pothole documentation";
    static template_id = "grid_pothole_documentation_beta";

    constructor(id, name, layout_method) {
        super(id, name, layout_method);

        this.options.paintPoints.val = false;
        this.options.paintPoints.adjustable = false;

        this.options.wait.val = false;
        this.options.wait.adjustable = false;

        this.options.waitTime.val = 0;
        this.options.waitTime.configurable = false;
    }
}