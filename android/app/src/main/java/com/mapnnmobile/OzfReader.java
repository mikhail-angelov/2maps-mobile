package com.mapnnmobile;


import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;

import android.graphics.Bitmap;
import android.util.Log;

import com.jhlabs.Point2D;
import com.jhlabs.map.proj.Projection;

class LinearBinding
{
    double[] Kx = new double[3];
    double[] Ky = new double[3];
    double[] Klat = new double[3];
    double[] Klon = new double[3];
}

public class OzfReader {
    private int source;
    private double factor;
    private byte zoomKey;
    private OzfFile ozf;
    public String imagePath;
    public String path;
    public String title;

    public String datum;

    public static transient int viewportWidth;
    public static transient int viewportHeight;

    protected Projection projection;
    protected MapPoint[] cornerMarkers;
    protected double mpp;

    protected boolean isActive = false;
    protected boolean isCurrent = false;

    protected double zoom = 1.;

//    protected transient Bounds bounds;
    protected transient Path mapClipPath;

    protected transient int width;
    protected transient int height;
    public String origDatum;
    public double scaleFactor = 1.;
    public String prjName;
    public Grid llGrid;
    public Grid grGrid;
    LinearBinding binding;
    public ArrayList<MapPoint> calibrationPoints = new ArrayList<>();

    public OzfReader(File file) throws IOException, OutOfMemoryError {
        ozf = OzfDecoder.open(file);
        setZoom(1.0);
        binding = new LinearBinding();
        bind();
    }

    public double getZoom() {
        return zoom;
    }

    protected double setZoom(double zoom) {
        this.zoom = zoom;

        double b = ozf.height();
        int k = 0;
        double delta = Double.MAX_VALUE;
        double ozf_zoom = 1;

        for (int i = 0; i < ozf.scales; i++) {
            double a = OzfDecoder.scale_dy(ozf, i);

            double tenpercents = Math.round((a / b) * 1000);
            double z = tenpercents / 1000;

            // if current zoom is < 100% - we need to select
            // nearest upper native zoom
            // otherwize we need to select
            // any nearest zoom

            if (this.zoom < 1.0)
                if (this.zoom > z)
                    continue;

            double d = Math.abs(z - this.zoom);
            if (d < delta) {
                delta = d;
                k = i;
                ozf_zoom = z;
            }
        }

        source = k;
        factor = this.zoom / ozf_zoom;
        zoomKey = (byte) (this.zoom * 50);

        Log.d("OZF", String.format("zoom: %f, selected source scale: %f (%d), factor: %f", this.zoom, ozf_zoom, source, factor));

        return this.zoom;
    }

    public void close() {
        OzfDecoder.close(ozf);
    }

    public double map_x_to_c(int map_x) {
        return map_x / (OzfDecoder.OZF_TILE_WIDTH * factor);
    }

    public double map_y_to_r(int map_y) {
        return map_y / (OzfDecoder.OZF_TILE_HEIGHT * factor);
    }

    public int[] map_xy_to_cr(int[] map_xy) {
        int[] cr = new int[2];

        cr[0] = (int) (Math.abs(map_xy[0]) / (OzfDecoder.OZF_TILE_WIDTH * factor));
        cr[1] = (int) (Math.abs(map_xy[1]) / (OzfDecoder.OZF_TILE_HEIGHT * factor));

        return cr;
    }

    public int[] map_xy_to_xy_on_tile(int[] map_xy) {
        int[] cr = map_xy_to_cr(map_xy);
        int[] xy = new int[2];

        xy[0] = (int) Math.round(map_xy[0] - cr[0] * (OzfDecoder.OZF_TILE_WIDTH * factor));
        xy[1] = (int) Math.round(map_xy[1] - cr[1] * (OzfDecoder.OZF_TILE_HEIGHT * factor));

        return xy;
    }

    public int tile_dx() {
        return tile_dx(0, 0);
    }

    public int tile_dy() {
        return tile_dy(0, 0);
    }

