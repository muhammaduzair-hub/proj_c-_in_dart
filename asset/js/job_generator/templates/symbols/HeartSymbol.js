
class HeartSymbol extends GenericLogo
{
  static template_type = "Symbol"; // Translateable
  static template_title = "Heart"; // Translateable
  static template_id = "symbol_heart"; // no spaces
  static template_image = "img/symbols/heart_symbol_black.png"; // no spaces

  static data = '<svg><path d="h200 a100,100 90 0,1 0,200a100,100 90 0,1 -200,0z" /><use transform="rotate(225,150,121)" /></svg>';

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );

    this.options.Width = {
      adjustable: true,
      name: "Width",
      _val: 15,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v < 5 )
          v = 5;
        this._val = v;
      },
      type: "float"
    };
  }

}
