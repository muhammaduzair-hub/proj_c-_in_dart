import 'package:flutter/services.dart';

class ProjDart {
  static const Channel = MethodChannel('com.example.tinyrobots/proj');

  //a method that invoke native code
  //convert wgs to utm
  Future<String> projFWD({required String lat, required String lng}) async {
    final String result = await Channel.invokeMethod(
        'projFWD', <String, String>{'lat': lat, 'lng': lng});
    return result;
  }

  //dont use this right now
  Future<String> projINV({required String eas, required String north}) async {
    final String result = await Channel.invokeMethod(
        'projINV', <String, String>{'lat': eas, 'lng': north});
    return result;
  }

  //convert utm to wgs
  Future<String> projREV({required String eas, required String north}) async {
    final String result = await Channel.invokeMethod(
        'projREV', <String, String>{'lat': eas, 'lng': north});
    return result;
  }

  //dont use this right now
  Future<dynamic> projContext() async {
    final dynamic result = await Channel.invokeMethod(
        'projContext', <String, String>{'lat': '', 'lng': ''});
    return result;
  }
}
