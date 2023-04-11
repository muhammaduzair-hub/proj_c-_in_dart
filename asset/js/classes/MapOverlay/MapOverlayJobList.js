class MapOverlayJobList extends MapOverlay
{
  constructor(map)
  {
    super(map);

    this._animation_off = "animated fadeOutDown";
    this._animation_on  = "animated fadeInUp";
    this._overlayClasses = "bottom left multiselect_job_list persistent";
  }

  _generateContent(pitches, moveItemCallback)
  {
    this._items = pitches;
    const list = $.parseHTML('<div class="nav"></div>');
    const last_index = pitches.length - 1;
    this._items.forEach( ( pitch, idx ) =>
    {
      if( pitch )
      {
        var addclass = "click_through";
        if( this.visible )
          addclass = "";
        if(idx === last_index)
          addclass += "last-child";

        let txt = `<div class="item ${addclass}" pitch-id="${pitch.id}" >`;

        // Number part
        if(this.map.show_multiselect_line_number)
        {
          txt += `<div class="number"><p>${idx+1}</p></div>`;
        }

        txt += '<div class="content-wrap">'

        // Text part
        txt += '<div class="text">';
        txt += '<span class="multifield_select_type">';
        txt += translate[pitch.template_type];
        txt += ' ';
        txt += translate[pitch.template_title];
        txt += '</span>';
        txt += '<span class="multifield_select_title"></span>';
        txt += '</div>';

        // Reorder part
        if(this.map.show_multiselect_reorder_handle)
        {
          txt += '<span class="material-icons-outlined reorder-handle">reorder</span>';
        }

        txt += '</div>';

        txt += '</div>';

        const item = $.parseHTML(txt);
        $(item).find(".multifield_select_title").text(pitch.name);

        $(list).append(item);
      }
    } );

    // https://github.com/Shopify/draggable

    this.sortable = new Sortable.default(list, {
      draggable: '.item',
      handle: '.reorder-handle',
      classes: {
        'mirror': 'draggable--mirror'
      }
    });

    this.sortable.on('sortable:stop', (event) => {
      const pitch_id = parseInt($(event.dragEvent.source).attr("pitch-id"));
      moveItemCallback(pitch_id, event.newIndex - event.oldIndex);
      this.update();
    });

    this.sortable.on('sortable:sorted', (event) => {
      let i = 1;
      let lastElement;
      $(event.newContainer).find('.item').each((_,element)=>{
        $(element).removeClass('last-child');
        if($(element).hasClass('draggable--mirror') || $(element).hasClass('draggable--original'))
        {
          return;
        }
        else
        {
          lastElement = element;
        }
      })
      $(lastElement).addClass('last-child');
    });
    
    return list;
  }
}