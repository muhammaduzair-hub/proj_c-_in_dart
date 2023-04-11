/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class HalloweenLogo_02 extends GenericLogo
{
  static template_type = "Logo";
  static template_title = "Halloween 2"; // Translateable
  static template_id = "logo_halloween_logo_02"; // no spaces
  static template_image = "img/logos/HalloweenLogo_02_black.png"; // no spaces

  constructor(id, name, layout_method)
  {
    super( id, name, layout_method);
    this.options.Width = {
      adjustable: true,
      name: "Width",
      _val: 10,
      get val() {
        return this._val;
      },
      set val( v ) {
        if(v < 10){
        this._val = 10;
        }else{
        this._val = v;
        }
      },
      type: "float"
    };
    this.options.AutoSplit = {
      configurable: false,
      name: "Auto split",
      val: true,
      type: "bool"
    };
  }

  static data = '<?xml version="1.0" encoding="UTF-8"?><!-- 2022-10-10 14:47:30 Generated by QCAD 3.27.6 SVG Exporter --><svg width="305.8488mm" height="278.8698mm" viewBox="15.1088 43.1441 305.8488 278.8698" version="1.1" xmlns="http://www.w3.org/2000/svg" style="stroke-linecap:round;stroke-linejoin:round;fill:none">    <g transform="scale(1,-1)">        <!-- Arc -->        <path d="M143.9433,-52.5726 A823.4893,823.4893 0 0,1 154,-92"/>        <!-- Arc -->        <path d="M186.9,-90.2 A90.9701,90.9701 0 0,1 168.0264,-43.9156"/>        <!-- Arc -->        <path d="M168.0264,-43.9156 A22.3895,22.3895 0 0,1 143.9433,-52.5726"/>        <!-- Arc -->        <path d="M139,-98 A76.9134,76.9134 0 0,1 51,-112"/>        <!-- Arc -->        <path d="M51,-112 A132.4194,132.4194 0 0,1 70,-310"/>        <!-- Arc -->        <path d="M70,-310 A73.7507,73.7507 0 0,1 138.7828,-313.055"/>        <!-- Arc -->        <path d="M138.7828,-313.055 A75.473,75.473 0 0,1 200.4483,-317.3942"/>        <!-- Arc -->        <path d="M200.4483,-317.3942 A81.8742,81.8742 0 0,1 282,-301"/>        <!-- Arc -->        <path d="M282,-301 A134.9082,134.9082 0 0,1 268,-99"/>        <!-- Arc -->        <path d="M268,-99 A68.8312,68.8312 0 0,1 200.9,-94"/>        <!-- Arc -->        <path d="M200.9,-94 A76.3239,76.3239 0 0,1 139,-98"/>        <!-- Line -->        <path d="M94,-137 L150,-150 "/>        <!-- Line -->        <path d="M190,-150 L248.1351,-133.9799 "/>        <!-- Line -->        <path d="M248.1351,-133.9799 L220,-200 "/>        <!-- Line -->        <path d="M220,-200 L190,-150 "/>        <!-- Line -->        <path d="M186.0903,-194.9097 L150.1422,-194.9097 "/>        <!-- Line -->        <path d="M150.1422,-194.9097 L169.0158,-215.9 "/>        <!-- Line -->        <path d="M169.0158,-215.9 L186.0903,-194.9097 "/>        <!-- Line -->        <path d="M150,-150 L120,-200 "/>        <!-- Line -->        <path d="M120,-200 L94,-137 "/>        <!-- Line -->        <path d="M70.0264,-219.9922 L102.0939,-236.0083 "/>        <!-- Arc -->        <path d="M127.3881,-243.1697 A159.2302,159.2302 0 0,1 215,-243"/>        <!-- Line -->        <path d="M245.2511,-232.9744 L280,-220 "/>        <!-- Arc -->        <path d="M280,-220 A79.93,79.93 0 0,0 214.4889,-283.4569"/>        <!-- Line -->        <path d="M184,-290 L158,-290 "/>        <!-- Arc -->        <path d="M125.2361,-285.4678 A62.5286,62.5286 0 0,0 70.0264,-219.9922"/>        <!-- Line -->        <path d="M102.0939,-236.0083 L120,-260 "/>        <!-- Line -->        <path d="M140,-260 L158,-290 "/>        <!-- Line -->        <path d="M200,-260 L214.4889,-283.4569 "/>        <!-- Line -->        <path d="M230,-260 L215,-243 "/>        <!-- Line -->        <path d="M245.2511,-232.9744 L230,-260 "/>        <!-- Line -->        <path d="M200,-260 L184,-290 "/>        <!-- Line -->        <path d="M140,-260 L125.2361,-285.4678 "/>        <!-- Line -->        <path d="M120,-260 L127.3881,-243.1697 "/>    </g></svg>';
                 
}