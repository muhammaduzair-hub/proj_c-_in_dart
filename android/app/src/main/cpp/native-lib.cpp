#include <cstring>
#include <jni.h>
#include <cinttypes>
#include <android/log.h>
#include <proj.h>
#include <iostream>
#include <string.h>

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_tinyrobots_MainActivity_projFWD(
    JNIEnv *env,
    jobject thiz,
    jdouble lat,
    jdouble lng)
{

    /* Create the context. */
    /* You may set C=PJ_DEFAULT_CTX if you are sure you will     */
    /* use PJ objects from only one thread                       */
    PJ_CONTEXT *C = proj_context_create();

    /* Create a projection. */
    PJ *P = proj_create(C, "+proj=utm +zone=32 +datum=WGS84 +type=crs");

    /* Get the geodetic CRS for that projection. */
    PJ *G = proj_crs_get_geodetic_crs(C, P);

    /* Create the transform from geodetic to projected coordinates.*/
    PJ_AREA *A = NULL;
    const char *const *options = NULL;
    PJ *G2P = proj_create_crs_to_crs_from_pj(C, G, P, A, options);

    /* Prepare the input */
    PJ_COORD c_in;
    c_in.lpzt.z = 0.0;
    c_in.lp.lam = lat;
    c_in.lp.phi = lng;

    PJ_COORD c_out = proj_trans(G2P, PJ_FWD, c_in);
    std::string result = std::to_string(c_out.xy.x) + "," + std::to_string(c_out.xy.y);

    /* Clean up */
    proj_destroy(P);
    proj_destroy(G);
    proj_destroy(G2P);
    proj_context_destroy(C);

    return env->NewStringUTF(result.c_str());
}


extern "C" JNIEXPORT jstring JNICALL
Java_com_example_tinyrobots_MainActivity_projREV(
    JNIEnv *env,
    jobject thiz,
    jdouble lat,
    jdouble lng)
{

    /* Create the context. */
    /* You may set C=PJ_DEFAULT_CTX if you are sure you will     */
    /* use PJ objects from only one thread                       */
    PJ_CONTEXT *C = proj_context_create();

    /* Create a projection. */
    PJ *P = proj_create(C, "+proj=utm +zone=32 +datum=WGS84 +type=crs");

    /* Get the geodetic CRS for that projection. */
    PJ *G = proj_crs_get_geodetic_crs(C, P);

    /* Create the transform from projected to geodetic coordinates.*/
    PJ_AREA *A = NULL;
    const char *const *options = NULL;
    PJ *P2G = proj_create_crs_to_crs_from_pj(C, P, G, A, options);

    /* Prepare the input */
    PJ_COORD c_in;
    c_in.xy.x = lat;
    c_in.xy.y = lng;
    c_in.xyzt.z = 0.0;

    PJ_COORD c_out = proj_trans(P2G, PJ_FWD, c_in);
    std::string result = std::to_string(c_out.lp.lam) + "," + std::to_string(c_out.lp.phi);

    /* Clean up */
    proj_destroy(P);
    proj_destroy(G);
    proj_destroy(P2G);
    proj_context_destroy(C);

    return env->NewStringUTF(result.c_str());
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_example_tinyrobots_MainActivity_projINV(
    JNIEnv *env,
    jobject thiz,
    jdouble lat,
    jdouble lng)
{

    /* Create the context. */
    /* You may set C=PJ_DEFAULT_CTX if you are sure you will     */
    /* use PJ objects from only one thread                       */
    PJ_CONTEXT *C = proj_context_create();

    /* Create a projection. */
    PJ *P = proj_create(C, "+proj=WGS84 +datum=utm +zone=32 +type=crs");

    /* Get the geodetic CRS for that projection. */
    PJ *G = proj_crs_get_geodetic_crs(C, P);

    /* Create the transform from geodetic to projected coordinates.*/
    PJ_AREA *A = NULL;
    const char *const *options = NULL;
    PJ *G2P = proj_create_crs_to_crs_from_pj(C, G, P, A, options);

    /* Prepare the input */
    PJ_COORD c_in;
    c_in.lpzt.z = 0.0;
    c_in.lp.lam = lat;
    c_in.lp.phi = lng;

    PJ_COORD c_out = proj_trans(G2P, PJ_INV, c_in);
    std::string result = std::to_string(c_out.xy.x) + "," + std::to_string(c_out.xy.y);

    /* Clean up */
    proj_destroy(P);
    proj_destroy(G);
    proj_destroy(G2P);
    proj_context_destroy(C);

    return env->NewStringUTF(result.c_str());
}


extern "C" JNIEXPORT void JNICALL
Java_com_example_tinyrobots_MainActivity_projContext(
    JNIEnv *env,
    jobject thiz
    )
{

     // Create a new proj_context object
      // PJ_CONTEXT *C = proj_context_create();

        // Create a new DirectByteBuffer object from the context pointer
        //jobject byteBuffer = env->NewDirectByteBuffer(C, sizeof(PJ_CONTEXT));

        // Return the DirectByteBuffer object
        //return byteBuffer;
}