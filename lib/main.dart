import 'package:flutter/material.dart';
import 'package:tinyrobots/proj_bridge/proj_dart.dart';
import 'package:tinyrobots/web_view_container.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: WebViewContainer()//const MyHomePage(title: 'Tiny Robots (Proj)'),
    );
  }
}

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});
  final String title;
  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  String lat = "10.18719290796157", lng = "56.04176569914437";

  String eas = "573960.7699930719", north = "6211363.610963231";
  ProjDart projBridge = ProjDart();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
      ),
      body: Center(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 20),
              child: const Text(
                "wgs84 to utm32 Coordinate",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 25),
              ),
            ),
            const Text(
              "wgs84Coordinate",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
            const Padding(padding: EdgeInsets.all(5)),
            Text(
              "$lat,$lng",
              style:
                  const TextStyle(fontWeight: FontWeight.normal, fontSize: 16),
            ),
            const Padding(padding: EdgeInsets.all(20)),
            const Text(
              "utmCoordinate",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
            const Padding(padding: EdgeInsets.all(5)),
            FutureBuilder(
              future: projBridge.projFWD(lat: lat, lng: lng),
              builder: (context, snapshot) {
                return Text(
                  snapshot.data!,
                  style: const TextStyle(
                      fontWeight: FontWeight.normal, fontSize: 16),
                );
              },
            ),
            Divider(thickness: 2),
            const Padding(
              padding: EdgeInsets.only(bottom: 20),
              child: Text(
                "utm32 to wgs84 Coordinate",
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 25),
              ),
            ),
            const Text(
              "utmCoordinate",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
            Text("$eas, $north"),
            const Padding(padding: EdgeInsets.all(20)),
            const Text(
              "wgs84Coordinate",
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
            ),
            FutureBuilder(
              future: projBridge.projREV(eas: eas, north: north),
              builder: (context, snapshot) {
                return Text(
                  snapshot.data!,
                  style: const TextStyle(
                      fontWeight: FontWeight.normal, fontSize: 16),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
