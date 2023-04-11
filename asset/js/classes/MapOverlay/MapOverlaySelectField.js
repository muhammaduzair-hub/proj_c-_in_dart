class MapOverlaySelectField extends MapOverlay
{
    _generateContent(pitches)
    {
      const list = $.parseHTML('<div class="nav"></div>');
      pitches.forEach( ( pitch ) =>
      {
        if( pitch )
        {
          var addclass = "click_through";
          if( this.visible )
            addclass = "";
  
          let txt = `<div class="item ${addclass}">`;
          txt += '<span class="multifield_select_type">';
          txt += translate[pitch.template_type];
          txt += ' ';
          txt += translate[pitch.template_title];
          txt += '</span>';
          txt += '<span class="multifield_select_title"></span>';
          txt += '</div>';
          const item = $.parseHTML(txt);
          $(item).find(".multifield_select_title").text(pitch.name);
          $(item).on('click',()=>{this.map.select_from_popup(pitch.id)});
          $(list).append(item);
        }
      } );
      return list;
    }
}