    public int tile_dx(int c, int r) {
        if (c > tiles_per_x() - 1 || r > tiles_per_y() - 1) {
            return 0;
        }

        double dx = OzfDecoder.OZF_TILE_WIDTH;

        if (c == tiles_per_x() - 1) {
            int w = OzfDecoder.scale_dx(ozf, source);
            dx = w - (w / OzfDecoder.OZF_TILE_WIDTH) * OzfDecoder.OZF_TILE_WIDTH;
            if (dx == 0)
                dx = OzfDecoder.OZF_TILE_WIDTH;
        }

        return (int) (dx * factor);
    }

    public int tile_dy(int c, int r) {
        if (c > tiles_per_x() - 1 || r > tiles_per_y() - 1)
            return 0;

        double dy = OzfDecoder.OZF_TILE_HEIGHT;

        if (r == tiles_per_y() - 1) {
            int h = OzfDecoder.scale_dy(ozf, source);
            dy = h - (h / OzfDecoder.OZF_TILE_HEIGHT) * OzfDecoder.OZF_TILE_HEIGHT;
            if (dy == 0)
                dy = OzfDecoder.OZF_TILE_HEIGHT;
        }

        return (int) (dy * factor);
    }

    public int tiles_per_x() {
        return OzfDecoder.num_tiles_per_x(ozf, source);
    }

    public int tiles_per_y() {
        return OzfDecoder.num_tiles_per_y(ozf, source);
    }

    public Bitmap tile_get(int c, int r) throws OutOfMemoryError {
        if (c < 0 || c > tiles_per_x() - 1)
            return null;

        if (r < 0 || r > tiles_per_y() - 1)
            return null;


        Bitmap tileBitmap = null;

        int w = OzfDecoder.OZF_TILE_WIDTH;
        int h = OzfDecoder.OZF_TILE_HEIGHT;
        if (OzfDecoder.useNativeCalls && factor < 1.0) {
            w = (int) (factor * w);
            h = (int) (factor * h);
        }
        int[] data = OzfDecoder.getTile(ozf, source, c, r, w, h);
        if (data != null) {
            tileBitmap = Bitmap.createBitmap(w, h, Bitmap.Config.RGB_565);
            tileBitmap.setPixels(data, 0, w, 0, 0, w, h);
        }
        if (tileBitmap == null)
            return null;
        if (factor > 1.0 || (!OzfDecoder.useNativeCalls && factor < 1.0)) {
            int sw = (int) (factor * OzfDecoder.OZF_TILE_WIDTH);
            int sh = (int) (factor * OzfDecoder.OZF_TILE_HEIGHT);
            Bitmap scaled = Bitmap.createScaledBitmap(tileBitmap, sw, sh, false);
            tileBitmap = scaled;
        }

        return tileBitmap;
    }


    void getXYByLatLon(double lat, double lon, int[] xy)
    {
        double nn, ee;

        Point2D.Double src = new Point2D.Double(lon, lat);
        Point2D.Double dst = new Point2D.Double();
        projection.transform(src.x, src.y, dst);
        ee = dst.x;
        nn = dst.y;
        xy[0] = (int) Math.round(binding.Kx[0]*nn + binding.Kx[1]*ee + binding.Kx[2]);
        xy[1] = (int) Math.round(binding.Ky[0]*nn + binding.Ky[1]*ee + binding.Ky[2]);

//        return (xy[0] >= 0 && xy[0] < width * zoom && xy[1] >= 0 && xy[1] < height * zoom);
    }
    public void bind()
    {
        MapPoint[] points = new MapPoint[calibrationPoints.size()];

        int i = 0;
        for (MapPoint mp : calibrationPoints)
        {
            points[i] = new MapPoint();
            points[i].lat = mp.lat;
            points[i].lon = mp.lon;
            points[i].x = (int) (mp.x * zoom);
            points[i].y = (int) (mp.y * zoom);
            Point2D.Double src = new Point2D.Double(points[i].lon, points[i].lat);
            Point2D.Double dst = new Point2D.Double();
            projection.transform(src.x, src.y, dst);
            points[i].n = dst.y;
            points[i].e = dst.x;
			Log.e("OZI","point transform: "+points[i].lat+" "+points[i].lon+" -> "+points[i].n+" "+points[i].e);
            src.x = dst.x;
            src.y = dst.y;
            projection.inverseTransform(src, dst);
			Log.e("OZI","point reverse transform: "+src.y+" "+src.x+" -> "+dst.y+" "+dst.x);
            i++;
        }

        getKx(points);
        getKy(points);
        getKLat(points);
        getKLon(points);
    }

