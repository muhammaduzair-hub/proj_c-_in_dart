class HighSchoolFootball9v9 extends us_american_football_base {
  static template_title = "9v9";// Translateable
  static template_id = "american_football_9v9_dev"; // no spaces
  static template_image = "img/templates/football_high_school_black.png"; // no spaces

    constructor( id, name, layout_method ) {
        super( id, name, layout_method );

        const this_class = this;

        this.options.Length.val = (100).yard2meter();
        this.options.Width.val = (40).yard2meter();

        this.options["ScaleYard"].val = false;
        this.options["ScaleYard"].dontsave = true;
        this.options["Hash Markers"].configurable = false;

        this.options["End zone 1"].configurable = true;
        this.options["End zone 2"].configurable = true;

        this.options["ScaleEndZone"].configurable = false;
        this.options["ScaleEndZone"].dontsave = true;

        this.options["DrawFirstHash"].val = false;

        this.options["Wide lines"].configurable = true;
        this.options["Wide lines"].val = false;

        this.options["Wide middle"].val = false;

        this.options["width in middle"].val = (160).foot2meter() - ((53).foot2meter() + (4).inch2meter()) * 2;
        this.options["High School Teamboxes"].val = true;
        this.options["Safety zone distance"].val = (2).yard2meter();

        this.options["Team Area 1 width"].val = (10).foot2meter();
        this.options["Team Area 2 width"].val = (10).foot2meter();

        this.options["Crosses in middle"].val = true;

        this.options.GoalWidth.val = (23).foot2meter() + (4).inch2meter();

        this.options["number marking distance"].val = (7).yard2meter();


        this.options.sevenYardMarks = {
          name: "7 yard marks",
          val: false,
          type:"bool",
          configurable: true,
          adjustable: false,
          prev_sibling: "aaaaaaaaa"
        }

        this.options.tenYardPenaltyLines = {
          name: "10 yard penalty lines",
          val: false,
          type:"bool",
          configurable: true,
          adjustable: false,
          prev_sibling: "sevenYardMarks"
        }
  }
}