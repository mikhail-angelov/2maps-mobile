package com.mapnnmobile;

import androidx.test.core.app.ApplicationProvider;
import androidx.test.filters.SmallTest;
import androidx.test.runner.AndroidJUnit4;


import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;
import java.util.Set;

import static org.junit.Assert.*;

public class LocalHostTest {

    LocalHost localHost;
    @Before
    public void before(){
        localHost = LocalHost.createInstance(ApplicationProvider.getApplicationContext());
        try {
            localHost.start();
        }
        catch(IOException e) {
            e.printStackTrace();
        }
    }

    @After
    public void after() {
        //stop
    }

    @Test
    public void getMaps() {
        Set<String> maprs = localHost.getMaps();
        assertEquals(maprs.size(),3);
    }
}