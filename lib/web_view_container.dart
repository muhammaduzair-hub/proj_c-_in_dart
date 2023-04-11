import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:tinyrobots/ui/mapscreen.dart';
import 'dart:io';



import 'package:webview_flutter/webview_flutter.dart';
// Import for Android features.
import 'package:webview_flutter_android/webview_flutter_android.dart';
// Import for iOS features.
import 'package:webview_flutter_wkwebview/webview_flutter_wkwebview.dart';


class WebViewContainer extends StatefulWidget {
  const WebViewContainer({super.key});

  @override
  State<WebViewContainer> createState() => _WebViewContainerState();
}

class _WebViewContainerState extends State<WebViewContainer> {
  late final WebViewController _controller;
  final String url = 'http://192.168.100.5:8000/proj/proj_wasm.wasm';


  @override
  void initState() {
    super.initState();

    startLocalServer();
    loadProj4JSWasm();


    late final PlatformWebViewControllerCreationParams params;
    if (WebViewPlatform.instance is WebKitWebViewPlatform) {
      params = WebKitWebViewControllerCreationParams(
        allowsInlineMediaPlayback: true,
        mediaTypesRequiringUserAction: const <PlaybackMediaTypes>{},
      );
    } else {
      params = const PlatformWebViewControllerCreationParams();
    }

    final WebViewController controller =
    WebViewController.fromPlatformCreationParams(params);

    controller
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(Colors.white)
      ..loadRequest(Uri.parse(url))
      ..loadFlutterAsset('asset/index.html');

    if (controller.platform is AndroidWebViewController) {
      AndroidWebViewController.enableDebugging(true);
      (controller.platform as AndroidWebViewController)
          .setMediaPlaybackRequiresUserGesture(false);
    }

    _controller = controller;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.green,
      appBar: AppBar(
        title: const Text('Tiny Mobile Project - Sample'),
      ),
      body: Stack(
          children: [
            WebViewWidget(controller: _controller),
            MapScreen(controller: _controller,),
            // Row(
            //   mainAxisAlignment: MainAxisAlignment.spaceBetween,
            //   children: [
            //     ElevatedButton(
            //       style: ButtonStyle(backgroundColor: MaterialStateProperty.all(Colors.red), foregroundColor:MaterialStateProperty.all(Colors.white)),
            //         onPressed: (){
            //
            //         },
            //         child: Text("Add a Square"),),
            //     ElevatedButton(
            //       style: ButtonStyle(backgroundColor: MaterialStateProperty.all(Colors.red), foregroundColor:MaterialStateProperty.all(Colors.white)),
            //       onPressed: (){
            //
            //       },
            //       child: Text("Delete a Square"),),
            //   ],
            // ),


      ]),
      // floatingActionButton: favoriteButton(),
    );
  }

  Widget favoriteButton() {
    return FloatingActionButton(
      onPressed: () async {
        _controller.runJavaScript('load_projJs()').then((value) =>
            print("===========")
        );
      },
      child: const Icon(Icons.downloading_rounded),
    );}

  void startLocalServer() async {
    HttpServer server = await HttpServer.bind(url, 80);
    print('Local server started on https://localhost:443');

    server.listen((HttpRequest request) async {

      String filePath = 'asset/wasm/proj/proj_wasm.wasm';
      File file = File(filePath);
      if (await file.exists()) {
        List<int> bytes = await file.readAsBytes();
        request.response
          ..headers.contentType = ContentType.binary
          ..add(bytes)
          ..close();
      } else {
        request.response
          ..statusCode = HttpStatus.notFound
          ..write('File not found')
          ..close();
      }
    });
  }

  Future<void> loadProj4JSWasm() async {
    final response = await http.get(Uri.parse(url));

    if (response.statusCode == 200) {
      final bytes = response.bodyBytes;
      print("************************Done: bytes");
    } else {
      throw Exception('Failed to load Proj4JS WASM file: ${response.statusCode}');
    }
  }

}
