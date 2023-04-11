class AdvancedEditBackground extends Background
{
  constructor( whereToPut, useLocalStorage, options = {} )
  {
    if(!whereToPut)
    {
      throw "Need a DOM element to put map";
    }
    options.whereToPut = whereToPut;
    options.useLocalStorage = useLocalStorage !== undefined ? useLocalStorage : false;
    options.show_decorations = false;
    super( options );
  }

  add_map_events()
  {
    this.map.on( 'click', this.map_click.bind(this) );
  }

  add_map_callbacks()
  {
    // Do nothing
  }
  
  map_click( evt )
  {
    if( !this.allow_map_click )
    {
      return;
    }

    const layers = [ ];
    const features = [ ];
    this.map.forEachFeatureAtPixel( evt.pixel,
      function( feature, layer )
      {
        layers.push( layer );
        features.push( feature );
      }, {
      hitTolerance: 12
    } );
    if( !features.length )
      return;

    const f = features.filter(f=>f.get("is_between")!==true)[0];
    const id = f.get( "id" );

    if(id === undefined) {
      return;
    }

    console.log('Task ' + id + ' modified');

    const current_modification = pitch_generator.active.options.taskModificationIds.val[id];
    const task = pitch_generator.active.get_task(id);
    const tasks = [];
    tasks.push(task);

    let k = id;
    let t = pitch_generator.active.get_task(k--);
    while(t.via) {
      tasks.push(t);
      t = pitch_generator.active.get_task(k--);
    }
    k = id;
    t = pitch_generator.active.get_task(k++);
    while(t.via) {
      tasks.push(t);
      t = pitch_generator.active.get_task(k++);
    }
    
    const next_modification = task.get_next_modification(current_modification ? current_modification : 0);
    if (next_modification == 0) {
      tasks.forEach(t=>delete pitch_generator.active.options.taskModificationIds.val[t.id]);
    }
    else {
      tasks.forEach(t=>pitch_generator.active.options.taskModificationIds.val[t.id]=next_modification);
    }

    advance_edit_screen.update_map( );
    edit_pitch_screen_controller.draw_pitch( );
  }
}