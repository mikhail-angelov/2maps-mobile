package com.mapnnmobile;

import java.io.Serializable;

public class Grid implements Serializable
{
	private static final long serialVersionUID = 1L;
	
	public boolean enabled;
	public double spacing;
	public boolean autoscale;
	public int color1;
	public int color2;
	public int color3;
	public double labelSpacing;
	public int labelForeground;
	public int labelBackground;
	public int labelSize;
	public boolean labelShowEverywhere;
	public int maxMPP = 0;
}
