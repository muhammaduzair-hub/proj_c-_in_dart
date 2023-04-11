/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


class TotalStationLocation
{
  constructor( name, description = "", options = {}, forLocalSaving = null)
  {
    this.name = name;
    this.description = description;
    this.uuid = options.uuid ? options.uuid : guid();

    this._fixpoints = options._fixpoints ? options._fixpoints.map( f => new Vector3( f.x, f.y, f.z ) ) : [ ];
    this.fixpoint_labels = options.fixpoint_labels ? options.fixpoint_labels : [];
    this.fixplate = !!options.fixplate;

    this.is_positioned = options.is_positioned ? options.is_positioned : false;
    this._projection = options._projection ? options._projection : "NONE";
    // this.projection = "+proj=affine";
    // this.projection = "NONE";
    this.translation = options.translation ? new Vector(options.translation.x, options.translation.y) : new Vector(0,0);
    this.angle = options.angle ? options.angle : 0;
    this.layout = undefined;
    if(!forLocalSaving){
      this.create_layout();
    }
  }

  static import( stored )
  {
    const tsll = new TotalStationLocationLayout(0, stored.name);
    tsll.points = Object.keys(stored._fixpoints).map(f => new Vector3( f.x, f.y, f.z));
    tsll.options.Translation.val = stored.translation;
    tsll.options.Angle.val = stored.angle;
    tsll.draw();
    tsll.projection = stored.projection;
    stored.layout = tsll;
    const m = new TotalStationLocation( stored.name, stored.description, stored);
    return m;
  }

  static export (location){
    let fix = [];
    for(let i= 0; i < location._fixpoints.length; i++){
      fix.push(location._fixpoints[i]);
    }
    let options = {uuid: location.uuid, _fixpoints: fix, fixpoint_labels: location.fixpoint_labels, fixplate: location.fixplate, is_positioned: location.is_positioned, _projection: location._projection, translation: location.translation, angle: location.angle};
    let tmp = new TotalStationLocation(location.name, location.description, options, true);
    return tmp;
  }

  copy()
  {
    return TotalStationLocation.import( this );
  }

  set projection(v)
  {
    this._projection = v;
  }
  get projection()
  {
    if(projection_controller.isNone(this._projection))
      return this._projection;
    else
    {
      if(this._projection.indexOf('+tmr_ts') < 0)
        return `${this._projection} +tmr_ts=${this.uuid}`; 
      else
        return this._projection;
    }
  }

  get fixpoints()
  {
    // return this.fixplate && this.layout ? this.layout.transformed_fixpoints.map((f,i)=>new Vector3(f.x, f.y, this._fixpoints[i].z)) : this._fixpoints;
    return this._fixpoints;
  }
  set fixpoints(v)
  {
    this._fixpoints = v;
  }
  get positioned_fixpoints()
  {
    return this._fixpoints.map(p=>new Vector(p.x, p.y).rotate(this.angle).add(this.translation)).map((p,i)=>new Vector3(p.x, p.y, this._fixpoints[i].z));
  }

  fixpoint_label_delete( idx )
  {
    if(this.fixpoint_labels.length > idx )
      this.fixpoint_labels.splice(idx, 1);
  }

  create_layout()
  {
    this.layout = new TotalStationLocationLayout(0, this.name);

    // this.layout = new CircleJob( 0, "totalstation", "free_hand" );
    this.layout.points = Array.from(this._fixpoints);
    // this.layout.projection = "+proj=affine";
    this.layout.options.Translation.val = this.translation;
    this.layout.options.Angle.val = this.angle;
    this.layout.draw();
    this.layout.projection = this.projection;
    // this.layout.projection = "+proj=utm +zone=32";
    // this.layout.proj_alias = "UTM32";
  }
}
;