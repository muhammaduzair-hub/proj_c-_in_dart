package com.example.tinyrobots

import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import kotlin.text.toDouble

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.example.tinyrobots/proj"
    private lateinit var channel: MethodChannel

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        channel = MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
        channel.setMethodCallHandler { call, result ->
            val argument = call.arguments() as Map<String, String>?
            var lat: Double? = 0.0
            var lng: Double? = 0.0
            if (argument?.contains("lat") == true) {
                lat = argument["lat"]?.toDouble()
                lng = argument["lng"]?.toDouble()
            }

            if (call.method == "projContext") {
                // Retrieve the proj_context pointer from the native code
//                val context : Long =
                    projContext()
                result.success(null)
            }

            if (call.method == "projFWD") {
                val coords: String = projFWD(lat!!, lng!!)
                result.success(coords)
            }

            if(call.method == "projREV"){
                val coords: String = projREV(lat!!, lng!!)
                result.success(coords)
            }

            if (call.method == "projINV") {
                val coords: String = projINV(lat!!, lng!!)
                result.success(coords)
            }
        }
    }
    // Native function to retrieve the proj_context pointer
    external fun projContext(): Long

    // Native functions to project coordinates
    external fun projFWD(lat: Double, lng: Double): String
    external fun projINV(lat: Double, lng: Double): String
    external fun projREV(lat: Double, lng: Double): String


    companion object {
        // Used to load the 'ttt' library on application startup.
        init {
            System.loadLibrary("proj-libs")
        }
    }
}
