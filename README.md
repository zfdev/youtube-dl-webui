# youtube-dl-webui

Another webui for youtube-dl powered by Flask.

[youtube-dl][1] is a powerful command-line based tool aims to download videos
from Youtube.com and a few more sites. However, it lacks a manager to control
and schedule all downloading tasks separately. Also, for people who like me
prefers to deploy downloading tasks on a home-server, the ability to manage
tasks remotely comes essentially.

There has been a webui for youtube available on Github, [Youtube-dl-WebUI][2].
The drawbacks of this project is that it writes in PHP and [youtube-dl][1]
writes in python. What makes things more worse is that, to use PHP, a web
server is needly inevitably. This complexes service deployment and makes it not
very 'light'.

**issues** are welcomed!

# Screenshot

![screenshot1](screen_shot/1.gif)

# Prerequisite

This project is writen under the **python 3.6**, I haven't test the codes in
any other python versions. So, I hightly recommend you to use python 3.6 to
avoid any troubles.

Also, we need **[ffmpeg](https://www.ffmpeg.org/download.html)** for post
processing. Lack of ffmpeg may case some funtions not working.

# Install

To install youtube-dl-webui, you have to firstly install [youtube-dl][1] and
[Flask][3], then simply execute the following command:

    python setup.py install

# How to use

Defaultly, youtube-dl-webui will find the configuration file in `/etc`
directory named `youtube-dl-webui.conf`. The configuration file, however,
need not to be always placed in such a place. Instead, the `-c` option is
used to point out the configuration file.

Configuration file is __json__ formatted. An example configuration file
can be found in the root directory of project.

Currently, not to much options available, use `-h` to find out all of them.

After everything is ready, simply execute:

    youtube-dl-webui -c CONFIGURATION_FILE

A server will be started locally. The default port is **5000**.

**Note**, you have to remove proxy configuration option in your config file. I
write it here for illustrating all valid config options.

# Docker image

There also exists a docker image to easy the deployment. Check [HERE][4] for
more.

---

[1]: https://github.com/rg3/youtube-dl
[2]: https://github.com/avignat/Youtube-dl-WebUI
[3]: https://github.com/pallets/flask
[4]: https://hub.docker.com/r/d0u9/youtube-dl-webui/

py -3 __main__.py -c config.json

https://www.youtube.com/watch?v=6mYw53V9RGM&list=RDaIB4lfXne_8


{
    "status": "downloading",
    "downloaded_bytes": 43169467,
    "total_bytes": 85694606,
    "tmpfilename": "\u3010\u7121\u9650HD\u30112019\u6de1\u6c34\u5927\u62dc\u62dc \u8df3\u8df3\u7cd6\u71b1\u821e4(4K HDR)-FmUJHLDWx8w.f137.mp4.part",
    "filename": "\u3010\u7121\u9650HD\u30112019\u6de1\u6c34\u5927\u62dc\u62dc \u8df3\u8df3\u7cd6\u71b1\u821e4(4K HDR)-FmUJHLDWx8w.f137.mp4",
    "eta": 2,
    "speed": 21229817.216811348,
    "elapsed": 12.288529396057129,
    "_eta_str": "00:02",
    "_percent_str": " 50.4%",
    "_speed_str": "20.25MiB/s",
    "_total_bytes_str": "81.72MiB"
}