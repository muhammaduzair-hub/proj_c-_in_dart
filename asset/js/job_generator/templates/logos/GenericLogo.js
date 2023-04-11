class GenericLogo extends svg_parser
{
  static template_type = "Logo"; // Translateable

  static data = '';

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method);

    this.parseString(this.constructor.data);
    
    this.options.saveToCloud.val = true;
    this.options.saveToCloud.adjustable = false;
    this.options.drawTasks.dontsave = true;
    this.options.AutoSplit.configurable = false;
  }

}