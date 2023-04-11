/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/* global popup_screen_controller */

class PopButton
{
  constructor( text, callback, color_class, id = "")
  {
    this.text = text;
    this.callback = callback;
    this.color_class = color_class ? color_class : "dark";
    this.id = id;
  }
  create()
  {
    var b = document.createElement( 'button' );
    b.className = this.color_class;
    b.innerHTML = this.text;
    b.onclick = this.callback;

    if( this.id )
      b.id = this.id;

    return b;
    //var html = '<button class="' + this.color_class + '" onclick="popup_screen_controller.confirm_popup_ok_callback();" >' + this.text + '</button>';
  }
}

class PopInput {
  constructor(label, type, onchange_callback) {
    this.label = label;
    this.type = type;
    this.onchange_callback = onchange_callback;
  }
  create() {

    let table = document.createElement("table");
    table.style = "width: 100%;";
    let row = document.createElement("tr");
    let column1 = document.createElement("td");

    let lbl = document.createElement("p");
    lbl.innerText = this.label;
    lbl.className = "normal-lines pop-input";
    lbl.style = "font-size: 20px;";
    column1.appendChild(lbl);

    let column2 = document.createElement("td");
    let i = document.createElement("input");
    i.onchange = this.onchange_callback;
    i.type = this.type;
    i.style = "width: 100%;";
    column2.appendChild(i);
    
    row.appendChild(column1);
    row.appendChild(column2);
    table.appendChild(row);

    return table;
  }
}

class PopBody {
  constructor(elements, extra_margin_between) {
    this.elements = elements;
    this.margin = extra_margin_between;
  }
  create() {
    let b = document.createElement("div");
    let first = true;
    this.elements.forEach(e => {
      let d = document.createElement("div");
      if (!first && this.margin)
        d.style = "margin-top: " + this.margin;
      first = false;
      d.appendChild(e.create());

      b.appendChild(d);
      b.appendChild(document.createElement("br"));
    });
    return b;
  }
}

const pop_generator = {
  last_generated_id: "",
  /**
   * 
   * @param {Object} options 
   * @param {String} options.header
   * @param {String} options.body
   * @param {Array<PopButton>} options.buttons
   * @param {Function} options.outside_click_callback,
   * @param {String} options.popup_id - Name of popup (Default: "confirm_popup")
   * @param {String} options.extra_before_buttons_html
   * @param {String} options.extra_after_buttons_html
   * @param {Boolean} options.show_x
   * @param {Boolean} options.spinner
   */
  create_popup_with_options(options = {})
  {
    pop_generator.create_popup(
      options.header_text || options.header,
      options.body_text || options.body,
      options.buttons,
      options.outside_click_callback,
      options.popup_id,
      options.extra_before_buttons_html,
      options.extra_after_buttons_html,
      options.show_x,
      options.input_field,
      options.input_placeholder,
      options.spinner
    );
  },
  create_popup: function( header_text, body_text, buttons, outside_click_callback, popup_id = "generated_popup", extra_before_buttons_html, extra_after_buttons_html, show_x = true, spinner = false, input_field = false, input_placeholder)
  {

    if( popup_id[0] !== "#" )
      popup_id = "#" + popup_id;

    if( popup_screen_controller.open_id )
      popup_screen_controller.close();

    pop_generator.close( );

    if( !buttons )
      buttons = [ ];
    if( !outside_click_callback )
      outside_click_callback = null;

    var popup = document.createElement( 'div' );
    popup.id = popup_id.substring( 1 );
    popup.className = "popup-content";
    popup.style.pointerEvents = "auto";
    popup.style.textAlign = "center";

    if( outside_click_callback && show_x )
    {
      var x_element = document.createElement( 'img' );
      x_element.className = "close_button_popup_icon";
      x_element.src = "img/icons/Cross_1@2x.png";
      x_element.alt = "";
      x_element.onclick = outside_click_callback;
      popup.appendChild( x_element );
    }

    var header_element = document.createElement( 'h1' );
    pop_generator.last_created_header_element = header_element;
    header_element.innerHTML = header_text;
    popup.appendChild( header_element );

    if( body_text )
    {
      if (body_text instanceof PopBody) {
        popup.appendChild(body_text.create());
      } else {
        var body_element = document.createElement('p');
        body_element.innerHTML = body_text;
        body_element.id = "popup_body";
        popup.appendChild(body_element);
      }
    }

    if( spinner )
    {
      const spinner_element = document.createElement( 'div' );
      spinner_element.id = "spinner";
      spinner_element.className = "spinner";
      spinner_element.style.marginTop = 15;
      spinner_element.style.marginBottom = 15;
      let spinchild = document.createElement( 'div' );
      spinchild.className = "bounce1";
      spinner_element.appendChild( spinchild );
      spinchild = document.createElement( 'div' );
      spinchild.className = "bounce2";
      spinner_element.appendChild( spinchild );
      spinchild = document.createElement( 'div' );
      spinchild.className = "bounce3";
      spinner_element.appendChild( spinchild );
      popup.appendChild( spinner_element );
    }

    if( input_field ){
      const input_element = document.createElement( 'input');
      input_element.id = "popup_input_field";
      input_element.className = "popup_input_field";
      input_element.placeholder = input_placeholder;
      input_element.style.width = 300;
      input_element.style.marginTop = 15;
      input_element.style.marginBottom = 15;
      popup.appendChild(input_element);
    }

    if( extra_before_buttons_html )
    {
      const extra_before_buttons = document.createElement( 'div' );
      extra_before_buttons.innerHTML = extra_before_buttons_html;
      popup.appendChild( extra_before_buttons );
    }

    if( buttons.length > 0 )
    {
      var buttons_element = document.createElement( 'nav' );
      buttons.forEach( function( button )
      {
        buttons_element.appendChild( button.create() );
      } );
      popup.appendChild( buttons_element );
    }

    if( extra_after_buttons_html )
    {
      const extra_after_buttons = document.createElement( 'div' );
      extra_after_buttons.innerHTML = extra_after_buttons_html;
      popup.appendChild( extra_after_buttons );
    }

    $( "#popup-sizer" ).append( popup );
    $( "#popup-background" ).click( outside_click_callback );

    $( "#popup-background" ).removeClass( "gone" );
    $( ".popup-holder" ).removeClass( "gone" );

    popup_screen_controller.open_id = popup_id;
    pop_generator.last_generated_id = popup_id;

    return popup;
  },
  last_created_header_element: false,
  close: function( )
  {
    while( $( pop_generator.last_generated_id ).remove().length )
    {
    }

    $( "#popup-background" ).unbind( "click" );
    $( "#popup-background" ).addClass( "gone" );
    $( ".popup-holder" ).addClass( "gone" );
  }
};
