package com.mapnnmobile;

import android.graphics.Bitmap;
import android.util.Log;

import androidx.test.core.app.ApplicationProvider;

import com.jhlabs.Point2D;
import com.jhlabs.map.proj.Projection;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.junit.Assert.*;

public class OzfDecoderTest {

    OzfDecoder ozfDecoder;
    @Before
    public void before(){
        ozfDecoder = new OzfDecoder();
    }

    @After
    public void after() {
        //stop
    }

    @Test
    public void getTile() throws IOException {
        //56.317679,44.004364
        //https://2map.xyz/tiles/mende-nn/12/2548/1268.jpg
        OzfReader of = OzfMap.load("/sdcard/Download/pgm-nizhegorodskiy-uezd","utf8");


//        of.setZoom(10.0);
        int xy[] = new int[] {0,0};
        double ll[] = new double[] {0.0,0.0};
        of.getLatLonByXY(0,0, ll);
        Log.d("test ",String.format("lat lng - 0 %f - %f",ll[0], ll[1]));
        of.getLatLonByXY(110,110, ll);
        Log.d("test ",String.format("lat lng - 2 %f - %f",ll[0], ll[1]));

        of.getXYByLatLon(56.317679,44.004364, xy);

        Log.d("test ",String.format("tile %f - %d - %d",of.getZoom(), of.tiles_per_x(), of.tiles_per_y()));

        Log.d("test ",String.format("lat lng %d - %d",xy[0], xy[1]));


        Bitmap bitmap = of.tile_get(110,110);
        if(bitmap == null){
            Log.d("test","no bitmap");
            return;
        }
        Log.d("test",String.format("bitmap %d",bitmap.getByteCount()));

        File file = new File("/sdcard/Download/bump.png");
        FileOutputStream fOut = new FileOutputStream(file);
        bitmap.compress(Bitmap.CompressFormat.PNG, 85, fOut);
        fOut.flush();
        fOut.close();
    }
}