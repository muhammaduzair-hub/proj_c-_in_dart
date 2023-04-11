const copy_pitch_screen_controller = {
  space_between: undefined,
  first: false,
  is_cancel_able: true,
  is_offset: false,
  max_offset: 500,
  _isOpen: null,
  set isOpen(v) {
    copy_pitch_screen_controller._isOpen = v;
    settings_screeen_controller.updateSettingsMenuButton();
  },
  get isOpen() {
    return copy_pitch_screen_controller._isOpen;
  },
  change_dist: function()
  {
    if( !copy_pitch_screen_controller.is_offset )
      var val = $( "#copy-track #copy_dist" ).val();
    else
      var val = $( "#offset-track #offset_dist" ).val();

    if( val === "" )
      return;

    var new_dist = parseFloat( val ).unit2meter();

    if(copy_pitch_screen_controller.is_offset && new_dist > copy_pitch_screen_controller.max_offset)
    {
      $( "#offset-track #offset_dist" ).val( copy_pitch_screen_controller.max_offset.meter2unit() );
      copy_pitch_screen_controller.change_dist();
      return;
    }

    copy_pitch_screen_controller.space_between = new_dist;

    copy_pitch_screen_controller.draw_copies();
  },
  change_number: function()
  {
    var new_number = parseFloat( $( "#copy-track #copy_number" ).val() );

    if( $( "#copy-track #copy_number" ).val() === "" )
    {
      return;
    }
    else if( !new_number || new_number < 1 )
    {
      $( "#copy-track #copy_number" ).val( 1 );
      return;
    }
    else if( new_number > 10 && login_screen_controller.user_level > user_level.DEVELOPER )
    {
      new_number = 10;
      $( "#copy-track #copy_number" ).val( new_number );
    }


    copy_pitch_screen_controller.number_of_copies = new_number;
    copy_pitch_screen_controller.draw_copies();
  },
  open: function( is_offset = false)
  {
    copy_pitch_screen_controller.isOpen = true;
    copy_pitch_screen_controller.is_offset = is_offset;

    map_controller.background.ignore_active = true;
    copy_pitch_screen_controller.first = true;

    if( copy_pitch_screen_controller.space_between === undefined )
    {
      if( copy_pitch_screen_controller.is_offset )
        copy_pitch_screen_controller.space_between = 1;
      else
        copy_pitch_screen_controller.space_between = 4;
    }

    var use_value = copy_pitch_screen_controller.space_between.meter2unit();
    if( !copy_pitch_screen_controller.is_offset )
    {
      $( "#copy-track #copy_dist" ).val( use_value.round( 3 ) );
    }
    else
    {
      $( "#offset-track #offset_dist" ).val( use_value.round( 3 ) );
      $( "#offset-track #offset_dist" ).attr( "max", copy_pitch_screen_controller.max_offset.meter2unit() );
    }

    copy_pitch_screen_controller.draw_copies();
    if( !copy_pitch_screen_controller.is_offset )
      $( "#copy-track #header" ).text( translate["Copy"] + " " + pitch_generator.active.name );
    else
      $( "#copy-track #header" ).text( translate["Offset"] + " " + pitch_generator.active.name );

    copy_pitch_screen_controller.is_cancel_able = false;
    setTimeout( function()
    {
      copy_pitch_screen_controller.is_cancel_able = true;
    }, 1000 );

  },
  clean_parameters: function()
  {
    if( !copy_pitch_screen_controller.is_cancel_able )
      return;

    copy_pitch_screen_controller.is_cancel_able = false;
    copy_pitch_screen_controller.isOpen = false;

    copy_pitch_screen_controller.chosen = -1;
    copy_pitch_screen_controller.remove_copies();
    copy_pitch_screen_controller.remove_handles();

    map_controller.background.ignore_active = false;

    pitch_generator.reselect();
  },
  copies: [ ],
  remove_copies: function()
  {
    copy_pitch_screen_controller.copies.forEach( pitchLayerCopy => pitchLayerCopy.remove() );
    copy_pitch_screen_controller.copies = [ ];
  },
  number_of_copies: 1,
  draw_copies: function()
  {
    copy_pitch_screen_controller.remove_copies();
    copy_pitch_screen_controller.remove_handles();

    if( !copy_pitch_screen_controller.is_offset )
      var directions = [ 0, 1, 2, 3 ];
    else
    {
      var directions = [ 0, 1 ];
      copy_pitch_screen_controller.number_of_compies = 1;
    }

    var color = Background.featureColor.COPY;
    if( copy_pitch_screen_controller.chosen >= 0 )
    {
      directions = [ copy_pitch_screen_controller.chosen ];
      color = Background.featureColor.ACTIVE;
    }

    if( directions.length === 1 )
    {
      pitch_generator.active.hidePitchLayer();
    }
    else
    {
      pitch_generator.active.showPitchLayer();
    }

    range( 1, copy_pitch_screen_controller.number_of_copies + 1 ).forEach( function( n )
    {
      directions.forEach( function( i )
      {

        let plus = 0;
        if(!copy_pitch_screen_controller.is_offset) {
          var job_copy = pitch_generator.active.make_side_copy( i, copy_pitch_screen_controller.space_between, n );
          plus = job_copy.side_copy_plus_value;
        }
        else {
          var job_copy = pitch_generator.active.make_offset_copy( i, copy_pitch_screen_controller.space_between );
        }

        job_copy.pitch_layer = pitch_generator.active.pitch_layer;
        
        var current_space = copy_pitch_screen_controller.space_between;
        var B_unit = (new Vector( 1, 0 )).rotate( pitch_generator.active.options.Angle.val + i * Math.PI / 2 + Math.PI );
        function move( new_pos, extra )
        {
          var new_pos_v = new Vector( new_pos[0], new_pos[1] );

          var A = job_copy.center.subtract( new_pos_v );
          var a1 = A.dot( B_unit );
          var new_space = current_space + a1 / n + extra;
          new_space = new_space.round( 2 );

          if( new_space < 0 )
            new_space = 0;

          var use_value = new_space.meter2unit();
          $( "#copy-track #copy_dist" ).val( use_value.round( 3 ) );

          copy_pitch_screen_controller.space_between = new_space;
          copy_pitch_screen_controller.draw_copies();
        }

        job_copy.id = i * -1 - 1;

        //job, color, clickable, dragable
        var aCopy = map_controller.background.draw_job( job_copy, color, true, function( new_pos_lnglat )
        {
          if( !projection_controller.isNone( job_copy.projection ) )
            var new_pos = ProjectorForward( job_copy.projection, new_pos_lnglat );
          else
            var new_pos = new_pos_lnglat;
          if( i > 1 )
            move( new_pos, plus / 2 );
          else
            move( new_pos, -plus / 2 );
        } );
        copy_pitch_screen_controller.copies.push( aCopy );

        // Handles
        if( !copy_pitch_screen_controller.is_offset )
        {
          var handle_angle = -pitch_generator.active.options.Angle.val;
          if( i % 2 )
            handle_angle += Math.PI / 2;
          var handle_marker = ol_markers.create_marker(
            "handle" + i,
            map_controller.background.projection_to_map( job_copy.projection, job_copy.center.toArray() ),
            "move_handle_onedirection",
            handle_angle,
            undefined,
            function( new_pos_lnglat )
            {
              if( !projection_controller.isNone( job_copy.projection ) )
                var new_pos = ProjectorForward( job_copy.projection, new_pos_lnglat );
              else
                var new_pos = new_pos_lnglat;
              move( new_pos, 0 );
            } );
        }
        else
        {
          var handle_angle = job_copy.offset_handle_angle;
          var handle_pos = job_copy.offset_handle_pos;
          var handle_marker = ol_markers.create_marker(
            "handle" + i,
            map_controller.background.projection_to_map( job_copy.projection, handle_pos.toArray() ),
            "move_handle_onedirection",
            handle_angle,
            undefined,
            function( new_pos_lnglat )
            {
              if( !projection_controller.isNone( job_copy.projection ) )
                var new_pos = ProjectorForward( job_copy.projection, new_pos_lnglat );
              else
                var new_pos = new_pos_lnglat;

              var new_space = new_pos.toVector().subtract( pitch_generator.active.offset_handle_pos ).length;
              new_space = new_space > copy_pitch_screen_controller.max_offset ? copy_pitch_screen_controller.max_offset : new_space;
              copy_pitch_screen_controller.space_between = new_space;
              var use_value = new_space.meter2unit();
              $( "#offset-track #offset_dist" ).val( use_value.round( 3 ) );

              copy_pitch_screen_controller.draw_copies();
            } );
        }

        handle_marker.layer.job = job_copy;

        copy_pitch_screen_controller.handles.push( handle_marker );
        map_controller.background.map.addLayer( handle_marker.layer );
        handle_marker.layer.setZIndex( 2000001 + i );

      } );
    } );

  },
  remove_handles: function()
  {
    copy_pitch_screen_controller.handles.forEach( function( handle )
    {
      map_controller.background.map.removeLayer( handle.layer );
    } );
    copy_pitch_screen_controller.handles = [ ];
  },
  handles: [ ],
  chosen: -1,
  choose_copy: function( i )
  {
    if( i >= 0 )
      return;

    copy_pitch_screen_controller.chosen = i = (i + 1) * -1;
    copy_pitch_screen_controller.draw_copies();
  },
  unchoose_copy: function()
  {
    copy_pitch_screen_controller.chosen = -1;
    copy_pitch_screen_controller.draw_copies();
  },

  start_save: function()
  {
    $( "#save_copy_popup #track_name" ).val( pitch_generator.active.name );
    if( copy_pitch_screen_controller.chosen >= 0 )
    {
      popup_screen_controller.open( "#save_copy_popup" );
    }
    else
    {
      popup_screen_controller.open( "#save_copy_error_popup" );
    }
  },
  cancel_save: function()
  {
    popup_screen_controller.close();
    popup_screen_controller.open( "#waiting_dialog" );
  },
  do_save: function()
  {
    var new_name = $( "#save_copy_popup #track_name" ).val().trim();

    if( !new_name )
    {
      $( "#save_copy_popup #track_name" ).addClass( "animated flash" );
      $( "#save_copy_popup #track_name" ).one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function()
      {
        $( "#save_copy_popup #track_name" ).removeClass( "animated flash" );
      } );
      return;
    }

    var first_job;
    var save_this = 1;

    function do_next( resp )
    {

      if( save_this > copy_pitch_screen_controller.number_of_copies )
      {
        console.log( "everything should be saved now" );
        event_controller.remove_callback( "create_db_job_done", do_next );
        copy_pitch_screen_controller.number_of_copies = 1;
        $("#waiting_dialog #pitch_numbers").text("")
        console.log( first_job );
        copy_pitch_screen_controller.done_saving( first_job );
        copy_pitch_screen_controller.copies.forEach(copy=>copy.remove());
      }
      else
      {

        console.log( "Saving copy", save_this );
        $("#waiting_dialog #pitch_numbers").text(` (${save_this}/${copy_pitch_screen_controller.number_of_copies})`);

        if( !copy_pitch_screen_controller.is_offset )
          var a_copy = pitch_generator.active.make_side_copy( copy_pitch_screen_controller.chosen, copy_pitch_screen_controller.space_between, save_this );
        else
          var a_copy = pitch_generator.active.make_offset_copy( copy_pitch_screen_controller.chosen, copy_pitch_screen_controller.space_between );

        a_copy.convert_to_free_hand();
        a_copy.name = new_name;
        a_copy.id = -1;
        pitch_generator.save_pitch( a_copy );

        if( !first_job )
          first_job = a_copy;
        save_this++;
      }
    }

    event_controller.add_callback( "create_db_job_done", do_next );

    if( copy_pitch_screen_controller.number_of_copies === 1 )
    {
      $("#waiting_dialog #pitch_numbers").text("")
    }
    else
    {
      $("#waiting_dialog #pitch_numbers").text(` (${save_this}/${copy_pitch_screen_controller.number_of_copies})`);
    }

    popup_screen_controller.open( "#waiting_dialog" );
    popup_screen_controller.removepopup = function()
    {};

    do_next();

  },
  done_saving: function( first_job )
  {
    pitch_generator.reset();

    // not cancel, but just close, (wrong choice of name)
    copy_pitch_screen_controller.clean_parameters();

    popup_screen_controller.close( "#waiting_dialog" );
  }

};