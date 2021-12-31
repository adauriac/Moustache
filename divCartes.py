#!/usr/bin/env python
import os,sys,subprocess
from sys import exit,argv
from os import popen,system
sys.path.append("/mnt/diskc/1/dauriac/lib")
def w(x):sys.stdout.writelines(x)

import jc2 as jc
files = jc.ls("*.gif")
for f in files:
    print('<div class="mydiv"> <img src="%s"> </div>'%f)