    private void getKx(MapPoint[] points)
    {
        double[][] a = new double[3][3];
        double[] b = new double[3];
        double[][] p = new double[3][points.length];

        int i = 0;
        for (MapPoint mp : points)
        {
            p[0][i] = mp.n;
            p[1][i] = mp.e;
            p[2][i] = mp.x;
            i++;
        }

        init_3x3(a, b, p, points.length);
        gauss(a, b, binding.Kx, 3);
        //Log.e("OZI", "Kx: "+binding.Kx[0]+","+binding.Kx[1]+","+binding.Kx[2]);
    }

    private void getKy(MapPoint[] points)
    {
        double[][] a = new double[3][3];
        double[] b = new double[3];
        double[][] p = new double[3][points.length];

        int i = 0;
        for (MapPoint mp : points)
        {
            p[0][i] = mp.n;
            p[1][i] = mp.e;
            p[2][i] = mp.y;
            i++;
        }

        init_3x3(a, b, p, points.length);
        gauss(a, b, binding.Ky, 3);
        //Log.e("OZI", "Ky: "+binding.Ky[0]+","+binding.Ky[1]+","+binding.Ky[2]);
    }

    private void getKLat(MapPoint[] points)
    {
        double[][] a = new double[3][3];
        double[] b = new double[3];
        double[][] p = new double[3][points.length];

        int i = 0;
        for (MapPoint mp : points)
        {
            p[0][i] = mp.x;
            p[1][i] = mp.y;
            p[2][i] = mp.n;
            i++;
        }

        init_3x3(a, b, p, points.length);
        gauss(a, b, binding.Klat, 3);
        //Log.e("OZI", "Klat: "+binding.Klat[0]+","+binding.Klat[1]+","+binding.Klat[2]);
    }

    private void getKLon(MapPoint[] points)
    {
        double[][] a = new double[3][3];
        double[] b = new double[3];
        double[][] p = new double[3][points.length];

        int i = 0;
        for (MapPoint mp : points)
        {
            p[0][i] = mp.x;
            p[1][i] = mp.y;
            p[2][i] = mp.e;
            i++;
        }

        init_3x3(a, b, p, points.length);
        gauss(a, b, binding.Klon, 3);
        //Log.e("OZI", "Klon: "+binding.Klon[0]+","+binding.Klon[1]+","+binding.Klon[2]);
    }

    /**
     *  Solves linear equation.  Finds vector x such that ax = b.
     *
     *	@param a nXn matrix
     *	@param b vector size n
     *	@param x vector size n
     *	@param n number of variables (size of vectors) (must be > 1)
     *
     *	This function will alter a and b, and put the solution in x.
     *	@return true if the solution was found, false otherwise.
     */
    private boolean gauss(double[][] a, double[] b, double[] x, int n)
    {
        int i,j,k;
        int ip = 0, kk, jj;
        double temp;
        double pivot;
        double q;

        /*
         *	transform matrix to echelon form.
         */
        for (i = 0; i < n-1; i++)
        {
            /*
             *	Find the pivot.
             */
            pivot = 0.0;
            for (j = i; j < n; j++)
            {
                temp = Math.abs(a[j][i]);
                if (temp > pivot)
                {
                    pivot = temp;
                    ip = j;
                }
            }

            if (pivot < 1.E-14)
            {
                /*
                 *   Error - singular matrix.
                 */
                return false;
            }

            /*
             *	Move the pivot row to the ith position
             */
            if (ip != i)
            {
                double[] temp_p = a[i];
                a[i] = a[ip];
                a[ip] = temp_p;
                temp = b[i];
                b[i] = b[ip];
                b[ip] = temp;
            }

            /*
             *	Zero entries below the diagonal.
             */
            for (k = i + 1; k < n; k++)
            {
                q = -a[k][i] / a[i][i];

                a[k][i] = 0.0;

                for (j = i + 1; j < n; j++)
                    a[k][j] = q * a[i][j] + a[k][j];
                b[k] = q * b[i] + b[k];
            }

        }

        if (Math.abs(a[n-1][n-1]) < 1.E-14)
        {
            return false;
        }

        /*
         *	Backsolve to obtain solution vector x.
         */
        kk = n - 1;
        x[kk] = b[kk] / a[kk][kk];
        for (k = 0; k < n - 1; k++)
        {
            kk = n - k - 2;
            q = 0.0;

            for (j = 0; j <= k; j++)
            {
                jj = n - j - 1;
                q = q + a[kk][jj] * x[jj];
            }
            x[kk] = (b[kk] - q) / a[kk][kk];
        }

        return true;
    }

