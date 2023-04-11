import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:webview_flutter/webview_flutter.dart';


class UTM32 {
  List<Ends>? lEnds;

  UTM32({this.lEnds});

  UTM32.fromJson(Map<String, dynamic> json) {
    if (json['_ends'] != null) {
      lEnds = <Ends>[];
      json['_ends'].forEach((v) {
        lEnds!.add(new Ends.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    if (this.lEnds != null) {
      data['_ends'] = this.lEnds!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class Ends {
  double? x;
  double? y;

  Ends({this.x, this.y});

  Ends.fromJson(Map<String, dynamic> json) {
    x = json['x'];
    y = json['y'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['x'] = this.x;
    data['y'] = this.y;
    return data;
  }
}


class MapScreen extends StatefulWidget {
  final WebViewController controller; // Parameter from prev class

  MapScreen({required this.controller});
  @override
  _MapScreenState createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  static const LatLng initialLatLng = LatLng(37.7749, -122.4194);
  late GoogleMapController _mapController;
  LatLng new_center = LatLng(551026.50, 4180151.72);
  double new_center_lat = 551026.50;
  double new_center_lng = 4180151.72;

  Set<Marker> _markers = {};
  final Set<Polygon> _polygons = {};
  late LatLng _squareCenter;

  void _onMapCreated(GoogleMapController controller) {
    _mapController = controller;
    setState(() {
      _squareCenter = initialLatLng;
      _addMarker(_squareCenter);
    });
  }

  void _addMarker(LatLng latLng) {
    final marker = Marker(
      markerId: MarkerId(latLng.toString()),
      position: latLng,
      infoWindow: InfoWindow(
        title: 'Latitude: ${latLng.latitude}',
        snippet: 'Longitude: ${latLng.longitude}',
      ),
    );
    setState(() {
      _markers.add(marker);
    });
  }

  List<LatLng> _addSquare() {
    // Calculate the LatLngs for the square based on the center LatLng
    const double squareSize = 0.005;

    //send this co-ords to proj library cpp to get UTM32
    // new_center = convert_wgs_to_utm(initialLatLng);


    final double lat = _squareCenter.latitude;
    final double lng = _squareCenter.longitude;
    final LatLng squareTopLeft = LatLng(lat + squareSize, lng - squareSize);
    final LatLng squareTopRight = LatLng(lat + squareSize, lng + squareSize);
    final LatLng squareBottomRight = LatLng(lat - squareSize, lng + squareSize);
    final LatLng squareBottomLeft = LatLng(lat - squareSize, lng - squareSize);

    List<LatLng> squareLatLngs = [
      squareTopLeft,
      squareTopRight,
      squareBottomRight,
      squareBottomLeft,
      squareTopLeft,
    ];

    // Create a Polygon to draw the square on the map
    Polygon squarePolygon = Polygon(
      polygonId: const PolygonId('square'),
      points: squareLatLngs,
      strokeWidth: 2,
      strokeColor: Colors.red,
      fillColor: Colors.red.withOpacity(0.3),
    );

    setState(() {
      _polygons.add(squarePolygon);
    });

    _addMarker(squareTopLeft);
    _addMarker(squareTopRight);
    _addMarker(squareBottomRight);
    _addMarker(squareBottomLeft);

    return squareLatLngs;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Google Map')),
      body: GoogleMap(
        onMapCreated: _onMapCreated,
        polygons: _polygons,
        markers: _markers,
        initialCameraPosition: const CameraPosition(target: initialLatLng, zoom: 15.0),
      ),
      floatingActionButton: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          ElevatedButton(
            onPressed: () => _addSquare(),
            child: const Text('Get Center Of Map'),
          ),
          ElevatedButton(
            onPressed: (){
              widget.controller.runJavaScript('load_projJs()').then((value) =>
                  print("=========== 1 DONE ")
              );
            },
            child: const Text('Load Proj()'),
          ),
          ElevatedButton(
            onPressed: (){
              widget.controller.runJavaScriptReturningResult('call_draw_new(${new_center_lat}, ${new_center_lng})').then((value) {
                print("Printing Result in flutter $value");

                List<dynamic> jsonArray = json.decode(value.toString()); // Assuming 'value' is an array
                List<UTM32> utm32List = jsonArray.map((json) => UTM32.fromJson(json)).toList();
                utm32List.forEach((element) {
                  element.lEnds!.forEach((elementA) {
                    print(elementA.x);
                    print(elementA.y);
                  });
                });
               }
              );
            },
            child: const Text('call draw()'),
          ),
        ],
      ),
    );
  }

  LatLng convert_wgs_to_utm(LatLng initialLatLng) {
    //Do required Conversions
    // Via CHATGPT, these co-ords are (551102.9063, 4173392.7112)
    return LatLng(551026.50, 4180151.72);
  }
}


