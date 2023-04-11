/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

class TryTagRugby extends square_pitch
{
  static template_type = "Try Tag Rugby";
  static template_title = "Standard";
  static template_id = "try_tag_rugby";
  static template_image = "img/templates/trytagrugby.png";
  constructor( id, name, layout_method )
  {
    super( id, name, layout_method );
    this.options.Length.val = 60.0;
    this.options.Width.val = 45.0;
    this.options ["Left goal pole"].configurable = false;
    this.options ["Right goal pole"].configurable = false;
    
  }

  draw()
  {

    delete this.calculated_drawing_points;
    this.tasks = [ ];
    this.start_locations = [ ];

    var p = this.drawing_points;
    // Corners
    var c1 = p[0];
    var c2 = p[3];
    var c3 = p[4];
    var c4 = p[7];
    
    var g1 = new Line(c1,c4).unit_vector;
    var g2 = new Line(c2,c3).unit_vector;
    var g3 = new Line(c1,c2).unit_vector;
    var g4 = new Line(c4,c3).unit_vector;
    
    var m10_1 = c1.add(g1.multiply(10));
    var m10_2 = c2.add(g2.multiply(10));
    
    var m20_1 = c1.add(g1.multiply(20));
    var m20_2 = c2.add(g2.multiply(20));
    
    var mid = new Line(c1,c4).middle;
    var mid1 = new Line(c2,c3).middle;
    
    var m20_3 = c4.subtract(g1.multiply(20));
    var m20_4 = c3.subtract(g1.multiply(20));
    
    var m10_3 = c4.subtract(g1.multiply(10));
    var m10_4 = c3.subtract(g1.multiply(10));
    
    var hash10_1 = c1.add(g3.multiply(10));
    var hash10_2 = hash10_1.add(g1.multiply(7.5));
    var hash10_3 = hash10_2.add(g1.multiply(5));
    
    var hash10_4 = c2.subtract(g3.multiply(10));
    var hash10_5 = hash10_4.add(g1.multiply(7.5));
    var hash10_6 = hash10_5.add(g1.multiply(5));
    
    var hash20_1 = c1.add(g3.multiply(10));
    var hash20_2 = hash20_1.add(g1.multiply(17.5));
    var hash20_3 = hash20_2.add(g1.multiply(5));
    
    var hash20_4 = c2.subtract(g3.multiply(10));
    var hash20_5 = hash20_4.add(g1.multiply(17.5));
    var hash20_6 = hash20_5.add(g1.multiply(5));
    
    var hashMid = mid.add(g3.multiply(10));
    var hashMid1 = hashMid.add(g1.multiply(2.5));
    var hashMid2 = hashMid.subtract(g1.multiply(2.5));
    
    var hashMid3 = mid1.subtract(g3.multiply(10));
    var hashMid4 = hashMid3.add(g2.multiply(2.5));
    var hashMid5 = hashMid3.subtract(g2.multiply(2.5));
    
    var hash20_7 = c4.add(g4.multiply(10));
    var hash20_8 = hash20_7.subtract(g1.multiply(17.5));
    var hash20_9 = hash20_8.subtract(g1.multiply(5));
    
    var hash20_10 = c3.subtract(g3.multiply(10));
    var hash20_11 = hash20_10.subtract(g1.multiply(17.5));
    var hash20_12 = hash20_11.subtract(g1.multiply(5));
    
    var hash10_7 = c4.add(g4.multiply(10));
    var hash10_8 = hash10_7.subtract(g1.multiply(7.5));
    var hash10_9 = hash10_8.subtract(g1.multiply(5));
  
    var hash10_10 = c3.subtract(g4.multiply(10));
    var hash10_11 = hash10_10.subtract(g1.multiply(7.5));
    var hash10_12 = hash10_11.subtract(g1.multiply(5));
    
    var dash1 = c1.subtract(g1.multiply(5));
    var dash2 = c2.subtract(g2.multiply(5));
    var dash3 = c3.add(g2.multiply(5));
    var dash4 = c4.add(g1.multiply(5));
    
    
    var dash_length = 0.5; 
    var dash_space = 0.5; 
    
    
    
    
    
    
    this.tasks.push( new LineTask( this.tasks.length, [dash1, c1], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [c1,c4 ], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [c4,dash4], false, true ) );    
    this.tasks.push( new LineTask( this.tasks.length, [c4, c3], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [dash3, c3], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [c3, c2], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [c2,dash2], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [c2, c1], false, true ) );
    
    this.tasks.push( new LineTask( this.tasks.length, [m10_1, m10_2], false, true ) );    
    this.tasks.push( new LineTask( this.tasks.length, [m20_2 ,m20_1], false, true ) );    
    this.tasks.push( new LineTask( this.tasks.length, [mid,mid1], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [m20_4, m20_3], false, true ) );    
    this.tasks.push( new LineTask( this.tasks.length, [m10_3, m10_4], false, true ) );  
    
    
     for( var i = 1; i <= 13; i++ )
    {
      if(i=== 3 || i=== 6 || i=== 8 || i=== 10 || i=== 12){}
      else{

      this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_length", dash_length ) );
      this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "dashed_space", dash_space ) );
      this.tasks[this.tasks.length - i].task_options.push( new BoolRobotAction( "navigate_tool", false ) );
      this.tasks[this.tasks.length - i].task_options.push( new BoolRobotAction( "pathshift_tool", false ) );

      this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "lineat_begin_length", 0 ) );
      this.tasks[this.tasks.length - i].task_options.push( new FloatRobotAction( "lineat_end_length", 0 ) );
      this.tasks[this.tasks.length - i].task_options.push( new IntRobotAction( "dashed_align", 1 ) );
    }
    }
    this.tasks.push( new LineTask( this.tasks.length, [hash10_11,hash10_12], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [hash20_11,hash20_12], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [hashMid4,hashMid5], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [hash20_6,hash20_5], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [hash10_6,hash10_5], false, true ) );
       
    this.tasks.push( new LineTask( this.tasks.length, [hash10_2,hash10_3], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [hash20_2,hash20_3], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [hashMid2,hashMid1], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [hash20_9,hash20_8], false, true ) );
    this.tasks.push( new LineTask( this.tasks.length, [hash10_9,hash10_8], false, true ) );
    
    
    this.refresh_bb();
    this.refresh_handles();
    this.refresh_snapping_lines();
    
  }
}


