/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



/* global TotalStation, totalstation_controller, event_controller, robot_communication_settings_screen, message_controller, TotalStation_LN150, communication_controller, robot_controller */

const totalstation_location_controller = {
  illegal_name_characters: [ ],
  locations: {},
  active: undefined,
  initialized: false,
  init: function( reinitialize = false)
  {
    if( reinitialize )
      totalstation_location_controller.initialized = false;

    if( totalstation_location_controller.initialized )
      return;

    totalstation_location_controller.load();
    totalstation_location_controller.initialized = true;
  },
  location_exists( totalstation_name )
  {
    const custom = !!totalstation_location_controller.locations[totalstation_name];
    return custom;
  },
  get_all: function()
  {
    return Object.keys( totalstation_location_controller.locations ).map( k => totalstation_location_controller.locations[k] ).sort_objects( 'name' );
  },
  get_location_from_uuid(uuid)
  {
    if(!uuid)
      throw "Location UUID must be provided";

    return totalstation_location_controller.get_all().find(loc=>loc.uuid===uuid);
  },
  add: function( location )
  {
    totalstation_location_controller.edit( location, false, true );
  },
  edit: function( location, original, force_validate = false, force_edit = false)
  {
    const edit = function()
    {
      totalstation_location_controller.locations[location.name] = location;

      console.log(location.positioned_fixpoints,original.positioned_fixpoints);

      const translation = location.translation.subtract(original.translation);
      const angle = location.angle - original.angle;
      // Do transformation on all pitches with matching location
      modify_multiple_jobs( map_controller.background.jobs.filter(job=>job.projection.indexOf(location.uuid)>-1), function( job )
      {
        job.points = job.points.map( function( p )
        {
          return p.add( translation ).subtract(location.translation).rotate(angle).add(location.translation);
        } );
        job.options.Angle.val += angle;
      } )

      totalstation_location_controller.save();
      return;
    };
    const validate = function()
    {
      if( totalstation_location_controller.location_exists( location.name ) )
      {
        console.error( `TotalStation Location '${location.name}' already exists!` );
        throw `TotalStation Location name already exists!`;
      }

      totalstation_location_controller.illegal_name_characters.forEach( c => {
        if( location.name.indexOf( c ) !== -1 )
        {
          console.error( `Character '${c}' is illegal in name` );
          throw `Illegal character in name`;
        }
      } );

      edit();
    };

    if( force_edit )
      edit();
    else if( force_validate )
      validate();
    else if( original && original.name )
    {
      if( original.name === location.name )
        edit();
      else
      {
        totalstation_location_controller.remove( original.name );
        validate();
      }
    }
    else
      validate();

  },

  save_name: "totalstation_locations",
  save: function()
  {
    let tmp = {};
    let p = totalstation_location_controller.locations;
    Object.keys(p).forEach(k => {
      tmp[k] = TotalStationLocation.export(p[k]);
    });
    localStorage.setItem( totalstation_location_controller.save_name, JSON.stringify(tmp));
  },
  remove_saved: function()
  {
    localStorage.removeItem( totalstation_location_controller.save_name );
  },
  load: function()
  {
    const p = JSON.parse( localStorage.getItem( totalstation_location_controller.save_name ) );
    if( p !== null )
    {
      const tss = {};
      Object.keys( p ).forEach( k => {
        tss[k] = TotalStationLocation.import( p[k] );
      } );
      totalstation_location_controller.locations = tss;
      totalstation_location_controller.set_active( Object.keys( totalstation_location_controller.locations ).find( name => totalstation_location_controller.locations[name].active ) );
    }
    else
      totalstation_location_controller.remove_all();

//    totalstation_screen.update_totalstations();
  },
  remove: function( name )
  {
    if( totalstation_location_controller.locations[name] )
    {
      delete totalstation_location_controller.locations[name];
//      totalstation_screen.update_totalstations();
      totalstation_location_controller.save();
      return true;
    }
    else
      return false;
  },
  remove_all: function()
  {
    totalstation_location_controller.locations = {};
    totalstation_location_controller.remove_saved();
  },

  set_active( name )
  {
    if( !name )
    {
      totalstation_location_controller.active = undefined;
    }
    else if( totalstation_location_controller.location_exists( name ) )
    {
      totalstation_location_controller.active = totalstation_location_controller.locations[name];
      totalstation_location_controller.active.active = true;
    }
    else
      throw "Total station does not exist";
  },

  test: function()
  {
    totalstation_location_controller.edit( new TotalStationLocation( "Malling skole", "Skolen ligger i Malling" ), false, false, true );
    totalstation_location_controller.edit( new TotalStationLocation( "AGF Stadion", "Ceres stadion" ), false, false, true );
    totalstation_location_controller.edit( new TotalStationLocation( "Aarhus Tigers", "" ), false, false, true );

    totalstation_location_controller.locations["Malling skole"].fixpoints = [ new Vector3( 123.456789, 123.456789, 123.456789 ), new Vector3( 223.456789, 223.456789, 223.456789 ), new Vector3( 323.456789, 323.456789, 323.456789 ) ]

  }
};