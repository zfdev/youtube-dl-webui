from __future__ import unicode_literals
import youtube_dl


class MyLogger(object):
    def debug(self, msg):
        print(msg)

    def warning(self, msg):
        print(msg)

    def error(self, msg):
        print(msg)


def my_hook(d):
    print(d)
    if d['status'] == 'finished':
        print('Done downloading, now converting ...')


ydl_opts = {
    'noplaylist': False,
    "proxy": "socks5://127.0.0.1:10808",
    "format": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best",
    'logger': MyLogger(),
    'progress_hooks': [my_hook],
}
with youtube_dl.YoutubeDL(ydl_opts) as ydl:
    #    ydl.download(['http://www.youtube.com/watch?v=BaW_jenozKc'])
    ydl.download(
        ['https://www.youtube.com/watch?v=JGwWNGJdvx8&list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG'])
