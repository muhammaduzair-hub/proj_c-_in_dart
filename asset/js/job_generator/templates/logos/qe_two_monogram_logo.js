/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class QETwoMonogramLogo extends GenericLogo
{
  static template_type = "Symbol"; // Translateable
  static template_title = "QE2 Monogram"; // Translateable
  static template_id = "logo_qe_two_monogram_dev"; // no spaces
  static template_image = "img/logos/qe_two_monogram_black.png"; // no spaces

  static data = '<svg   style="enable-background:new 0 0 497.7 315.5;"   viewBox="0 0 497.7 315.5"   y="0px"   x="0px"   id="Layer_1"   version="1.1">   <defs   id="defs1745" /><style   id="style1739"   type="text/css">	.st0{fill:none;stroke:#1A1A1A;stroke-width:3.5511;}</style><path   d="M313.4,27.1v116.6  c39.8,3,94.8-3.2,96.1-57.3C410.6,36.6,368.7,23.4,313.4,27.1z M431.3,304.3c-20.2-16.6-46-90.6-76.9-121.5  c-12.2-12.3-25.4-20-41.1-19.1v112.8c0.7,13.8,17.5,13.2,24.3,13.3v14.3h-82.1v-14.4c6.8-0.1,23.6,0.5,24.3-13.3V35.4  c-0.7-13.8-17.5-13.2-24.3-13.3V7.8l94.4,1.6c63,0.4,92,39.7,91.8,77.6c-0.2,34.7-25.6,64.6-79.7,71.1c15.3,5.4,29.3,16.7,40.3,31.2  c27.5,36.5,42.4,103.9,91.4,100.6v14.4L431.3,304.3z M247.1,109.2c0.7-6.6,8.5-7.6,13.1-8.5v-8.4h-23.5h-23.5v8.4  c4.6,1,12.5,1.9,13.1,8.5v88.5c-0.7,6.6-8.5,7.6-13.1,8.5v8.4h23.5h23.5v-8.4c-4.6-1-12.5-1.9-13.1-8.5V109.2z M191.9,109.2  c0.7-6.6,8.5-7.6,13.1-8.5v-8.4h-23.5h-23.5v8.4c4.6,1,12.5,1.9,13.1,8.5v88.5c-0.7,6.6-8.5,7.6-13.1,8.5v8.4h23.5H205v-8.4  c-4.6-1-12.5-1.9-13.1-8.5V109.2z M29.9,35.4C29.2,21.6,12.5,22.2,5.6,22.1V7.8h171l22,36.8l-11.8,5.6  c-5.3-10.2-11.6-19.8-27.6-23.3h-92v115.5h51.1c9.3-1.9,15.1-8.7,14.8-25.6h11v67.6h-11c0.3-16.9-5.6-23.7-14.8-25.6H67.2v92.3  c-0.6,20.4,5.3,31,23.2,32.1h68.8c13.3-4.2,33.1-23.9,38.4-34.1l10.4,6.6L179,304.1H5.6v-14.3c6.8-0.1,23.6,0.5,24.3-13.3L29.9,35.4  z"   class="st0"   id="path3853_00000134935187549229373760000007552394147037627524_" /></svg>';

  constructor( id, name, layout_method )
  {
    super( id, name, layout_method);

    this.options.Width = {
      adjustable: true,
      name: "Width",
      _val: 5,
      get val()
      {
        return this._val;
      },
      set val( v )
      {
        if( v < 5 ) {
          v = 5;
        }
        this._val = v;
      },
      type: "float"
    };

  }
}
