/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
const ALL_TEMPLATES = [
// old ones (Backwards compatability)
//dbu_soccer_11_man_pitch,
//dbu_soccer_8_man_pitch,
//dbu_soccer_5_man_pitch,
//dbu_soccer_3_man_pitch,
//LineJob,

// new ones
//CALIBRATION
  SamsCorner,

//FILE FORMATS
  csv_parser,
  dxf_parser,
  geo_parser,
  landxml_parser,
  svg_parser,
// soccer
  dbu_soccer_11_man_pitch,
  dbu_soccer_9_man,
  dbu_soccer_8_man_pitch,
  dbu_soccer_5_man_pitch,
  dbu_soccer_3_man_pitch,
  soccer_junior,
  soccer_technical_field,

  fa_soccer_9_man_pitch,
  fa_soccer_7_man_pitch,
  fa_soccer_5_man_pitch,

  fiveAside,

  de_soccer_9_and_7_man_pitch,

  ch_soccer_11_man_pitch,
  ch_soccer_9_man_pitch,
  ch_soccer_7_man_pitch,
  ch_soccer_5_man_pitch,

  us_soccer_11_man_pitch,
  us_soccer_9_man_pitch,
  us_soccer_7_man_pitch,
  us_soccer_4_man_pitch,

  se_soccer_3_man_pitch,
  se_soccer_5_man_pitch,
  se_soccer_7_man_10_11_year_pitch,
  se_soccer_7_man_12_year_pitch,
  se_soccer_9_man_13_year_pitch,
  se_soccer_9_man_14_year_pitch,
  se_soccer_11_man_pitch,
  
  be_expoline_soccer,

  CnSoccer8Man,

  custom_soccer,
  CnSoccer3Man,
  CnSoccer5Man,
  CnSoccer11Man,

  nz_4_6_year,
  nz_7_8_year,
  nz_9_10_year,
  nz_11_12_year,
  nz_13_14_year,

  Futsal,

  GaelicFootball,

//american_football_college; // old template i,
//american_football_college,
  american_football_college,
  us_american_football_college,
  eu_american_football_high_school,
  us_american_football_high_school,
  us_american_football_professional,
  HighSchoolFootball9v9,
  test_american_football_college,

  // New American football using new base (__AmericanFootball)
  AmericanFootball6v6USV2,
  AmericanFootball8v8USV2,
  AmericanFootballHighSchool9v9USV2,
  AmericanFootballCollegeEUV2,
  AmericanFootballCustomV2,
  AmericanFootballCollegeUSV2,
  AmericanFootballHighSchoolUSV2,
  AmericanFootballHighSchoolEUV2,
  AmericanFootballProfessionalUSV2,
  AmericanFootballTraining,
  
  AustralianFootball,
  
  Floorball,

  TouchFootball,

  TouchFootballAU,
  TouchRugbyUK,
  TouchFootballNZ,
  TouchRugbyNZ,

// Tennis
  tennis_pitch,
  Soccer_Tennis,
  touch_tennis_pitch,
  Pickle_Ball,

  Korfball,

// Geometry
  Geometry_Rectangle,
  Geometry_Triangle,
  PointJob,
  LineJob,
  CircleJob,
  EllipsisJob,
  DashedJob,

// Test jobs
  GoalJob,
  Ladder,
  Calibrate,
  WheelsTest,
  PositionDelayCalibration,
  yCalibrate,

// Handball
  Handball,

// Polo
  Polo,


// Netball
  Netball,

// Rugby
  RugbyUnion,
  RugbyLeague,
  RugbyYouth,
  Rippa_Rugby,
  Touch_and_Tag_Rugby,


// Lacrosse
  UsLacrossMen,
  UsLacrossWomen,
  UsLacrossUnified,
  WorldLacrosse,
  SmallLacrosseUnified,
  YouthLacrosse,
  CustomLacrosse,
  CustomLacrosseMen,
  CustomLacrosseUnified,
  CustomLacrosseWomen,
    
// Athletics
  Athletics200mRunningTrack,
  Athletics300mRunningTrack,
  Athletics400mRunningTrack,
  AthleticsDiscus,
  AthleticsHammer,
  AthleticsJavelin,
  AthleticsShotput,
  AthleticsRounders,
  AthleticsSprint,
  CustomRunningTrack,

//AthleticsFieldEvents,


// Ultimate
  Ultimate,
  CH_Ultimate,

// Hockey
  FieldHockey,
  US_FieldHockey,
// Bandy
  Bandy,
  KnatteBandy,
  Bandy_9v9,
// Quidditch
  Quidditch,
  US_Quidditch,

// Sureveyor templates
//ParkingLot,

// Softball
  Softball,
  Softball_US,
  Softball_NZ,
  Softball_UK,
  TeeBall,
// Baseball
  Baseball,
  Baseball_US,
  WelshBaseballLadies,
  WelshBaseballMen,

// Bolton Rounders
  BoltonRounders,

// Sureveyor templates
  ParkingLot,
  Slalom,

// Fistball
  FistballU21,
  FistballU14,
  FistballU12,
  FistballU10,

// Softball
  Kickball,

// Five a side
//Five_a_side,

// Volleyball
  Volleyball,

//Try Tag Rugby
  TryTagRugby,

// Basketball
  Basketball,

// Stoolball
  Stoolball,

//OmegaBall
  OmegaBall,

// Flag football
  Flag_football,
  Flag_Youth_US,
  German_Flag_Football,
  SE_Flag_Football,
  FlagfootballDK,

//Cricket
  Cricket,
  Cricket_Old,

// Surveyor templates
  ParkingLot,
  Coverage,
  SocialDistanceCoverage,
  Text,
  Runway_Designation_Numerals_FAA,
  Runway_Designation_Numerals_ICAO,
  Runway_Threshold_Stripes,
  Displaced_Threshold_Markings,

  // Grids
  IlluminationTestGrid,
  GridPointsOnACircle,
  GridPotholeDocumentation,

  // Logos
  NhsLogo,
  JuventusLogo,
  BiggaLogo,
  MarvinRidgeLogo,
  HusqvarnaLogo,
  AutmowLogo,
  UnionFlagLogo,
  SportschuleHennefLogo,
  MittelrheinLogo,
  QETwoMonogramLogo,
  FynTourLogo,
  PelotoniaLogo,
  USCLogo,
  FaribaultFalconLogo,
  HTHLogo,
  BDUSDLogo,
  RecWellLogo,
  StirlingUni_Logo,
  CrownMonogramLogo,
  
  // EVENTS
  // Generic
  CancerRibbonLogo,
  PoppyLogo,
  HolocaustFlameLogo,
  BicycleLogo,
  FivePointedStarLogo,
  RibbonLogo,
  Fireworks,
  // Halloween
  HalloweenLogo_01,
  HalloweenLogo_02,
  // Christmas
  SantaClaus,
  Christmaslogo,
  Christmas_logo_01,
  christmas_logo_02,
  christmas_logo_03,
  // Easter
  EasterBunny,
  EasterChick,
  EasterEgg1,
  EasterEgg2,
  EasterEgg3,
  
  // symbols
  HeartSymbol,

  // special
  SocialDistance,

  //Badminton
  Badminton,

  // Ki o Rahi
  KiORahi
];

