import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:webview_flutter/webview_flutter.dart';



Widget HomeScreen(BuildContext context, WebViewController controller){

  Completer<GoogleMapController> _mapController = Completer();
  Set<Polygon> _polygon = {};
  List<LatLng> _locations = [];
  Set<Marker> _marker = {};

  return Container(
    height: MediaQuery.of(context).size.height,
    width: MediaQuery.of(context).size.width,
    color: Colors.white,
    child: Stack(
      children: [
        GoogleMap(
          // onMapCreated: (){},
          polygons: _polygon,
          markers: _marker,
          initialCameraPosition: CameraPosition(
            target: LatLng(37.42796133580664, -122.085749655962),
            zoom: 10,
          ),
        )
      ],
    ),
  );
}