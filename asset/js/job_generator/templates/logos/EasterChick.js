/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
class EasterChick  extends GenericLogo
{
  static template_type = "Symbol";
  static template_title = "Easter Chick"; // Translateable
  static template_id = "easter_chick"; // no spaces
  static template_image = "img/logos/EasterChick.png"; // no spaces
  constructor(id, name, layout_method)
  {
    super( id, name, layout_method);
    this.options.Width = {
      adjustable: true,
      name: "Width",
      _val: 15,
      get val() {
        return this._val;
      },
      set val( v ) {
        if(v < 15){
        this._val = 15;
        }else{
        this._val = v;
        }
      },
      type: "float"
    };
  }

  static data = '<?xml version="1.0" encoding="UTF-8"?><!-- 2022-12-20 15:39:13 Generated by QCAD 3.27.6 SVG Exporter --><svg width="183.6173mm" height="206.2811mm" viewBox="11.2889 34.6873 183.6173 206.2811" version="1.1" xmlns="http://www.w3.org/2000/svg" style="stroke-linecap:round;stroke-linejoin:round;fill:none">    <g transform="scale(1,-1)">        <!-- Arc -->        <path d="M31.0903,-237.8181 A64.4179,64.4179 0 0,1 11.2889,-212.1923"/>        <!-- Arc -->        <path d="M11.2889,-212.1923 A66.4642,66.4642 0 0,0 37.2251,-227.1571"/>        <!-- Arc -->        <path d="M37.2251,-227.1571 A68.0227,68.0227 0 0,1 19.9496,-194.3664"/>        <!-- Arc -->        <path d="M19.9496,-194.3664 A95.6276,95.6276 0 0,0 56.9983,-232.1243"/>        <!-- Arc -->        <path d="M56.9983,-232.1243 A64.628,64.628 0 0,1 53,-208"/>        <!-- Arc -->        <path d="M53,-208 A39.1198,39.1198 0 0,0 66.9396,-229.3267"/>        <!-- Arc -->        <path d="M66.9396,-229.3267 A28.0237,28.0237 0 0,0 77,-212"/>        <!-- Arc -->        <path d="M77,-212 A34.7722,34.7722 0 0,1 79.5831,-240.9684"/>        <!-- Arc -->        <path d="M77.7093,-237.1337 A90.4177,90.4177 0 0,1 128.6458,-236.5723"/>        <!-- Arc -->        <path d="M126.6119,-240.7991 A35.6571,35.6571 0 0,1 129.4024,-212.0053"/>        <!-- Arc -->        <path d="M129.4024,-212.0053 A28.6839,28.6839 0 0,0 139.2767,-228.7552"/>        <!-- Arc -->        <path d="M139.2767,-228.7552 A39.6319,39.6319 0 0,0 153,-208"/>        <!-- Arc -->        <path d="M153,-208 A68.5342,68.5342 0 0,1 149.1968,-231.9549"/>        <!-- Arc -->        <path d="M149.1968,-231.9549 A95.5969,95.5969 0 0,0 186.2455,-194.1971"/>        <!-- Arc -->        <path d="M186.2455,-194.1971 A152.9785,152.9785 0 0,1 168.97,-226.9878"/>        <!-- Arc -->        <path d="M168.97,-226.9878 A66.4643,66.4643 0 0,0 194.9062,-212.023"/>        <!-- Arc -->        <path d="M194.9062,-212.023 A64.3219,64.3219 0 0,1 175.1048,-237.6523"/>        <!-- Arc -->        <path d="M130.7077,-229.302 A303.0368,303.0368 0 0,0 75.4839,-229.4749"/>        <!-- Arc -->        <path d="M44.2524,-213.9633 A74.2387,74.2387 0 0,1 55.4657,-216.3997"/>        <!-- Arc -->        <path d="M61.7255,-217.4522 A279.9282,279.9282 0 0,1 71.0071,-218.6869"/>        <!-- Arc -->        <path d="M75.2769,-219.1453 A274.4521,274.4521 0 0,1 130.9511,-218.9692"/>        <!-- Arc -->        <path d="M135.1386,-218.4471 A273.9331,273.9331 0 0,1 144.5683,-217.1206"/>        <!-- Arc -->        <path d="M150.7105,-216.1809 A1869.7535,1869.7535 0 0,0 161.9568,-213.7763"/>        <!-- Arc -->        <path d="M165.9542,-204.661 A322.2895,322.2895 0 0,0 40.6294,-204.5794"/>        <!-- Arc -->        <path d="M44.2524,-213.9633 A101.2144,101.2144 0 0,0 36.449,-154.3438"/>        <!-- Line -->        <path d="M36.449,-154.3438 L49,-167 "/>        <!-- Line -->        <path d="M49,-167 L55,-157 "/>        <!-- Line -->        <path d="M55,-157 L62,-167 "/>        <!-- Line -->        <path d="M62,-167 L71,-150 "/>        <!-- Line -->        <path d="M71,-150 L79.9747,-168.0034 "/>        <!-- Line -->        <path d="M79.9747,-168.0034 L87,-158 "/>        <!-- Line -->        <path d="M87,-158 L94,-168 "/>        <!-- Line -->        <path d="M94,-168 L103,-147 "/>        <!-- Line -->        <path d="M103,-147 L113,-167 "/>        <!-- Line -->        <path d="M113,-167 L119,-157 "/>        <!-- Line -->        <path d="M119,-157 L126,-165 "/>        <!-- Line -->        <path d="M126,-165 L135,-151 "/>        <!-- Line -->        <path d="M135,-151 L144,-167 "/>        <!-- Line -->        <path d="M144,-167 L153,-157 "/>        <!-- Line -->        <path d="M153,-157 L158,-166 "/>        <!-- Line -->        <path d="M158,-166 L169.9578,-155.4445 "/>        <!-- Arc -->        <path d="M169.9578,-155.4445 A96.8384,96.8384 0 0,0 161.9568,-213.7763"/>        <!-- Circle -->        <circle cx="152.8656666666666" cy="-195.4706388888889" r="3.919361111111114"/>        <!-- Circle -->        <circle cx="127.8113888888889" cy="-198.5186388888889" r="3.919361111111114"/>        <!-- Circle -->        <circle cx="103.02875" cy="-200.0285277777778" r="3.919361111111114"/>        <!-- Circle -->        <circle cx="77.978" cy="-198.5186388888889" r="3.919361111111116"/>        <!-- Circle -->        <circle cx="53.21652777777777" cy="-195.7810833333333" r="3.919361111111116"/>        <!-- Arc -->        <path d="M35.5278,-182.2668 A342.2316,342.2316 0 0,1 170.7938,-182.4002"/>        <!-- Arc -->        <path d="M171.3683,-173.6206 A370.2517,370.2517 0 0,0 34.9872,-173.7149"/>        <!-- Arc -->        <path d="M41.3032,-152.6293 A24.6262,24.6262 0 0,0 22.0874,-145.8771"/>        <!-- Line -->        <path d="M22.0874,-145.8771 L34.1136,-144.0286 "/>        <!-- Arc -->        <path d="M34.1136,-144.0286 A26.0531,26.0531 0 0,0 15.7658,-126.5349"/>        <!-- Line -->        <path d="M15.7658,-126.5349 L26.3066,-128.0936 "/>        <!-- Arc -->        <path d="M26.3066,-128.0936 A27.6884,27.6884 0 0,0 23.7278,-92.3043"/>        <!-- Arc -->        <path d="M23.7278,-92.3043 A57.7832,57.7832 0 0,1 45.9811,-124.8516"/>        <!-- Arc -->        <path d="M41.2001,-159.1347 A125.4886,125.4886 0 0,0 62,-90"/>        <!-- Circle -->        <circle cx="71.8008611111111" cy="-118.7626388888889" r="6.1771388888888765"/>        <!-- Arc -->        <path d="M88.1309,-132.2529 A26.1605,26.1605 0 0,0 117.9513,-132.0941"/>        <!-- Line -->        <path d="M117.9513,-132.0941 L103.197,-141.6942 "/>        <!-- Arc -->        <path d="M103.197,-141.6942 A115.98,115.98 0 0,1 88.1309,-132.2529"/>        <!-- Circle -->        <circle cx="134.1896111111111" cy="-118.7626388888889" r="6.177138888888891"/>        <!-- Arc -->        <path d="M159.6734,-124.9168 A56.8673,56.8673 0 0,1 182.2521,-92.2761"/>        <!-- Arc -->        <path d="M182.2521,-92.2761 A27.6831,27.6831 0 0,0 179.6697,-128.0654"/>        <!-- Line -->        <path d="M179.6697,-128.0654 L190.2143,-126.5026 "/>        <!-- Arc -->        <path d="M190.2143,-126.5026 A26.0476,26.0476 0 0,0 171.8628,-143.9968"/>        <!-- Line -->        <path d="M171.8628,-143.9968 L183.8995,-145.8454 "/>        <!-- Arc -->        <path d="M183.8995,-145.8454 A24.0134,24.0134 0 0,0 164.8319,-152.6114"/>        <!-- Arc -->        <path d="M165.2384,-159.6104 A139.8737,139.8737 0 0,1 144,-90"/>        <!-- Line -->        <path d="M164,-106 L144,-90 "/>        <!-- Line -->        <path d="M144,-90 L138,-109 "/>        <!-- Line -->        <path d="M138,-109 L125,-91 "/>        <!-- Line -->        <path d="M125,-91 L115,-109 "/>        <!-- Line -->        <path d="M115,-109 L102.997,-90.8297 "/>        <!-- Line -->        <path d="M102.997,-90.8297 L92,-109 "/>        <!-- Line -->        <path d="M92,-109 L81.0719,-91.4823 "/>        <!-- Line -->        <path d="M81.0719,-91.4823 L67,-110 "/>        <!-- Line -->        <path d="M67,-110 L62,-90 "/>        <!-- Line -->        <path d="M43,-106 L62,-90 "/>        <!-- Arc -->        <path d="M43,-106 A61.3197,61.3197 0 1,0 164,-106"/>        <!-- Arc -->        <path d="M161.6679,-76.6007 A242.2286,242.2286 0 0,0 45.2379,-76.8854"/>        <!-- Arc -->        <path d="M49.3244,-67.2822 A232.1676,232.1676 0 0,1 157.545,-67.0374"/>        <!-- Arc -->        <path d="M151.3059,-57.6051 A231.9071,231.9071 0 0,0 55.4977,-57.8509"/>        <!-- Circle -->        <circle cx="76.61627777777777" cy="-52.65913888888889" r="3.919361111111115"/>        <!-- Circle -->        <circle cx="102.9723055555555" cy="-55.53074999999999" r="3.919361111111115"/>        <!-- Circle -->        <circle cx="128.9931944444444" cy="-52.01002777777777" r="3.919361111111115"/>        <!-- Arc -->        <path d="M133.7131,-42.6472 A118.9484,118.9484 0 0,0 73.5112,-42.5208"/>    </g></svg>';

}