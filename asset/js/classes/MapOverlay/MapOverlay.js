class MapOverlay
{
  constructor(map, onClickCallback)
  {
    this.content_timer = undefined;
    this.animation_timer = undefined;
    this.animation_time = 175; // milliseconds

    if(!map.whereToPut)
    {
      throw "Need an element to put dropdown";
    }
    else
    {
      this.map = map;
    }

    this.onClickCallback = onClickCallback;

    this._animation_off = "animated fadeOutUp";
    this._animation_on  = "animated fadeInDown";
    this._overlayClasses = "top center";
  }

  get visible()
  {
    return !$(this.element).hasClass("gone");
  }

  _generateOverlay()
  {
    const overlay = $.parseHTML(`<div class="menu_overlay overlay scrollbar_light scrollbar_y gone"  style="opacity: 0; -webkit-animation-duration: ${this.animation_time}ms;"></div>`);
    $(overlay).addClass(this._overlayClasses);
    return overlay;
  }

  createOverlay()
  {
    if(this.element)
    {
      return;
    }
    this.element = this._generateOverlay();
    $(this.map.whereToPut).parent().append(this.element);
  }

  _generateContent(elements)
  {
    const list = $.parseHTML('<div class="nav"></div>');
    elements.forEach( ( element ) =>
    {
      if( element )
      {
        var addclass = "click_through";
        if( this.visible )
          addclass = "";

        let txt = `<div class="item ${addclass}">`;
        if(element.metadata)
        {
          txt += '<span class="multifield_select_type">';
          txt += translate[element.metadata];
          txt += '</span>';
        }
        txt += '<span class="multifield_select_title"></span>';
        txt += '</div>';
        const item = $.parseHTML(txt);
        $(item).find(".multifield_select_title").text(element.name);
        $(item).on('click',()=>{this.onClickCallback(element.id); this.off();});
        $(list).append(item);
      }
    } );
    return list;
  }

  createContent(elements,newPitchListCallback)
  {
    this.content = this._generateContent(...arguments);
    this._update = () => this._generateContent(...arguments);
  }

  update()
  {
    this._update();
  }

  set content( html )
  {
    this.createOverlay();
    this._content = html;
    $( this.element ).html( this._content );
  }

  off()
  {
    if( this.visible )
    {
      $( "body" ).removeClass( 'fixed' );
      $(this.element).removeClass( this._animation_on );
      $(this.element).addClass( this._animation_off );
      clearTimeout( this.animation_timer );
      this.animation_timer = setTimeout( () =>
      {
        $(this.element).addClass( "gone" );
        $(this.element).remove();
        delete this.element;
      }, 250 );
      if(this.sortable)
      {
        this.sortable.destroy();
        delete this.sortable;
      }
    }

  }
  on()
  {

    if( !this.visible )
    {
      $( "body" ).addClass( 'fixed' );
      $(this.element).removeClass( "gone" );
      $(this.element).removeClass( this._animation_off );
      $(this.element).addClass( this._animation_on );
      clearTimeout( this.animation_timer );
      this.animation_timer = setTimeout( () =>
      {
        $(this.element).find( ".nav .item" ).removeClass( "click_through" );
      }, 250 );
    }
  }
  toggle()
  {
    if( this.visible )
      this.off();
    else
      this.on();
  }
}