let pt = {};

let pt_options = {
  "drive_around_goal": [ "custom_soccer", "dbu_soccer_11_man", "ch_soccer_11_man_pitch", "rugby_union", "rugby_league", "us_soccer_4_man_pitch",
    "us_soccer_7_man_pitch", "us_soccer_9_man_pitch", "us_soccer_11_man_pitch", "fa_soccer_9_man_pitch", "de_soccer_9_and_7_man_pitch" ],
  "two_way_drive": [ "eu_football_college", "us_football_college", "us_american_football_high_school", "eu_american_football_high_school" ],
  "mark_numbers": [ "eu_football_college", "us_football_college", "us_american_football_high_school", "eu_american_football_high_school" ],
  "enable_teko_font": [ "text" ], 
  "use_ifab_yards": [ "dbu_soccer_11_man" ]
};

let OLD_TEMPLATES_THAT_HAS_BEEN_RENMAED = {
  "american_football": "eu_football_college",
  "football_college": "eu_football_college",
  "test_line": "geometry_line",
  "soccer_3_man": "dbu_soccer_3_man",
  "soccer_5_man": "dbu_soccer_5_man",
  "soccer_8_man": "dbu_soccer_8_man",
  "soccer_11_man": "dbu_soccer_11_man",
  "us_american_football_professional": "us_american_football_professional_dev",
  "test_dashed": "geometry_dashed"
};

const FILE_TEMPLATE_TAGS = ["svg_parser", "csv_parser", "dxf_parser", "geo_parser", "landxml_parser"];
Object.freeze(FILE_TEMPLATE_TAGS);

function checkTemplate(template){
  /**
   * Checks basic structure of a template, throwing warnings if the template is missing vital components
   * @param {Object} template is the template to check
   * @return null;
   */
  let failedCheck = false;
  if (!template.template_type) {
    failedCheck = true;
    console.warn("Located template without type:", template.template_id);
  }

  if (!template.template_title) {
    failedCheck = true;
    console.warn("Located template without title:", template.template_id);
  }

  if (!template.template_id) {
    failedCheck = true;
    console.warn("Located template without id:", template.template_id);
  }

  if (!template.template_title && !template.template_title === "") {
    failedCheck = true;
    console.warn("Located template without title:", template.template_id);
  }

  if (!template.template_image) {
    failedCheck = true;
    console.warn("Located template without black image:", template.template_id);
  }
  
  const keys = Object.keys(template.layout_methods);
  if (!keys) {
    failedCheck = true;
    console.warn("Located template without layout_methods:", template.template_id);
  }
  let needsWhiteImage = false;
  keys.forEach((key)=>{
    if (template.layout_methods[key] > 0) {
      needsWhiteImage = true;
    }
  });

  if (failedCheck) {
    console.error(`Template ${template.template_id} failed check!`);
  }
};

$(()=>{
  var pitches = {};

  ALL_TEMPLATES.forEach((template)=>{
    pt[template.template_id] = template;

    if (!pitches[template.template_type]) {
        pitches[template.template_type] = [];
    }
    pitches[template.template_type].push(template.template_id);
  });

  pt["paint_10x_linemark_impact_with_delivery"] = NullJob; // TODO: Remove this line when featureshop has been made
  pt["paint_canister_tmr"] = NullJob; // TODO: Remove this line when featureshop has been made
  pt.list = Object.keys( pt );

  pt.pitches = pitches;
  pt.templates = [ "something_that_does_not_exist" ];
  pt.template_options = {};

  ALL_TEMPLATES.forEach((template)=>{
    checkTemplate(template);
  });
});