    private void init_3x3(double[][] a, double[] b, double[][] p, int size)
    {
        for (int i = 0; i < 3; i++)
        {
            b[i] = 0;

            for (int j = 0; j < 3; j++)
                a[i][j] = 0;
        }

        for(int i = 0; i < size; i++)
        {
            a[0][0] += p[0][i] * p[0][i];
            a[0][1] += p[0][i] * p[1][i];
            a[0][2] += p[0][i];
            a[1][1] += p[1][i] * p[1][i];
            a[1][2] += p[1][i];
            b[0] += p[2][i] * p[0][i];
            b[1] += p[2][i] * p[1][i];
            b[2] += p[2][i];
        }

        a[1][0] = a[0][1];
        a[2][0] = a[0][2];
        a[2][1] = a[1][2];
        a[2][2] = size;
    }

    public void addCalibrationPoint(MapPoint point)
    {
        calibrationPoints.add(point);
    }
    static double dms_to_deg(double deg, double min, double sec)
    {
        return deg + min / 60 + sec / 3600;
    }
    static MapPoint parsePoint(String[] fields, float scaleFactor)
    {
        MapPoint point = new MapPoint();
        //int n = Integer.parseInt(fields[0].substring("Point".length()));
        if ("ex".equals(fields[4]))
            return null;
        try
        {
            point.x = (int) (Integer.parseInt(fields[2]) * scaleFactor);
        }
        catch (NumberFormatException e)
        {
            return null;
        }
        try
        {
            point.y = (int) (Integer.parseInt(fields[3]) * scaleFactor);
        }
        catch (NumberFormatException e)
        {
            return null;
        }
        try
        {
            int dlat = Integer.parseInt(fields[6]);
            double mlat = Double.parseDouble(fields[7]);
            String hlat = fields[8];
            point.lat = dms_to_deg(dlat, mlat, 0);
            if ("S".equals(hlat))
                point.lat = -point.lat;
        }
        catch (NumberFormatException e)
        {
        }
        try
        {
            int dlon = Integer.parseInt(fields[9]);
            double mlon = Double.parseDouble(fields[10]);
            String hlon = fields[11];
            point.lon = dms_to_deg(dlon, mlon, 0);
            if ("W".equals(hlon))
                point.lon = -point.lon;
        }
        catch (NumberFormatException e)
        {
        }
        try
        {
            point.zone = Integer.parseInt(fields[13]);
        }
        catch (NumberFormatException e)
        {
        }
        try
        {
            point.e = Double.parseDouble(fields[14]);
        }
        catch (NumberFormatException e)
        {
        }
        try
        {
            point.n = Double.parseDouble(fields[15]);
        }
        catch (NumberFormatException e)
        {
        }
        point.hemisphere = "S".equals(fields[16]) ? 1 : 0;
        return point;
    }
    public void setCornersAmount(int num)
    {
        cornerMarkers = new MapPoint[num];
        for (int i = 0; i < num; i++)
        {
            cornerMarkers[i] = new MapPoint();
        }
    }
    public boolean getLatLonByXY(int x, int y, double[] ll)
    {
        double nn, ee;

        nn = binding.Klat[0]*x + binding.Klat[1]*y + binding.Klat[2];
        ee = binding.Klon[0]*x + binding.Klon[1]*y + binding.Klon[2];

        Point2D.Double src = new Point2D.Double(ee, nn);
        Point2D.Double dst = new Point2D.Double();
        projection.inverseTransform(src, dst);
        ll[0] = dst.y;
        ll[1] = dst.x;

        return (x >= 0 && x < width * zoom && y >= 0 || y < height * zoom);
    }

}

