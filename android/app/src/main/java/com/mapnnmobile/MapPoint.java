package com.mapnnmobile;


import java.io.Serializable;

public class MapPoint implements Serializable
{
    private static final long serialVersionUID = 2L;

    public int x;
    public int y;

    public double lat;
    public double lon;

    public int zone;
    public double n;
    public double e;
    public int hemisphere;

    public MapPoint()
    {
    }

    public MapPoint(MapPoint mp)
    {
        this.x = mp.x;
        this.y = mp.y;
        this.zone = mp.zone;
        this.n = mp.n;
        this.e = mp.e;
        this.hemisphere = mp.hemisphere;
        this.lat = mp.lat;
        this.lon = mp.lon;
    }
}